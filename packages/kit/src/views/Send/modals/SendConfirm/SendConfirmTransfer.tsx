import React, { useMemo } from 'react';

import BigNumber from 'bignumber.js';

import {
  IDecodedTx,
  IEncodedTxUpdatePayloadTransfer,
  IEncodedTxUpdateType,
} from '@onekeyhq/engine/src/vaults/types';

import backgroundApiProxy from '../../../../background/instance/backgroundApiProxy';
import {
  useActiveSideAccount,
  useManageTokensOfAccount,
} from '../../../../hooks';
import { TxDetailView } from '../../../TxDetail/TxDetailView';
import { BaseSendConfirmModal } from '../../components/BaseSendConfirmModal';
import { ITxConfirmViewProps, TransferSendParamsPayload } from '../../types';

// For native transfer only
function SendConfirmTransfer(props: ITxConfirmViewProps) {
  const { payload, feeInfoPayload, feeInput, decodedTx: decodedTxInfo } = props;
  const decodedTx = decodedTxInfo as IDecodedTx;
  const { accountId, networkId } = useActiveSideAccount(props);
  const transferPayload = payload as TransferSendParamsPayload | undefined;
  const isTransferNativeToken = !transferPayload?.token?.idOnNetwork;
  const { getTokenBalance } = useManageTokensOfAccount({
    accountId,
    networkId,
  });

  // TODO check only supports transferPayload, decodedTx.actions[0].type=== nativeTransfer

  const isNativeMaxSend = useMemo(() => {
    if (!transferPayload) {
      return false;
    }
    if (isTransferNativeToken) {
      const amountBN = new BigNumber(transferPayload.value ?? 0);
      const balanceBN = new BigNumber(
        getTokenBalance({
          defaultValue: '0',
          tokenIdOnNetwork: transferPayload?.token?.idOnNetwork,
        }),
      );
      const feeBN = new BigNumber(feeInfoPayload?.current?.totalNative ?? 0);
      if (amountBN.plus(feeBN).gte(balanceBN)) {
        return true;
      }
    }
    return false;
  }, [feeInfoPayload, getTokenBalance, isTransferNativeToken, transferPayload]);
  const transferAmount = useMemo(() => {
    if (!transferPayload) {
      return '0';
    }
    if (isNativeMaxSend) {
      const { type, nativeTransfer } = decodedTx.actions[0];
      if (
        type === 'NATIVE_TRANSFER' &&
        typeof nativeTransfer !== 'undefined' &&
        typeof nativeTransfer.utxoFrom !== 'undefined'
      ) {
        // For UTXO model, the decodedTx is updated with the new transfer amount.
        // Use this instead of depending the incorrect feeInfoPayload results.
        return nativeTransfer.amount;
      }
      const balanceBN = new BigNumber(
        getTokenBalance({
          defaultValue: '0',
          tokenIdOnNetwork: transferPayload.token.idOnNetwork,
        }),
      );
      const amountBN = new BigNumber(transferPayload.value ?? 0);
      const transferAmountBn = BigNumber.min(balanceBN, amountBN);
      const feeBN = new BigNumber(feeInfoPayload?.current?.totalNative ?? 0);
      return transferAmountBn.minus(feeBN).toFixed();
    }

    return transferPayload.value ?? '0';
  }, [
    decodedTx,
    feeInfoPayload,
    getTokenBalance,
    isNativeMaxSend,
    transferPayload,
  ]);

  const isAmountNegative = useMemo(
    () => new BigNumber(transferAmount).lt(0),
    [transferAmount],
  );
  const transferAmountToUpdate = useMemo(
    () =>
      isAmountNegative && transferPayload
        ? transferPayload.value
        : transferAmount,
    [isAmountNegative, transferAmount, transferPayload],
  );
  return (
    <BaseSendConfirmModal
      {...props}
      confirmDisabled={isAmountNegative}
      updateEncodedTxBeforeConfirm={async (tx) => {
        if (!!transferPayload && isNativeMaxSend) {
          const updatePayload: IEncodedTxUpdatePayloadTransfer = {
            amount: transferAmountToUpdate,
          };
          const newTx = await backgroundApiProxy.engine.updateEncodedTx({
            networkId,
            accountId,
            encodedTx: tx,
            payload: updatePayload,
            options: {
              type: IEncodedTxUpdateType.transfer,
            },
          });
          return Promise.resolve(newTx);
        }
        return Promise.resolve(tx);
      }}
    >
      <TxDetailView
        isSendConfirm
        decodedTx={decodedTx}
        feeInput={feeInput}
        transferAmount={transferAmountToUpdate}
      />
    </BaseSendConfirmModal>
  );
}

export { SendConfirmTransfer };
