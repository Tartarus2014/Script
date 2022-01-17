/***

Thanks to & modified from 
1. https://gist.githubusercontent.com/Hyseen/b06e911a41036ebc36acf04ddebe7b9a/raw/nf_check.js
2. https://github.com/AtlantisGawrGura/Quantumult-X-Scripts/blob/main/media.js
3. https://github.com/CoiaPrant/MediaUnlock_Test/blob/main/check.sh
4. https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/streaming-ui-check.js

For Loon 344+ ONLY!!

[script]

generic script-path=stream-ui-check.js, tag=流媒体-解锁查询, img-url=checkmark.seal.system, enabled=true



@XIAO_KOP

**/

const BASE_URL = 'https://www.netflix.com/title/';
const BASE_URL_YTB = "https://www.youtube.com/premium";
const BASE_URL_DISNEY = 'https://www.disneyplus.com';
const BASE_URL_Dazn = "https://startup.core.indazn.com/misl/v5/Startup";
const BASE_URL_Param = "https://www.paramountplus.com/"
const FILM_ID = 81215567
const BASE_URL_Discovery_token = "https://us1-prod-direct.discoveryplus.com/token?deviceId=d1a4a5d25212400d1e6985984604d740&realm=go&shortlived=true"
const BASE_URL_Discovery = "https://us1-prod-direct.discoveryplus.com/users/me"

const link = { "media-url": "https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/img/southpark/7.png" } 
const policy_name = "Netflix" //填入你的 netflix 策略组名

const arrow = " ➟ "

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'

// 即将登陆
const STATUS_COMING = 2
// 支持解锁
const STATUS_AVAILABLE = 1
// 不支持解锁
const STATUS_NOT_AVAILABLE = 0
// 检测超时
const STATUS_TIMEOUT = -1
// 检测异常
const STATUS_ERROR = -2

var inputParams = $environment.params;
var nodeName = inputParams.node;

var opts = {
    node: nodeName,
};

var opts1 = {
  node: nodeName,
  redirection: false
};


