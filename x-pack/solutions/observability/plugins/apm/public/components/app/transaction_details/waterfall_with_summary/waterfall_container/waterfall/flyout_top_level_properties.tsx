/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import React from 'react';
import { useApmRouter } from '../../../../../../hooks/use_apm_router';
import { SERVICE_NAME, TRANSACTION_NAME } from '../../../../../../../common/es_fields/apm';
import { getNextEnvironmentUrlParam } from '../../../../../../../common/environment_filter_values';
import { LatencyAggregationType } from '../../../../../../../common/latency_aggregation_types';
import type { Transaction } from '../../../../../../../typings/es_schemas/ui/transaction';
import { useAnyOfApmParams } from '../../../../../../hooks/use_apm_params';
import { TransactionDetailLink } from '../../../../../shared/links/apm/transaction_detail_link';
import { ServiceLink } from '../../../../../shared/links/apm/service_link';
import { StickyProperties } from '../../../../../shared/sticky_properties';

interface Props {
  transaction?: Transaction;
}

export function FlyoutTopLevelProperties({ transaction }: Props) {
  const { query } = useAnyOfApmParams(
    '/services/{serviceName}/transactions/view',
    '/mobile-services/{serviceName}/transactions/view',
    '/traces/explorer',
    '/dependencies/operation'
  );
  const { link } = useApmRouter();

  const latencyAggregationType =
    ('latencyAggregationType' in query && query.latencyAggregationType) ||
    LatencyAggregationType.avg;
  const serviceGroup = ('serviceGroup' in query && query.serviceGroup) || '';

  if (!transaction) {
    return null;
  }

  const nextEnvironment = getNextEnvironmentUrlParam({
    requestedEnvironment: transaction.service.environment,
    currentEnvironmentUrlParam: query.environment,
  });

  const stickyProperties = [
    {
      label: i18n.translate('xpack.apm.transactionDetails.serviceLabel', {
        defaultMessage: 'Service',
      }),
      fieldName: SERVICE_NAME,
      val: (
        <ServiceLink
          agentName={transaction.agent.name}
          query={{
            kuery: query.kuery,
            latencyAggregationType,
            offset: query.offset,
            rangeFrom: query.rangeFrom,
            rangeTo: query.rangeTo,
            comparisonEnabled: query.comparisonEnabled,
            transactionType: transaction.transaction.type,
            serviceGroup,
            environment: nextEnvironment,
          }}
          serviceName={transaction.service.name}
        />
      ),
      width: '25%',
    },
    {
      label: i18n.translate('xpack.apm.transactionDetails.transactionLabel', {
        defaultMessage: 'Transaction',
      }),
      fieldName: TRANSACTION_NAME,
      val: (
        <TransactionDetailLink
          transactionName={transaction.transaction.name}
          href={link('/services/{serviceName}/transactions/view', {
            path: { serviceName: transaction.service.name },
            query: {
              ...query,
              serviceGroup,
              latencyAggregationType,
              transactionName: transaction.transaction.name,
            },
          })}
        >
          {transaction.transaction.name}
        </TransactionDetailLink>
      ),
      width: '25%',
    },
  ];

  return <StickyProperties stickyProperties={stickyProperties} />;
}
