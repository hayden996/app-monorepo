import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useNavigation } from '@react-navigation/core';
import { RouteProp, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useIntl } from 'react-intl';

import { Box, Icon, Text } from '@onekeyhq/components';

import Layout from '../../../Layout';
import { EOnboardingRoutes } from '../../../routes/enums';
import { IOnboardingRoutesParams } from '../../../routes/types';

import SecondaryContent from './SecondaryContent';
import backgroundApiProxy from '../../../../../background/instance/backgroundApiProxy';

type NavigationProps = StackNavigationProp<
  IOnboardingRoutesParams,
  EOnboardingRoutes.RecoveryPhrase
>;
type RouteProps = RouteProp<
  IOnboardingRoutesParams,
  EOnboardingRoutes.RecoveryPhrase
>;

const getListItemLeadingColor = (type: string) => {
  if (type === 'critical')
    return {
      bgColor: 'surface-critical-default',
      iconColor: 'icon-critical',
    } as const;
  if (type === 'warning')
    return {
      bgColor: 'surface-warning-default',
      iconColor: 'icon-warning',
    } as const;

  return {
    bgColor: 'decorative-surface-one',
    iconColor: 'decorative-icon-one',
  } as const;
};

const RecoveryPhrase = () => {
  const intl = useIntl();
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const importedMnemonic = route.params?.mnemonic;
  const [mnemonic, setMnemonic] = useState('');

  const onPressShowPhraseButton = useCallback(() => {
    
    navigation.replace(EOnboardingRoutes.ShowRecoveryPhrase,  {
      password: 'defaultpwd',
      mnemonic: mnemonic, 
      withEnableAuthentication: false,
    });
  }, [navigation, mnemonic]);
  const onPressSavedPhrase = useCallback(() => {
    navigation.replace(EOnboardingRoutes.BehindTheScene, {
      password: 'defaultpwd',
      mnemonic: mnemonic, 
      withEnableAuthentication: false,
    });
  }, [navigation, mnemonic]);

  const fn = useCallback(async () => {
    const res = await backgroundApiProxy.engine.generateMnemonic();
    setMnemonic(res);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  useEffect(() => {
    
    if(importedMnemonic) {
      setMnemonic(importedMnemonic);
      return;
    };
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importedMnemonic]);


  const lists = useMemo(
    () =>
      [
        {
          type: 'decorative',
          icon: 'LockClosedOutline',
          para: intl.formatMessage({ id: 'modal__attention_unlock' }),
        },
        {
          type: 'decorative',
          icon: 'DotsCircleHorizontalOutline',
          para: intl.formatMessage({ id: 'content__recovery_phrase_restore' }),
        },
        {
          type: 'warning',
          icon: 'ShieldCheckOutline',
          para: intl.formatMessage({
            id: 'backup__manual_backup_warning_never_ask',
          }),
        },
        {
          type: 'critical',
          icon: 'EyeOffOutline',
          para: intl.formatMessage({ id: 'modal__attention_shh' }),
        },
      ] as const,
    [intl],
  );

  return (
    <>
      <Layout
        title={intl.formatMessage({ id: 'title__recovery_phrase' })}
        description={intl.formatMessage({ id: 'title__recovery_phrase_desc' })}
        secondaryContent={
          <SecondaryContent
            mnemonic={mnemonic}
            onPressShowPhraseButton={onPressShowPhraseButton}
            onPressSavedPhrase={onPressSavedPhrase}
          />
        }
        fullHeight
      >
        <Box my={-3} mt={{ base: 4, sm: 0 }}>
          {lists.map((item, index) => (
            <Box key={index} flexDir="row" alignItems="center" py={3}>
              <Box
                p={2.5}
                mr={4}
                rounded="full"
                bgColor={getListItemLeadingColor(item.type)?.bgColor}
                alignSelf="flex-start"
              >
                <Icon
                  name={item.icon}
                  color={getListItemLeadingColor(item.type)?.iconColor}
                  size={20}
                />
              </Box>
              <Text flex={1} typography="Body2">
                {item.para}
              </Text>
            </Box>
          ))}
        </Box>
      </Layout>
    </>
  );
};

export default RecoveryPhrase;
