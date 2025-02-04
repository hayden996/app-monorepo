import React, { useRef } from 'react';

import BigNumber from 'bignumber.js';
import { useIntl } from 'react-intl';

import { Icon, Pressable } from '@onekeyhq/components';
import { Network } from '@onekeyhq/engine/src/types/network';
import { IDecodedTx } from '@onekeyhq/engine/src/vaults/types';
import {
  calculateTotalFeeNative,
  calculateTotalFeeRange,
} from '@onekeyhq/engine/src/vaults/utils/feeInfoUtils';
import platformEnv from '@onekeyhq/shared/src/platformEnv';

import { useClipboard } from '../../../hooks/useClipboard';
import { useNetwork } from '../../../hooks/useNetwork';
import useOpenBlockBrowser from '../../../hooks/useOpenBlockBrowser';
import { TxActionElementAddressNormal } from '../elements/TxActionElementAddress';
import { TxActionElementDetailCellTitleText } from '../elements/TxActionElementDetailCell';
import { TxActionElementPressable } from '../elements/TxActionElementPressable';
import { ITxActionElementDetail, ITxActionListViewProps } from '../types';

import { TxDetailActionBox } from './TxDetailActionBox';

function getFeeInNativeText(options: {
  network?: Network | null;
  decodedTx: IDecodedTx;
}) {
  const {
    decodedTx: { feeInfo, totalFeeInNative },
    network,
  } = options;
  if (!!totalFeeInNative && !!network) {
    return `${totalFeeInNative} ${network.symbol}`;
  }
  if (!feeInfo || !network) {
    return '--';
  }
  const feeRange = calculateTotalFeeRange(feeInfo);
  const calculatedTotalFeeInNative = calculateTotalFeeNative({
    amount: feeRange.max,
    info: {
      defaultPresetIndex: '0',
      prices: [],

      feeSymbol: network.feeSymbol,
      feeDecimals: network.feeDecimals,
      nativeSymbol: network.symbol,
      nativeDecimals: network.decimals,
    },
  });
  return `${calculatedTotalFeeInNative} ${network.symbol}`;
}

// TODO rename ExtraInfoBox
export function TxDetailExtraInfoBox(props: ITxActionListViewProps) {
  const { decodedTx, historyTx, feeInput } = props;
  const { network } = useNetwork({ networkId: decodedTx.networkId });
  const details: ITxActionElementDetail[] = [];
  const intl = useIntl();
  const openBlockBrowser = useOpenBlockBrowser(network);
  const { copyText } = useClipboard();
  const clickTimes = useRef(0);

  details.push({
    title: (
      <Pressable
        cursor="default" // not working
        style={{
          // @ts-ignore
          cursor: 'default',
        }}
        onPress={() => {
          clickTimes.current += 1;
          if (clickTimes.current > 5) {
            clickTimes.current = 0;
            copyText(JSON.stringify(historyTx ?? decodedTx, null, 2));
          }
        }}
      >
        <TxActionElementDetailCellTitleText>
          {intl.formatMessage({ id: 'network__network' })}
        </TxActionElementDetailCellTitleText>
      </Pressable>
    ),
    content: network?.name ?? '',
  });
  if (decodedTx.interactInfo?.url) {
    details.push({
      title: intl.formatMessage({ id: 'content__interact_with' }),
      content: decodedTx.interactInfo?.url ?? '',
    });
  }
  if (platformEnv.isDev && decodedTx.nonce && decodedTx.nonce >= 0) {
    details.push({
      title: 'Nonce',
      content: `${new BigNumber(decodedTx.nonce).toFixed()}`,
    });
  }
  if (decodedTx.txid) {
    details.push({
      title: intl.formatMessage({ id: 'content__hash' }),
      content: openBlockBrowser.hasAvailable ? (
        <TxActionElementPressable
          icon={<Icon name="ExternalLinkSolid" size={20} />}
          onPress={() => {
            openBlockBrowser.openTransactionDetails(decodedTx.txid);
          }}
        >
          <TxActionElementAddressNormal
            address={decodedTx.txid}
            isCopy={false}
            isLabelShow={false}
          />
        </TxActionElementPressable>
      ) : (
        <TxActionElementAddressNormal
          address={decodedTx.txid}
          isLabelShow={false}
        />
      ),
    });
  }
  details.push({
    title: intl.formatMessage({ id: 'content__fee' }),
    content:
      feeInput ||
      getFeeInNativeText({
        network,
        decodedTx,
      }),
  });
  return <TxDetailActionBox details={details} />;
}