var flags = new Map([[ "AC" , "🇦🇨" ] ,["AE","🇦🇪"], [ "AF" , "🇦🇫" ] , [ "AI" , "🇦🇮" ] , [ "AL" , "🇦🇱" ] , [ "AM" , "🇦🇲" ] , [ "AQ" , "🇦🇶" ] , [ "AR" , "🇦🇷" ] , [ "AS" , "🇦🇸" ] , [ "AT" , "🇦🇹" ] , [ "AU" , "🇦🇺" ] , [ "AW" , "🇦🇼" ] , [ "AX" , "🇦🇽" ] , [ "AZ" , "🇦🇿" ] , ["BA", "🇧🇦"], [ "BB" , "🇧🇧" ] , [ "BD" , "🇧🇩" ] , [ "BE" , "🇧🇪" ] , [ "BF" , "🇧🇫" ] , [ "BG" , "🇧🇬" ] , [ "BH" , "🇧🇭" ] , [ "BI" , "🇧🇮" ] , [ "BJ" , "🇧🇯" ] , [ "BM" , "🇧🇲" ] , [ "BN" , "🇧🇳" ] , [ "BO" , "🇧🇴" ] , [ "BR" , "🇧🇷" ] , [ "BS" , "🇧🇸" ] , [ "BT" , "🇧🇹" ] , [ "BV" , "🇧🇻" ] , [ "BW" , "🇧🇼" ] , [ "BY" , "🇧🇾" ] , [ "BZ" , "🇧🇿" ] , [ "CA" , "🇨🇦" ] , [ "CF" , "🇨🇫" ] , [ "CH" , "🇨🇭" ] , [ "CK" , "🇨🇰" ] , [ "CL" , "🇨🇱" ] , [ "CM" , "🇨🇲" ] , [ "CN" , "🇨🇳" ] , [ "CO" , "🇨🇴" ] , [ "CP" , "🇨🇵" ] , [ "CR" , "🇨🇷" ] , [ "CU" , "🇨🇺" ] , [ "CV" , "🇨🇻" ] , [ "CW" , "🇨🇼" ] , [ "CX" , "🇨🇽" ] , [ "CY" , "🇨🇾" ] , [ "CZ" , "🇨🇿" ] , [ "DE" , "🇩🇪" ] , [ "DG" , "🇩🇬" ] , [ "DJ" , "🇩🇯" ] , [ "DK" , "🇩🇰" ] , [ "DM" , "🇩🇲" ] , [ "DO" , "🇩🇴" ] , [ "DZ" , "🇩🇿" ] , [ "EA" , "🇪🇦" ] , [ "EC" , "🇪🇨" ] , [ "EE" , "🇪🇪" ] , [ "EG" , "🇪🇬" ] , [ "EH" , "🇪🇭" ] , [ "ER" , "🇪🇷" ] , [ "ES" , "🇪🇸" ] , [ "ET" , "🇪🇹" ] , [ "EU" , "🇪🇺" ] , [ "FI" , "🇫🇮" ] , [ "FJ" , "🇫🇯" ] , [ "FK" , "🇫🇰" ] , [ "FM" , "🇫🇲" ] , [ "FO" , "🇫�" ] , [ "FR" , "🇫🇷" ] , [ "GA" , "🇬🇦" ] , [ "GB" , "🇬🇧" ] , [ "HK" , "🇭🇰" ] ,["HU","🇭🇺"], [ "ID" , "🇮🇩" ] , [ "IE" , "🇮🇪" ] , [ "IL" , "🇮🇱" ] , [ "IM" , "🇮🇲" ] , [ "IN" , "🇮🇳" ] , [ "IS" , "🇮🇸" ] , [ "IT" , "🇮🇹" ] , [ "JP" , "🇯🇵" ] , [ "KR" , "🇰🇷" ] , [ "LU" , "🇱🇺" ] , [ "MO" , "🇲🇴" ] , [ "MX" , "🇲🇽" ] , [ "MY" , "🇲🇾" ] , [ "NL" , "🇳🇱" ] , [ "PH" , "🇵🇭" ] , [ "RO" , "🇷🇴" ] , [ "RS" , "🇷🇸" ] , [ "RU" , "🇷🇺" ] , [ "RW" , "🇷🇼" ] , [ "SA" , "🇸🇦" ] , [ "SB" , "��🇧" ] , [ "SC" , "🇸🇨" ] , [ "SD" , "🇸🇩" ] , [ "SE" , "🇸🇪" ] , [ "SG" , "🇸🇬" ] , [ "TH" , "🇹🇭" ] , [ "TN" , "🇹🇳" ] , [ "TO" , "🇹🇴" ] , [ "TR" , "🇹🇷" ] , [ "TV" , "🇹🇻" ] , [ "TW" , "🇨🇳" ] , [ "UK" , "🇬🇧" ] , [ "UM" , "🇺🇲" ] , [ "US" , "🇺🇸" ] , [ "UY" , "🇺🇾" ] , [ "UZ" , "🇺🇿" ] , [ "VA" , "🇻🇦" ] , [ "VE" , "🇻🇪" ] , [ "VG" , "🇻🇬" ] , [ "VI" , "🇻🇮" ] , [ "VN" , "🇻🇳" ] , [ "ZA" , "🇿🇦"]])

let result = {
  "title": '    📺  流媒体服务查询',
  "YouTube": '<b>YouTube: </b>检测失败，请重试� ❗️',
  "Netflix": '<b>Netflix: </b>检测失败，请重试 ❗️',
  "Dazn": "<b>Dazn: </b>检测失败，请重试 ❗️",
  "Disney": "<b>Disneyᐩ: </b>检测失败，请重试 ❗️",
  "Paramount" : "<b>Paramountᐩ: </b>检测失败，请重试 ❗️",
  "Discovery" : "<b>Discoveryᐩ: </b>检测失败，请重试 ❗️",
  //"Google": "Google 定位: 检测失败，请重试"

}
// const message = {
//   action: "get_policy_state",
//   content: $environment.params
// };

