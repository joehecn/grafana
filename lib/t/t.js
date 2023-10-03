// const one = require('../grafana-to-web-component/dist/1.js');
// const app = require('../grafana-to-web-component/dist/app.js');
// const runtime = require('../grafana-to-web-component/dist/runtime.js');
// console.log({ one, app, runtime });

import('../grafana-to-web-component/dist/runtime.js').then((runtime) => {
  import('../grafana-to-web-component/dist/1.js').then((one) => {
    import('../grafana-to-web-component/dist/app.js').then((app) => {
      console.log({ runtime, one, app });
    });
  });
});

// import('../grafana-to-web-component/dist/app.js').then((app) => {
//   console.log(app);
// });
