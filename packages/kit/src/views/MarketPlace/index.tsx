import { useState } from 'react';

import { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';

import WebView from '@onekeyhq/kit/src/components/WebView';

export default function MarketPlace() {
  const [navigationStateChangeEvent, setNavigationStateChangeEvent] =
    useState<WebViewNavigation>();

  return (
    <WebView
        src='https://souffl3.com'
        // src={url || 'about:blank'}
        // onWebViewRef={(ref) => {
        //   const { dispatch } = backgroundApiProxy;
        //   if (ref && ref.innerRef) {
        //     webviewRefs[id] = ref;
        //     dispatch(setWebTabData({ id, refReady: true }));
        //   } else {
        //     delete webviewRefs[id];
        //     dispatch(setWebTabData({ id, refReady: false }));
        //   }
        // }}
        onNavigationStateChange={setNavigationStateChangeEvent}
        allowpopups
      />
  );
}