;(async () => {
  testYTB()
  testDazn()
  testParam()
  let [{ region, status }] = await Promise.all([testDisneyPlus(),testNf(FILM_ID),testDiscovery()])
  console.log(result["Netflix"])
  console.log(`testDisneyPlus: region=${region}, status=${status}`)
  if (status==STATUS_COMING) {
    //console.log(1)
    result["Disney"] = "<b>Disneyᐩ:</b> ⚠️ 即将登陆 ➟ "+'⟦'+flags.get(region.toUpperCase())+"⟧"
  } else if (status==STATUS_AVAILABLE){
    //console.log(2)
    result["Disney"] = "<b>Disneyᐩ:</b> 支持 ➟ "+'⟦'+flags.get(region.toUpperCase())+"⟧ 🎉"
    console.log(result["Disney"])
  } else if (status==STATUS_NOT_AVAILABLE) {
    //console.log(3)
    result["Disney"] = "<b>Disneyᐩ:</b> 未支持 🚫 "
  } else if (status==STATUS_TIMEOUT) {
    result["Disney"] = "<b>Disneyᐩ:</b> 检测超时 🚦 "
  }

  let content = "--------------------------------------</br>"+([result["Dazn"],result["Discovery"],result["Paramount"],result["Disney"],result["Netflix"],result["YouTube"]]).join("</br></br>")
  content = content + "</br>--------------------------------------</br>"+"<font color=#CD5C5C>"+"<b>节点</b> ➟ " + nodeName+ "</font>"
  content =`<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">` + content + `</p>`
    // $notify(typeof(output),output)
  // console.log("done---------------------");
  console.log(content);
  $done({"title":result["title"],"htmlMessage":content})

})()
.finally(() => {
    $done({"title":result["title"],"htmlMessage":`<p style="text-align: center; font-family: -apple-system; font-size: large; font-weight: thin">`+'----------------------</br></br>'+"🚥 检测异常"+'</br></br>----------------------</br>'+ nodeName + `</p>`})
});


async function testDisneyPlus() {
  try {
    let { region, cnbl } = await Promise.race([testHomePage(), timeout(7000)])
    console.log(`homepage: region=${region}, cnbl=${cnbl}`)
    // 即将登陆
//  if (cnbl == 2) {
//    return { region, status: STATUS_COMING }
//  }
    let { countryCode, inSupportedLocation } = await Promise.race([getLocationInfo(), timeout(7000)])
    console.log(`getLocationInfo: countryCode=${countryCode}, inSupportedLocation=${inSupportedLocation}`)
    
    region = countryCode ?? region
    console.log( "region:"+region)
    // 即将登陆
    if (inSupportedLocation === false || inSupportedLocation === 'false') {
      return { region, status: STATUS_COMING }
    } else {
      // 支持解锁
      return { region, status: STATUS_AVAILABLE }
    }
    
  } catch (error) {
    console.log("error:"+error)
    
    // 不支持解锁
    if (error === 'Not Available') {
      console.log("不支持")
      return { status: STATUS_NOT_AVAILABLE }
    }
    
    // 检测超时
    if (error === 'Timeout') {
      return { status: STATUS_TIMEOUT }
    }
    
    return { status: STATUS_ERROR }
  } 
  
}

function getLocationInfo() {
  return new Promise((resolve, reject) => {
    let opts0 = {
      url: 'https://disney.api.edge.bamgrid.com/graph/v1/device/graphql',
      node: nodeName,
      headers: {
        'Accept-Language': 'en',
        "Authorization": 'ZGlzbmV5JmJyb3dzZXImMS4wLjA.Cu56AgSfBTDag5NiRA81oLHkDZfu5L3CKadnefEAY84',
        'Content-Type': 'application/json',
        'User-Agent': UA,
      },
      body: JSON.stringify({
        query: 'mutation registerDevice($input: RegisterDeviceInput!) { registerDevice(registerDevice: $input) { grant { grantType assertion } } }',
        variables: {
          input: {
            applicationRuntime: 'chrome',
            attributes: {
              browserName: 'chrome',
              browserVersion: '94.0.4606',
              manufacturer: 'microsoft',
              model: null,
              operatingSystem: 'windows',
              operatingSystemVersion: '10.0',
              osDeviceIds: [],
            },
            deviceFamily: 'browser',
            deviceLanguage: 'en',
            deviceProfile: 'windows',
          },
        },
      }),
    }

    $httpClient.post(opts0, (error, response, data) => {
        if (error) {
            reject(error)
            return
        }
        if (response.status !== 200) {
            console.log('getLocationInfo: ' + data)
            reject('Not Available')
        } else {
            let {
                inSupportedLocation,
                location: { countryCode },
              } = JSON.parse(data)?.extensions?.sdk?.session
            resolve({ inSupportedLocation, countryCode })
        }
    });
  })
}

