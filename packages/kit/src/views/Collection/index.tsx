import { useEffect, useState } from 'react';

import { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';

import WebView from '@onekeyhq/kit/src/components/WebView';
import backgroundApiProxy from '../../background/instance/backgroundApiProxy';
import { nanoid } from '@reduxjs/toolkit';
import {
  WebTab,
  addWebTab,
  setWebTabData,
  collectionTab,
} from '../../store/reducers/webTabs';
import { webviewRefs } from '../Discover/Explorer/explorerUtils';
import { Box } from '@onekeyhq/components';
import {
  useSafeAreaInsets,
} from '../../../../components/src/Provider/hooks';

export default function Collection() {
  const { dispatch } = backgroundApiProxy;

  useEffect(() => {
    dispatch(
      addWebTab({
        ...collectionTab,
        id: nanoid(),
      }),
    );
  }, [])
  
  const [navigationStateChangeEvent, setNavigationStateChangeEvent] =
    useState<WebViewNavigation>();

  const insets = useSafeAreaInsets();

  return (
    <Box flex="1">
      <Box flex={1}
      top={insets.top+44}
      >
        <WebView
          src='https://souffl3.com/discover'
          // src={url || 'about:blank'}
          onWebViewRef={(ref) => {
            const { dispatch } = backgroundApiProxy;
            if (ref && ref.innerRef) {
              webviewRefs[collectionTab.id] = ref;
              dispatch(setWebTabData({ id: collectionTab.id, refReady: true }));
            } else {
              delete webviewRefs[collectionTab.id];
              dispatch(setWebTabData({ id: collectionTab.id, refReady: false }));
            }
          }}
          onNavigationStateChange={setNavigationStateChangeEvent}
          allowpopups
        />
      </Box>
    </Box>
  );
}
