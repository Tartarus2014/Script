^https://1008610010\.yohui\.vip/index\.php/Api/LiveApi/getMovietime

mitm=1008610010.yohui.vip

https://ok6.app


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

