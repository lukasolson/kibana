/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { ES_SEARCH_STRATEGY, IEsSearchResponse } from '../../../../../../src/plugins/data/common';
import { ASYNC_SEARCH_STRATEGY } from '../async_search_strategy';
import {
  TSearchStrategyProvider,
  ISearchStrategy,
  ISearchGeneric,
  ISearchContext,
} from '../../../../../../src/plugins/data/public';
import { requestCollector } from '../../plugin';

export const enhancedEsSearchStrategyProvider: TSearchStrategyProvider<typeof ES_SEARCH_STRATEGY> = (
  context: ISearchContext,
  search: ISearchGeneric
): ISearchStrategy<typeof ES_SEARCH_STRATEGY> => {
  return {
    search: (request, options) => {
      const response$ = search(
        { ...request, serverStrategy: ES_SEARCH_STRATEGY },
        options,
        ASYNC_SEARCH_STRATEGY
      ) as Observable<IEsSearchResponse>;

      response$.pipe(first()).subscribe(({ id }) => {
        requestCollector.set(JSON.stringify(request), id);
      });

      return response$;
    },
  };
};
