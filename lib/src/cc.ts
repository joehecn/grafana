import { css } from '@emotion/css';
import createEmotion, { EmotionCache } from '@emotion/css/create-instance';
import { CSSInterpolation } from '@emotion/serialize';

let cc: CC | null = null;

class CC {
  private readonly _css: {
    (template: TemplateStringsArray, ...args: CSSInterpolation[]): string;
    (...args: CSSInterpolation[]): string;
};
  private readonly _cache: EmotionCache;

  constructor(container: ShadowRoot) {
    const { css, cache } = createEmotion({ key: 's', container });
    this._cache = cache;
    this._css = css;
  }

  public get css() {
    return this._css;
  }

  public get cache() {
    return this._cache;
  }
}

export const getCC = (container?: ShadowRoot) => {
  if (cc) {
    return {
      css: cc.css,
      cache: cc.cache
    };
  }

  if (container) {
    cc = new CC(container);
    return {
      css: cc.css,
      cache: cc.cache
    };
  }

  return {
    css,
    cache: null
  }
}
