function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i = 0; i < vars.length; i++) {
    var pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}
setInterval(()=>{
  console.log( window.location.href, ' window.location.href')
},1000)
// function getCookie(name) {
//   var prefix = name + "="
//   var start = document.cookie.indexOf(prefix)

//   if (start == -1) {
//       return null;
//   }

//   var end = document.cookie.indexOf(";", start + prefix.length)
//   if (end == -1) {
//       end = document.cookie.length;
//   }

//   var value = document.cookie.substring(start + prefix.length, end)
//   return unescape(value);
// }
let username = getQueryVariable("username");
let password = getQueryVariable("password");
// let path = getQueryVariable("path");

// let login = getCookie('grafana_session')

// if(path){
// path = path.split("!")
// path = path.join("/")
// localStorage.setItem('path', path)
// }
// console.log({ username, password, path });

  const pathst = localStorage.getItem('path')
  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return false;
}
function add_css(str_css) { //Copyright @ rainic.com

  try { //IE下可行
    // @ts-ignore
    var style = document.createStyleSheet();

    style.cssText = str_css;

  }

  catch (e) { //Firefox,Opera,Safari,Chrome下可行

    var style = document.createElement("style");

    style.type = "text/css";

    style.textContent = str_css;

    // @ts-ignore
    document.getElementsByTagName("HEAD").item(0).appendChild(style);

  }

}
  if(pathst){

    document.getElementById('exLoding').style.display = 'block'
  }else{
    // let inter = setInterval(()=>{
      let m = getQueryVariable("m");
      if(m){
        add_css(`.sidemenu  {display: none; }`)
        add_css(`.css-14mr6ll>.css-1vzus6i-Icon  {display: none; }`)
        add_css(`.css-vyoujf  {display: none; }`)
        add_css(`.css-umstnt  {display: none; }`)

        add_css(`button[aria-label='Cycle view mode']  {display: none; }`)
        // clearInterval(inter)
      }else{

      }

      setTimeout(()=>{
      	document.getElementById('exLoding').style.display = 'none'
      },3000)
    // }, 1000)
  }
  if(!username){
    setTimeout(function () {
            const pathst = localStorage.getItem('path')
            if(pathst){
                  localStorage.removeItem('path')
                    window.location.href=pathst + '&theme=light'
                    localStorage.setItem('login', 'true')
                    // document.getElementById('exLoding').style.display = 'none'
            }
    },2000)
  }

  if (username && password) {
    setTimeout(function () {
      var $form = $(".login-content-box");
      let event = new Event("input", { bubbles: true });
      let userdoc = document.querySelector(
        '.login-content-box input[name="user"]'
      );
      userdoc.value = username;
      let trackeruser = userdoc._valueTracker;
      trackeruser.setValue('aaa');
      userdoc.dispatchEvent(event);
      trackeruser.setValue(userdoc.value);
      userdoc.dispatchEvent(event);
      let passworddoc = document.querySelector(
        '.login-content-box input[name="password"]'
      );

      passworddoc.value = password;

      let trackerpassword = passworddoc._valueTracker;

      trackerpassword.setValue('aaa');    passworddoc.dispatchEvent(event);
      trackerpassword.setValue(password);

      passworddoc.dispatchEvent(event);
      setTimeout(function () {
        $form.find("button[aria-label='Login button']").trigger("click");
      }, 1000);
    }, 500);
  }