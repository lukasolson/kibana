/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';

import type { LogEntryCategoryDataset } from '../../../../../../common/log_analysis';
import { getFriendlyNameForPartitionId } from '../../../../../../common/log_analysis';
import { AnomalySeverityIndicator } from '../../../../../components/logging/log_analysis_results/anomaly_severity_indicator';

export const AnomalySeverityIndicatorList: React.FunctionComponent<{
  datasets: LogEntryCategoryDataset[];
}> = ({ datasets }) => (
  <ul>
    {datasets.map((dataset) => {
      const datasetLabel = getFriendlyNameForPartitionId(dataset.name);
      return (
        <li key={datasetLabel}>
          <AnomalySeverityIndicator anomalyScore={dataset.maximumAnomalyScore} />
        </li>
      );
    })}
  </ul>
);