function testHomePage() {
  return new Promise((resolve, reject) => {
    let opts0 = {
      url: 'https://www.disneyplus.com/',
      node: nodeName,
      headers: {
        'Accept-Language': 'en',
        'User-Agent': UA,
      },
    }
    $httpClient.get(opts0, (error, response, data) => {
        if (error) {
            reject(error)
            return
        }
        if (response.status !== 200 || data.indexOf('unavailable') !== -1) {
            reject('Not Available')
            return
        } else {
            let match = data.match(/Region: ([A-Za-z]{2})[\s\S]*?CNBL: ([12])/)
            if (!match) {
            resolve({ region: '', cnbl: '' })
            return
            } else {
            let region = match[1]
            let cnbl = match[2]
            //console.log("homepage"+region+cnbl)
            resolve({ region, cnbl })
            }
        }
    });
  })
}

function timeout(delay = 5000) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('Timeout')
    }, delay)
  })
}

function testNf(filmId) {
  return new Promise((resolve, reject) =>{
    let option = {
      url: BASE_URL + filmId,
      node: nodeName,
      timeout: 3200,
      headers: {
        'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36',
      },
    }

    $httpClient.get(option, (error, response, data) => {
        if (error) {
            result["Netflix"] = "<b>Netflix: </b>检测超时 🚦"
            console.log(result["Netflix"])
            resolve("timeout")
            return
        }

        console.log("nf:"+response.status)
        if (response.status === 404) {
            result["Netflix"] = "<b>Netflix: </b>支持自制剧集 ⚠️"
            console.log("nf:"+result["Netflix"])
            resolve('Not Found')
            return 
        } else if (response.status === 403) {
            //console.log("nfnf")
            result["Netflix"] = "<b>Netflix: </b>未支持 🚫"
            console.log("nf:"+result["Netflix"])
            //$notify("nf:"+result["Netflix"])
            resolve('Not Available')
            return
        } else if (response.status === 200) {
            let url = response.headers["XOriginatingURL"]
            let region = 'us'
            if (url != undefined) {
              region = url.split('/')[3]
              region = region.split('-')[0]
              if (region == 'title') {
                region = 'us'
              }
            }
            console.log("nf:"+region)
            result["Netflix"] = "<b>Netflix: </b>完整支持"+arrow+ "⟦"+flags.get(region.toUpperCase())+"⟧ 🎉"
            //$notify("nf:"+result["Netflix"])
            resolve("nf:"+result["Netflix"])
            return 
        }
    });
  }
  )
}

function testYTB() { 
    let option = {
      url: BASE_URL_YTB,
      node: nodeName,
      timeout: 2800,
      headers: {
        'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'
      },
    }

    $httpClient.get(option, (error, response, data) => {
        if (error) {
            result["YouTube"] = "<b>YouTube Premium: </b>检测超时 🚦"
            //resolve("timeout")
            return
        }
        console.log("ytb:"+response.status)
        if (response.status !== 200) {
            //reject('Error')
            result["YouTube"] = "<b>YouTube Premium: </b>检测失败 ❗️"
        } else if (data.indexOf('Premium is not available in your country') !== -1) {
            //resolve('Not Available')
            result["YouTube"] = "<b>YouTube Premium: </b>未支持 🚫"
        } else if (data.indexOf('Premium is not available in your country') == -1) {//console.log(data.split("countryCode")[1])
            let region = ''
            let re = new RegExp('"GL":"(.*?)"', 'gm')
            let ret = re.exec(data)
            if (ret != null && ret.length === 2) {
                region = ret[1]
            } else if (data.indexOf('www.google.cn') !== -1) {
                region = 'CN'
            } else {
                region = 'US'
            }
            //resolve(region)
            result["YouTube"] = "<b>YouTube Premium: </b>支持 "+arrow+ "⟦"+flags.get(region.toUpperCase())+"⟧ 🎉"
            console.log("ytb:"+region+ result["YouTube"])
        }
    });
}

