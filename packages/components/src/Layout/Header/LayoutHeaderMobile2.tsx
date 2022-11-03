import LayoutHeader from './index';
import { useMemo } from 'react';
import { Box, HStack, IconButton, Typography } from '@onekeyhq/components';
import { useWebController } from '../../../../kit/src/views/Discover/Explorer/Controller/useWebController';
import { useIntl } from 'react-intl';
import { navigationRef } from '@onekeyhq/kit/src/provider/NavigationProvider';
import {
  useSafeAreaInsets,
} from '../../Provider/hooks';
import { tabRoutes } from '@onekeyhq/kit/src/routes/Tab/routes';
import debugLogger from '@onekeyhq/shared/src/logger/debugLogger';


export function LayoutHeaderMobile2() {
  const {
    canGoBack,
    goBack,
  } = useWebController();

  const intl = useIntl();
  const insets = useSafeAreaInsets();

  return (
    <Box flex="1">
      <Box>
        {/* <Box 
        w="100%"
        height={insets.top}
        top={0}
        bg="surface-subdued"
      ></Box> */}
      <Box
        w="100%"
        px={6}
        height={44+insets.top}
        top={0}
        bg="surface-subdued"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        style={{paddingTop:insets.top}}
      >
        { !canGoBack ? <Box width={50}></Box> : (
          <IconButton
            onPress={goBack}
            name="ChevronLeftOutline"
            size="lg"
            type="plain"
            style={{width:40}}
          />
        )}
        <Typography.DisplayMedium>
          {/* {intl.formatMessage({ id: translationId })} */}
          {navigationRef.current?.getCurrentRoute()?.name}
        </Typography.DisplayMedium>
        <Box width={50}></Box>
      </Box>
      </Box>
    </Box>
  );
}


