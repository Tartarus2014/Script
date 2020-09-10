#  http-response ^https://1008610010\.yohui\.vip/index\.php/Api/LiveApi/getMovietime,script-path=https://raw.githubusercontent.com/Tartarus2014/Script/master/aolige.js

#   mitm=1008610010.yohui.vip

#   下载链接   https://ok6.app


console.log($response.body);
let obj=JSON.parse($response.body);
/*obj={
  "data": {
    "status":1
  }
}
*/

obj.data.status=1

console.log(JSON.stringify(obj));
$done({body: JSON.stringify(obj)})

