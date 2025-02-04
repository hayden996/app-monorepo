import { useCallback, useEffect } from 'react';

import platformEnv from '@onekeyhq/shared/src/platformEnv';

import backgroundApiProxy from '../background/instance/backgroundApiProxy';
import {
  HomeRoutes,
  ModalScreenProps,
  RootRoutes,
  RootRoutesParams,
} from '../routes/types';
import { setOnBoardingLoadingBehindModal } from '../store/reducers/runtime';
import { wait } from '../utils/helper';

import { useAppSelector } from './redux';
import useAppNavigation from './useAppNavigation';
import useNavigation from './useNavigation';
import { useNavigationActions } from './useNavigationActions';

type NavigationProps = ModalScreenProps<RootRoutesParams>;

export function closeExtensionWindowIfOnboardingFinished() {
  if (platformEnv.isExtensionUiStandaloneWindow) {
    window?.close?.();
  }
}

export const useOnboardingRequired = () => {
  const navigation = useNavigation<NavigationProps['navigation']>();
  const boardingCompleted = useAppSelector((s) => s.status.boardingCompleted);
  useEffect(() => {
    if (!boardingCompleted) {
      navigation.replace(RootRoutes.Onboarding);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export function useOnboardingDone() {
  // TODO should set s.status.boardingCompleted=true ?
  const { closeWalletSelector, openRootHome } = useNavigationActions();
  const onboardingDone = useCallback(
    async ({
      delay = 150,
      showOnBoardingLoading,
    }: { delay?: number; showOnBoardingLoading?: boolean } = {}) => {
      if (showOnBoardingLoading) {
        backgroundApiProxy.dispatch(setOnBoardingLoadingBehindModal(true));
        await wait(100);
      }

      closeWalletSelector();
      await wait(delay);
      openRootHome();
      await wait(delay);
      closeExtensionWindowIfOnboardingFinished();

      if (showOnBoardingLoading) {
        await wait(600);
        backgroundApiProxy.dispatch(setOnBoardingLoadingBehindModal(false));
      }
    },
    [closeWalletSelector, openRootHome],
  );
  return onboardingDone;
}

export function useNavigateToOnboarding() {
  const navigation = useAppNavigation();

  // ** Modal can NOT be closed in RootRoutes.Onboarding
  // navigation.navigate(RootRoutes.Onboarding);

  navigation.navigate(RootRoutes.Root, {
    screen: HomeRoutes.HomeOnboarding,
  });
}
