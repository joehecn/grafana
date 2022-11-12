window.joePreload = async function () {
  function addCss(strCss) { //Copyright @ rainic.com
    try { //IE下可行
      const style = document.createStyleSheet()
      style.cssText = strCss
    } catch (e) { //Firefox,Opera,Safari,Chrome下可行
      const style = document.createElement('style')
      // style.type = 'text/css'
      style.textContent = strCss
      document.getElementsByTagName('HEAD').item(0).appendChild(style)
    }
  }

  if (window.location.pathname !== '/login') {
    // 已经到最终页面
    const type = localStorage.getItem('j-type')

    // console.log({ type })

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
      `)
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
      `)
      // addCss(`.css-14mr6ll>.css-1vzus6i-Icon  {display: none; }`)
      // addCss(`.css-vyoujf  {display: none; }`)
      // addCss(`.css-umstnt  {display: none; }`)
      // addCss(`button[aria-label='Cycle view mode']  {display: none; }`)
    }

    document.getElementById('exLoding').classList.add('exLoding-hide')

    // 清理 localStorage
    localStorage.removeItem('j-user')
    localStorage.removeItem('j-pass')
    localStorage.removeItem('j-type')
    localStorage.removeItem('j-rect')

    return
  }

  const username = localStorage.getItem('j-user')
  const password = localStorage.getItem('j-pass')

  if (username && password) {
    // 自动登录
    const res = await fetch(window.location.origin + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user: username,
        password
      })
    })

    if (res.status === 200) {
      // 重定向
      const redirect = localStorage.getItem('j-rect')
      window.location.href = window.location.origin + redirect
    }

    return
  }

  document.getElementById('exLoding').classList.add('exLoding-hide')
}
