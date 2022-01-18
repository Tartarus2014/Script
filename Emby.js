/***
# EmbyPremiere
http-response ^https?:\/\/mb3admin.com\/admin\/service\/registration\/validateDevice requires-body=1, script-path=https://subweb.oss-cn-hongkong.aliyuncs.com/Script/embyPremiere.js,tag=embyUnlocked

**/

if ($request.url.indexOf('mb3admin.com/admin/service/registration/validateDevice') != -1) {
      if($response.status!=200){
          $notification.post("EmbyPremiere已激活，感谢选择普拉斯影业", "", "");
          $done({status: 200, headers: $response.headers, body: '{"cacheExpirationDays":999,"resultCode":"GOOD","message":"Device Valid"}' })
      }else{
          $done({})
      }
  }else{
      $done({})
  }