function testDazn() { 
  
  const extra =`{
    "LandingPageKey":"generic",
    "Platform":"web",
    "PlatformAttributes":{},
    "Manufacturer":"",
    "PromoCode":"",
    "Version":"2"
  }`
  let option = {
    url: BASE_URL_Dazn,
    node: nodeName,
    timeout: 2800,
    headers: {
      'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36',
      "Content-Type": "application/json"
    },
    body: extra
  }

  $httpClient.post(option, (error, response, data) => {
    if (error) {
        result["Dazn"] = "<b>Dazn: </b>检测超时 🚦"
        return
    }
    // let header = JSON.stringify(response.headers)
    console.log("Dazn:"+response.status)
    if (response.status !== 200) {
        result["Dazn"] = "<b>Dazn: </b>检测失败 ❗️"
    } else if (response.statusCode == 200) {
        //console.log(data)
        let region = ''
        let re = new RegExp('"GeolocatedCountry":"(.*?)"', 'gm')
        let ret = re.exec(data)
        if (ret != null && ret.length === 2) {
            region = ret[1]
            result["Dazn"] = "<b>Dazn: </b>支持 "+arrow+ "⟦"+flags.get(region.toUpperCase())+"⟧ 🎉"
        } else {
            result["Dazn"] = "<b>Dazn: </b>未支持 🚫"

        }
        //resolve(region)
        console.log("Dazn:"+region+ result["Dazn"])
    }});
}

function testParam() { 
  let option = {
    url: BASE_URL_Param,
    node: nodeName,
    timeout: 2800,
    headers: {
      'User-Agent':
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36'
    },
  }

  $httpClient.get(option, (error, response, data) => {
    if (error) {
        result["Paramount"] = "<b>Paramountᐩ: </b>检测超时 🚦"
        return
    }
    console.log("Paramountᐩ:"+response.status)
    if (response.status == 200) {
        //reject('Error')
      result["Paramount"] = "<b>Paramountᐩ: </b>支持 🎉 "
    } else if (response.status == 302) {
        //resolve('Not Available')
      result["Paramount"] = "<b>Paramountᐩ: </b>未支持 🚫"
    } else {
        console.log("Paramountᐩ:"+ result["Paramount"])
    }
});
}


function testDiscovery() {
  return new Promise((resolve, reject) =>{
    let option = {
      url: BASE_URL_Discovery_token,
      node: nodeName,
      timeout: 2800,
      headers: {
        'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36'
      },
      verify: false
    }

    $httpClient.get(option, (error, response, data) => {
        if (error) {
            console.log("Check-Error"+error)
            resolve("discovery failed")
            return
        }
        console.log("GetToken:"+response.status)
        data = JSON.parse(data)
        let token = data["data"]["attributes"]["token"]
        const cookievalid =`_gcl_au=1.1.858579665.1632206782; _rdt_uuid=1632206782474.6a9ad4f2-8ef7-4a49-9d60-e071bce45e88; _scid=d154b864-8b7e-4f46-90e0-8b56cff67d05; _pin_unauth=dWlkPU1qWTRNR1ZoTlRBdE1tSXdNaTAwTW1Nd0xUbGxORFV0WWpZMU0yVXdPV1l6WldFeQ; _sctr=1|1632153600000; aam_fw=aam%3D9354365%3Baam%3D9040990; aam_uuid=24382050115125439381416006538140778858; st=${token}; gi_ls=0; _uetvid=a25161a01aa711ec92d47775379d5e4d; AMCV_BC501253513148ED0A490D45%40AdobeOrg=-1124106680%7CMCIDTS%7C18894%7CMCMID%7C24223296309793747161435877577673078228%7CMCAAMLH-1633011393%7C9%7CMCAAMB-1633011393%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1632413793s%7CNONE%7CvVersion%7C5.2.0; ass=19ef15da-95d6-4b1d-8fa2-e9e099c9cc38.1632408400.1632406594`
        let option1 = {
            url: BASE_URL_Discovery,
            node: nodeName,
            timeout: 2800,
            headers: {
            'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36',
            "Cookie": cookievalid,
            },
            ciphers: "DEFAULT@SECLEVEL=1",
            verify: false
        }

        $httpClient.get(option1, (error, response, data) => {
            if (error) {
                console.log("Check-Error"+error)
                resolve("discovery failed")
                return
            }
            console.log("Check:"+response.status)
            data = JSON.parse(data)
            let locationd = data["data"]["attributes"]["currentLocationTerritory"]
            if (locationd == "us") {
            result["Discovery"] = "<b>Discoveryᐩ: </b>支持 🎉 "
            console.log("支持Discoveryᐩ")
            resolve("支持Discoveryᐩ")
            return
            } else {
            result["Discovery"] = "<b>Discoveryᐩ: </b>未支持 🚫"
            console.log("不支持Discoveryᐩ")
            resolve("不支持Discoveryᐩ")
            return
            }
        });

    });
}
    )
}
