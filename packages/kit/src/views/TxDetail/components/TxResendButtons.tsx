import React from 'react';

import { NavigationProp } from '@react-navigation/native';
import { cloneDeep, isNil, isNumber } from 'lodash';
import { useIntl } from 'react-intl';

import { Button } from '@onekeyhq/components';
import { IEncodedTxEvm } from '@onekeyhq/engine/src/vaults/impl/evm/Vault';
import { IHistoryTx } from '@onekeyhq/engine/src/vaults/types';

import { useNavigation } from '../../../hooks';
import { SendRoutes, TransactionDetailRoutesParams } from '../../../routes';
import {
  ModalRoutes,
  ModalScreenProps,
  RootRoutes,
} from '../../../routes/types';
import { SendConfirmActionType, SendConfirmParams } from '../../Send/types';

export type HistoryListViewNavigationProp =
  ModalScreenProps<TransactionDetailRoutesParams>;

// TODO move to service and use updateEncodedTx()
function doSpeedUpOrCancelTx(props: {
  historyTx: IHistoryTx;
  actionType: SendConfirmActionType;
  navigation: NavigationProp<any>;
}) {
  const { historyTx, actionType, navigation } = props;
  const encodedTx = (historyTx.decodedTx?.encodedTx ?? {}) as IEncodedTxEvm;
  const { nonce, accountId, networkId } = historyTx.decodedTx;
  if (isNil(nonce) || !isNumber(nonce) || nonce < 0) {
    console.error('speedUpOrCancelTx ERROR: nonce is missing!');
    return;
  }

  // set only fields of IEncodedTxEvm
  const encodedTxEvm: IEncodedTxEvm = {
    from: encodedTx.from,
    to: encodedTx.to,
    value: encodedTx.value,
    data: encodedTx.data,
    // must be number, 0x string will send new tx
    nonce: historyTx.decodedTx.nonce,

    // keep origin fee info
    gas: encodedTx.gas,
    gasLimit: encodedTx.gasLimit,
    gasPrice: encodedTx.gasPrice,
    maxFeePerGas: encodedTx.maxFeePerGas,
    maxPriorityFeePerGas: encodedTx.maxPriorityFeePerGas,
  };
  if (actionType === 'cancel') {
    encodedTxEvm.to = encodedTxEvm.from;
    encodedTxEvm.value = '0';
    encodedTxEvm.data = '0x';
  }
  if (actionType === 'speedUp') {
    //
  }

  const params: SendConfirmParams = {
    accountId,
    networkId,
    // actionType2: '',
    actionType,
    resendActionInfo: {
      type: actionType,
      replaceHistoryId: historyTx.id,
    },
    encodedTx: encodedTxEvm,
    feeInfoEditable: true,
    feeInfoUseFeeInTx: true,
  };
  navigation.navigate(RootRoutes.Modal, {
    screen: ModalRoutes.Send,
    params: {
      screen: SendRoutes.SendConfirm,
      params: cloneDeep(params),
    },
  });
}

export function TxResendButtons(props: { historyTx: IHistoryTx }) {
  const { historyTx } = props;
  const navigation =
    useNavigation<HistoryListViewNavigationProp['navigation']>();
  const intl = useIntl();

  const isCancel = historyTx.replacedType === 'cancel';

  return (
    <>
      {!isCancel ? (
        <Button
          size="sm"
          ml={2}
          onPress={() => {
            doSpeedUpOrCancelTx({
              historyTx,
              actionType: 'cancel',
              navigation,
            });
          }}
        >
          {intl.formatMessage({ id: 'action__cancel' })}
        </Button>
      ) : null}

      <Button
        type="primary"
        size="sm"
        ml={2}
        onPress={() => {
          if (isCancel) {
            doSpeedUpOrCancelTx({
              historyTx,
              actionType: 'cancel',
              navigation,
            });
          } else {
            doSpeedUpOrCancelTx({
              historyTx,
              actionType: 'speedUp',
              navigation,
            });
          }
        }}
      >
        {intl.formatMessage({ id: 'action__speed_up' })}
      </Button>
    </>
  );
}
