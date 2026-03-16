/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { DataGridDensity } from '@kbn/discover-utils';
import { VIEW_MODE } from '@kbn/saved-search-plugin/common';
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
      const initialState: DiscoverSessionEmbeddableState = {
        ...logsInitialState,
        tabs: [
          {
            dataset: {
              type: 'index',
              index: discoverServices.logsDataAccess
                ? await discoverServices.logsDataAccess.services.logSourcesService.getFlattenedLogSources()
                : 'logs-*-*',
              time_field: '@timestamp',
            },
            sort: [],
            density: DataGridDensity.COMPACT,
            header_row_height: 3,
            filters: [],
            view_mode: VIEW_MODE.DOCUMENT_LEVEL,
          },
        ],
      };
      return searchEmbeddableFactory.buildEmbeddable({ initialState, ...restParams });
    },
  };

  return logStreamEmbeddableFactory;
};
