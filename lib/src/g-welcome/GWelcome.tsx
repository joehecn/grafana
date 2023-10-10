import { EmotionCache } from '@emotion/css/create-instance';
import { CacheProvider } from '@emotion/react';
import React, { useRef, useState, useEffect } from "react";
import { createPortal } from 'react-dom';

import { WelcomeBanner } from 'app/plugins/panel/welcome/Welcome';

import { getCC } from '../cc';

function ShadowDom({ children }: { children: React.ReactNode }) {
  const node = useRef(null);
  const [rootNode, setRootNode] = useState<ShadowRoot | null>(null);
  const [cacheNode, setCacheNode] = useState<EmotionCache | null>(null);

  useEffect(() => {
    if (node.current) {
      const current = node.current as HTMLElement;

      const root: ShadowRoot = current.attachShadow({ mode: 'open' });
      setRootNode(root);

      const { cache } = getCC(root);
      
      setCacheNode(cache);
    }
  }, []);

  return (
    <>
      <div ref={node} />
      {rootNode && cacheNode && createPortal(<CacheProvider value={cacheNode}>{children}</CacheProvider>, rootNode)}
    </>
  );
}

export function getGWelcome() {
  return function GWelcome() {
    return (
      <>
        <ShadowDom>
          <WelcomeBanner />
        </ShadowDom>
      </>
    )
  }
}
