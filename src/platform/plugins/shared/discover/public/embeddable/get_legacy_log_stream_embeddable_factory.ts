/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { AS_CODE_DATA_VIEW_SPEC_TYPE } from '@kbn/as-code-data-views-schema';
import type { DiscoverSessionEmbeddableState } from '../../server';
import { getSearchEmbeddableFactory } from './get_search_embeddable_factory';
import { LEGACY_LOG_STREAM_EMBEDDABLE } from './constants';

export const getLegacyLogStreamEmbeddableFactory = (
  ...[{ startServices, discoverServices }]: Parameters<typeof getSearchEmbeddableFactory>
) => {
  const searchEmbeddableFactory = getSearchEmbeddableFactory({ startServices, discoverServices });
  const logStreamEmbeddableFactory: ReturnType<typeof getSearchEmbeddableFactory> = {
    type: LEGACY_LOG_STREAM_EMBEDDABLE,
    buildEmbeddable: async ({ initialState: logsInitialState, ...restParams }) => {
      const initialState = {
        ...logsInitialState,
        tabs: [
          {
            data_source: {
              type: AS_CODE_DATA_VIEW_SPEC_TYPE,
              index_pattern: discoverServices.logsDataAccess
                ? await discoverServices.logsDataAccess.services.logSourcesService.getFlattenedLogSources()
                : 'logs-*-*',
              time_field: '@timestamp',
            },
          },
        ],
      } as DiscoverSessionEmbeddableState;
      return searchEmbeddableFactory.buildEmbeddable({ initialState, ...restParams });
    },
  };

  return logStreamEmbeddableFactory;
};
