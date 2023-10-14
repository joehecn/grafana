import { css, injectGlobal, keyframes, cx } from '@emotion/css';
import createEmotion, { EmotionCache, ClassNamesArg } from '@emotion/css/create-instance';
import { CSSInterpolation } from '@emotion/serialize';

let cc: CC | null = null;

class CC {
  private readonly _css: {
    (template: TemplateStringsArray, ...args: CSSInterpolation[]): string;
    (...args: CSSInterpolation[]): string;
  };

  private readonly _injectGlobal: {
    (template: TemplateStringsArray, ...args: CSSInterpolation[]): void;
    (...args: CSSInterpolation[]): void;
  };

  private readonly _keyframes: {
    (template: TemplateStringsArray, ...args: CSSInterpolation[]): string;
    (...args: CSSInterpolation[]): string;
  };

  private readonly _cx: (...classNames: ClassNamesArg[]) => string;

  private readonly _cache: EmotionCache;

  constructor(container: ShadowRoot) {
    const {
      css,
      injectGlobal,
      keyframes,
      cx,
      cache
    } = createEmotion({ key: 's', container });
    this._cache = cache;
    this._css = css;
    this._injectGlobal = injectGlobal;
    this._keyframes = keyframes;
    this._cx = cx;
  }

  public get css() {
    return this._css;
  }

  public get injectGlobal() {
    return this._injectGlobal;
  }

  public get keyframes() {
    return this._keyframes;
  }

  public get cx() {
    return this._cx;
  }

  public get cache() {
    return this._cache;
  }
}

export const getCC = (container?: ShadowRoot) => {
  if (cc) {
    return {
      css: cc.css,
      injectGlobal: cc.injectGlobal,
      keyframes: cc.keyframes,
      cx: cc.cx,
      cache: cc.cache
    };
  }

  if (container) {
    cc = new CC(container);
    return {
      css: cc.css,
      injectGlobal: cc.injectGlobal,
      keyframes: cc.keyframes,
      cx: cc.cx,
      cache: cc.cache
    };
  }

  return {
    css,
    injectGlobal,
    keyframes,
    cx,
    cache: null
  }
}
