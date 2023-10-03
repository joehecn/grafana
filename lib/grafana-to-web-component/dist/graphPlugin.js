"use strict";(this.webpackChunkGrafanaToWebComponent=this.webpackChunkGrafanaToWebComponent||[]).push([[1260],{39817:(r,d,_)=>{_.d(d,{Z:()=>i});var t=_(7845),o=_.n(t),s=_(32914),l=_.n(s),a=l()(o());a.push([r.id,`@keyframes react-loading-skeleton {
  100% {
    transform: translateX(100%);
  }
}

.react-loading-skeleton {
  --base-color: #ebebeb;
  --highlight-color: #f5f5f5;
  --animation-duration: 1.5s;
  --animation-direction: normal;
  --pseudo-element-display: block; /* Enable animation */

  background-color: var(--base-color);

  width: 100%;
  border-radius: 0.25rem;
  display: inline-flex;
  line-height: 1;

  position: relative;
  user-select: none;
  overflow: hidden;
  z-index: 1; /* Necessary for overflow: hidden to work correctly in Safari */
}

.react-loading-skeleton::after {
  content: ' ';
  display: var(--pseudo-element-display);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background-repeat: no-repeat;
  background-image: linear-gradient(
    90deg,
    var(--base-color),
    var(--highlight-color),
    var(--base-color)
  );
  transform: translateX(-100%);

  animation-name: react-loading-skeleton;
  animation-direction: var(--animation-direction);
  animation-duration: var(--animation-duration);
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

@media (prefers-reduced-motion) {
  .react-loading-skeleton {
    --pseudo-element-display: none; /* Disable animation */
  }
}
`,"",{version:3,sources:["webpack://./.yarn/__virtual__/react-loading-skeleton-virtual-aac4fd7915/0/cache/react-loading-skeleton-npm-3.3.1-b364092891-0de3437a5d.zip/node_modules/react-loading-skeleton/dist/skeleton.css"],names:[],mappings:"AAAA;EACE;IACE,2BAA2B;EAC7B;AACF;;AAEA;EACE,qBAAqB;EACrB,0BAA0B;EAC1B,0BAA0B;EAC1B,6BAA6B;EAC7B,+BAA+B,EAAE,qBAAqB;;EAEtD,mCAAmC;;EAEnC,WAAW;EACX,sBAAsB;EACtB,oBAAoB;EACpB,cAAc;;EAEd,kBAAkB;EAClB,iBAAiB;EACjB,gBAAgB;EAChB,UAAU,EAAE,+DAA+D;AAC7E;;AAEA;EACE,YAAY;EACZ,sCAAsC;EACtC,kBAAkB;EAClB,MAAM;EACN,OAAO;EACP,QAAQ;EACR,YAAY;EACZ,4BAA4B;EAC5B;;;;;GAKC;EACD,4BAA4B;;EAE5B,sCAAsC;EACtC,+CAA+C;EAC/C,6CAA6C;EAC7C,sCAAsC;EACtC,mCAAmC;AACrC;;AAEA;EACE;IACE,8BAA8B,EAAE,sBAAsB;EACxD;AACF",sourcesContent:[`@keyframes react-loading-skeleton {
  100% {
    transform: translateX(100%);
  }
}

.react-loading-skeleton {
  --base-color: #ebebeb;
  --highlight-color: #f5f5f5;
  --animation-duration: 1.5s;
  --animation-direction: normal;
  --pseudo-element-display: block; /* Enable animation */

  background-color: var(--base-color);

  width: 100%;
  border-radius: 0.25rem;
  display: inline-flex;
  line-height: 1;

  position: relative;
  user-select: none;
  overflow: hidden;
  z-index: 1; /* Necessary for overflow: hidden to work correctly in Safari */
}

.react-loading-skeleton::after {
  content: ' ';
  display: var(--pseudo-element-display);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background-repeat: no-repeat;
  background-image: linear-gradient(
    90deg,
    var(--base-color),
    var(--highlight-color),
    var(--base-color)
  );
  transform: translateX(-100%);

  animation-name: react-loading-skeleton;
  animation-direction: var(--animation-direction);
  animation-duration: var(--animation-duration);
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

@media (prefers-reduced-motion) {
  .react-loading-skeleton {
    --pseudo-element-display: none; /* Disable animation */
  }
}
`],sourceRoot:""}]);const i=a},8132:(r,d,_)=>{var t=_(18826),o=_.n(t),s=_(23765),l=_.n(s),a=_(61958),i=_.n(a),c=_(41950),A=_.n(c),m=_(62578),E=_.n(m),b=_(71405),u=_.n(b),n=_(39817),e={};e.styleTagTransform=u(),e.setAttributes=A(),e.insert=i().bind(null,"head"),e.domAPI=l(),e.insertStyleElement=E();var f=o()(n.Z,e),C=n.Z&&n.Z.locals?n.Z.locals:void 0}}]);

//# sourceMappingURL=graphPlugin.js.map