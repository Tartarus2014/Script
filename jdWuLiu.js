/**
 * 京东多账号-物流派件提醒
 * 派送状态会跑一次，通知一次
 * 超过30天的订单，不通知不显示
 *
 *
 * > 同时支持使用 NobyDa 与 domplin 脚本的京东 cookie
 * > https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js
 * > https://raw.githubusercontent.com/dompling/Script/master/jd/JD_extra.js
 *
 * # Surge
 * Tasks: 京东物流派件提醒 = type=cron,cronexp=0 12 * * *,script-path=https://raw.githubusercontent.com/id77/QuantumultX/master/task/jdWuLiu.js,wake-system=true
 *
 * # QuanX
 * 0 12 * * * https://raw.githubusercontent.com/id77/QuantumultX/master/task/jdWuLiu.js, tag=京东物流派件提醒, img-url=https://raw.githubusercontent.com/id77/QuantumultX/master/icon/jdWuLiu.png
 *
 * # Loon
 * cron "0 12 * * *" script-path=https://raw.githubusercontent.com/id77/QuantumultX/master/task/jdWuLiu.js
 *
 */
const $ = new Env('京东物流');
$.SESSION_KEY = 'id77_jdWulLiu';
$.PAGE_MAX_KEY = 'id77_jdWulLiu_pageMax';
$.CARRIAGE_ID_ARR_KEY = 'id77_carriageIdArr';
$.pageMax = $.getData($.PAGE_MAX_KEY) || 10;
$.carriageIdArr = JSON.parse($.getData($.CARRIAGE_ID_ARR_KEY) || '[]');
$.isMuteLog = true;
$.page = 1;

// 清除错误数据
$.carriageIdArr[0] &&
  Array.isArray($.carriageIdArr[0]) &&
  $.carriageIdArr.splice(0, 1);

let cookies = [];
$.getData('CookieJD') && cookies.push($.getData('CookieJD'));
$.getData('CookieJD2') && cookies.push($.getData('CookieJD2'));

const extraCookies = JSON.parse($.getData('CookiesJD') || '[]').map(
  (item) => item.cookie
);
cookies = Array.from(new Set([...cookies, ...extraCookies]));

const opts = {
  headers: {
    Accept: `*/*`,
    Connection: `keep-alive`,
    Host: `wq.jd.com`,
    'Accept-Language': 'zh-cn',
    'Accept-Encoding': 'gzip, deflate, br',
    'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 14_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148 Safari/604.1`,
  },
};

