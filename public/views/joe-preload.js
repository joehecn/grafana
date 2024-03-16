window.joePreload = async function () {
  // 删除 cookie
  function deleteCookie(cname) {
    const date = new Date();
    date.setTime(date.getTime() - 10000);

    document.cookie = cname + '=; expire=' + date.toGMTString() + '; path=/';
  }

  function addCss(strCss) {
    //Copyright @ rainic.com
    try {
      //IE下可行
      const style = document.createStyleSheet();
      style.cssText = strCss;
    } catch (e) {
      //Firefox,Opera,Safari,Chrome下可行
      const style = document.createElement('style');
      // style.type = 'text/css'
      style.textContent = strCss;
      document.getElementsByTagName('HEAD').item(0).appendChild(style);
    }
  }

  if (window.location.pathname !== '/login') {
    // 已经到最终页面
    // https://grafana-sandbox.cloud-building.com/public/views/gotoG.html?username=masikAdmin@mega.com&password=123456&path=/d/7Y9Yt0nIz/111&orgId=3
    // https://grafana-sandbox.cloud-building.com/d/7Y9Yt0nIz/111?m=i&theme=light&orgId=3&refresh=25s

    if (window.document.body.innerText.includes('Not Found')) {
      // 404 页面
      console.error('---- 警告: 不应该进入 404 页面 ----');

      // 是否已经刷新过
      const refreshed = localStorage.getItem('j-refreshed');
      if (!refreshed) {
        // 设置已经刷新过一次，防止死循环
        localStorage.setItem('j-refreshed', '1');
        // 删除 cookie
        deleteCookie();
        // 重新刷新页面
        window.location.reload();

        return;
      }
    }

    const type = localStorage.getItem('j-type');

    if (type === 'view') {
      addCss(`
        /* 隐藏侧边栏 */
        .sidemenu  { display: none; }

        /* 隐藏 header */
        .page-toolbar {
          height: 0px;
          overflow: hidden;
          pointer-events: none;
          opacity: 0;
        }

        /* Panel Title 禁止下拉菜单 */
        .panel-header { pointer-events: none; }
        .panel-header svg { display: none; }
      `);
    } else if (type === 'edit') {
      addCss(`
        /* 隐藏侧边栏 */
        .sidemenu  { display: none; }

        /* 隐藏 header 左侧标题 */
        .page-toolbar>div:first-child { display: none; }
        .page-toolbar>nav { display: none; }
        .page-toolbar>div.css-umstnt { display: none; }

        /* 隐藏 header 右侧按钮 */
        .page-toolbar button[aria-label='Dashboard settings']  {display: none; }
        .page-toolbar button[aria-label='Cycle view mode']  {display: none; }
        .page-toolbar button[title='Open dashboard settings']  {display: none; }
      `);
      // addCss(`.css-14mr6ll>.css-1vzus6i-Icon  {display: none; }`)
      // addCss(`.css-vyoujf  {display: none; }`)
      // addCss(`.css-umstnt  {display: none; }`)
      // addCss(`button[aria-label='Cycle view mode']  {display: none; }`)
    }

    document.getElementById('exLoding').classList.add('exLoding-hide');

    // 清理 localStorage
    localStorage.removeItem('j-user');
    localStorage.removeItem('j-pass');
    localStorage.removeItem('j-type');
    localStorage.removeItem('j-rect');
    localStorage.removeItem('j-refreshed');

    return;
  }

  // 登录页面
  console.error('---- 警告: 不应该进入登录页面 ----');

  const username = localStorage.getItem('j-user');
  const password = localStorage.getItem('j-pass');

  if (username && password) {
    // 自动登录
    const res = await fetch(window.location.origin + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: username,
        password,
      }),
    });

    if (res.status === 200) {
      // 重定向
      const redirect = localStorage.getItem('j-rect');
      window.location.href = window.location.origin + redirect;
    }

    return;
  }

  document.getElementById('exLoding').classList.add('exLoding-hide');
};