!(async () => {
  let cookie, userInfo, orderList, order, wuLiuDetail;

  for (let index = 0; index < cookies.length; index++) {
    cookie = cookies[index];
    opts.headers.Cookie = cookie;

    userInfo = await getUserInfo();
    orderList = [];

    for (let p = 1; p <= $.pageMax / 10; p++) {
      $.page = p;

      orderList = [...orderList, ...(await getOrderList())];
    }

    for (let k = 0; k < orderList.length; k++) {
      const {
        orderId,
        stateInfo: { stateName },
      } = orderList[k];
      
      if(k === 0) {
        console.log('====================================');
        console.log(`🙆🏻‍♂️账号：${userInfo.baseInfo.nickname}`);
      }
      // 忽略取消订单以及非实物订单
      if (stateName !== '已取消' && stateName !== '退款成功' && stateName !== '处理成功') {
        wuLiuDetail = await getWuLiu(orderId);

        await showMsg(userInfo, wuLiuDetail, orderId);
      }
    }
  }
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done());

function getUserInfo() {
  return new Promise((resolve) => {
    opts.url =
      'https://wq.jd.com/user_new/info/GetJDUserInfoUnion?orgFlag=JD_PinGou_New&callSource=mainorder&channel=4&isHomewhite=0&sceneval=2&sceneval=2&g_login_type=1g_ty=ls';
    opts.headers.Referer = `https://home.m.jd.com/myJd/home.action`;

    $.get(opts, (err, resp, data) => {
      let userInfo;

      try {
        userInfo = JSON.parse(data).data.userInfo;
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(userInfo);
      }
    });
  });
}

function getOrderList() {
  return new Promise((resolve) => {
    opts.url = `https://wq.jd.com/bases/orderlist/list?order_type=0&start_page=${$.page}&page_size=10`;
    opts.headers.Referer = `https://wqs.jd.com/order/orderlist_merge.shtml?sceneval=2&orderType=waitReceipt`;

    $.get(opts, (err, resp, data) => {
      let orderList;

      try {
        orderList = JSON.parse(data).orderList;
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(orderList);
      }
    });
  });
}

function getWuLiu(orderId) {
  return new Promise((resolve) => {
    opts.url = `https://wq.jd.com/bases/wuliudetail/dealloglist?deal_id=${orderId}`;
    opts.headers.Referer = `https://wqs.jd.com/order/deal_wuliu.shtml?from=orderdetail&dealState=15&dealId=${orderId}&orderType=18&sceneval=2`;

    $.get(opts, (err, resp, data) => {
      let detail;

      try {
        detail = JSON.parse(data);
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve(detail);
      }
    });
  });
}

function showMsg(userInfo, wuLiuDetail, orderId) {
  return new Promise((resolve) => {
    const {
      carrier,
      carriageId,
      recvMobile,
      orderWareList,
      dealLogList,
    } = wuLiuDetail;
    // 部分订单属于敏感信息，收货之后，物流信息不会返回
    // 比如购药订单
    if (!dealLogList) {
      return resolve();
    }
    const index = dealLogList.length - 1;
    const dealLog =
      dealLogList.length > 0 ? dealLogList[index].wlStateDesc : '无';
    // 0006 派送
    // 0008 可能代签收/快递柜/物流寄存点
    const wuLiuStateCode = dealLogList[index].groupType;

    const _30DayBefore = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const { createTime } = dealLogList[index];

    // 清空派送超过30天的记录
    if (_30DayBefore > new Date(createTime.replace(/\-/g, '/')).getTime()) {
      $.setData(
        JSON.stringify($.carriageIdArr.filter((item) => item !== carriageId)),
        $.CARRIAGE_ID_ARR_KEY
      );

      return resolve();
    }

    $.name = `京东物流 账号：${userInfo.baseInfo.nickname}`;
    $.subt = ``;
    $.desc = `📦${carrier}：${carriageId}\n📱手机尾号：${recvMobile.slice(
      -4
    )}\n🚚最新物流：${dealLog}`;
    $.state = `🚥当前状态：${
      wuLiuStateCode === '0008'
        ? '🟢签收'
        : wuLiuStateCode === '0006'
        ? '🟡派送'
        : '🔴运输'
    }`;
    $.info = `📗商品数目：${
      orderWareList.length
    }\n📘订单编号：${orderId}\n📕包含商品：${orderWareList[0].itemName.slice(
      0,
      20
    )}\n`;
    $.imgPath = `https://img30.360buyimg.com/jdwlcms/${orderWareList[0].itemImgPath}`;

    console.log($.subt);
    console.log($.desc);
    console.log($.state);
    console.log($.info);
    console.log('------------------------------------');

    // 已通知过的快递，跳过通知
    if ($.carriageIdArr.includes(carriageId)) {
      return resolve();
    }

    if (wuLiuStateCode !== '0006' && wuLiuStateCode !== '0008') {
      return resolve();
    }

    // 缓存 0008 状态，只通知一次
    if (wuLiuStateCode === '0008') {
      $.carriageIdArr.push(carriageId);

      $.setData(JSON.stringify($.carriageIdArr), $.CARRIAGE_ID_ARR_KEY);
    }

    $.msg($.name, $.subt, $.desc, {
      openUrl: `openjd://virtual?params=%7B%20%22category%22:%20%22jump%22,%20%22des%22:%20%22m%22,%20%22url%22:%20%22https://wqs.jd.com/order/n_detail_v2.shtml?deal_id=${orderId}%22%7D`,
      mediaUrl: $.imgPath,
    });

    resolve();
  });
}

// https://github.com/chavyleung/scripts/blob/master/Env.js
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getJson(t,e){let s=e;const i=this.getData(t);if(i)try{s=JSON.parse(this.getData(t))}catch{}return s}setjson(t,e){try{return this.setData(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getData("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getData("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getData(t){let e=this.getVal(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getVal(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setData(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getVal(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setVal(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setVal(JSON.stringify(o),i)}}else s=this.setVal(t,e);return s}getVal(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setVal(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};if(this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r))),!this.isMuteLog){let t=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}
