/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { Observable, from } from 'rxjs';
import { first, map, switchMap, tap } from 'rxjs/operators';
import { SearchResponse } from 'elasticsearch';
import { SharedGlobalConfig, Logger } from '../../../../../src/core/server';
import {
  getTotalLoaded,
  ISearchStrategy,
  SearchUsage,
  getDefaultSearchParams,
  getShardTimeout,
  toSnakeCase,
  shimHitsTotal,
  getAsyncOptions,
  shimAbortSignal,
  SearchStrategyDependencies,
} from '../../../../../src/plugins/data/server';
import {
  ISearchOptions,
  IEsSearchRequest,
  IEsSearchResponse,
  isCompleteResponse,
} from '../../../../../src/plugins/data/common';
import { getAsyncSearch } from '../../common/search/async_search_utils';

export const enhancedEsSearchStrategyProvider = (
  config$: Observable<SharedGlobalConfig>,
  logger: Logger,
  usage?: SearchUsage
): ISearchStrategy => {
  return {
    search: (request, options, deps) => {
      logger.debug(`search ${JSON.stringify(request.params) || request.id}`);

      const isAsync = request.indexType !== 'rollup';

      return isAsync
        ? getAsyncSearch(asyncSearchProvider(deps), asyncCancelProvider(deps))(request, options)
        : from(rollupSearch(request, options, deps));
    },
    cancel: (id, options, deps) => asyncCancelProvider(deps)(id),
  };

  function asyncSearchProvider({ esClient, uiSettingsClient }: SearchStrategyDependencies) {
    return (request: IEsSearchRequest, options: ISearchOptions): Observable<IEsSearchResponse> => {
      const asyncOptions = getAsyncOptions();

      // If we have an ID, then just poll for that ID, otherwise send the entire request body
      const response$ = !request.id
        ? from(getDefaultSearchParams(uiSettingsClient)).pipe(
            map((defaultParams) =>
              toSnakeCase({
                batchedReduceSize: 64, // Only report partial results every 64 shards; this should be reduced when we actually display partial results
                ...defaultParams,
                ...asyncOptions,
                ...request.params,
              })
            ),
            switchMap((params) =>
              from(
                shimAbortSignal(
                  esClient.asCurrentUser.asyncSearch.submit(params),
                  options.abortSignal
                )
              )
            )
          )
        : from(
            shimAbortSignal(
              esClient.asCurrentUser.asyncSearch.get({
                id: request.id,
                ...toSnakeCase(asyncOptions),
              }),
              options.abortSignal
            )
          );

      return response$.pipe(
        map((esResponse) => {
          const { id, response, is_partial: isPartial, is_running: isRunning } = esResponse.body;
          return {
            id,
            isPartial,
            isRunning,
            rawResponse: shimHitsTotal(response),
            ...getTotalLoaded(response._shards),
          };
        }),
        tap(
          (response) => {
            if (isCompleteResponse(response)) usage?.trackSuccess(response.rawResponse.took);
          },
          () => usage?.trackError()
        )
      );
    };
  }

  function asyncCancelProvider({ esClient }: SearchStrategyDependencies) {
    return (id: string) => {
      logger.debug(`cancel ${id}`);
      return esClient.asCurrentUser.asyncSearch.delete({ id });
    };
  }

  async function rollupSearch(
    request: IEsSearchRequest,
    options: ISearchOptions,
    { esClient, uiSettingsClient }: SearchStrategyDependencies
  ): Promise<IEsSearchResponse> {
    const config = await config$.pipe(first()).toPromise();
    const { body, index, ...params } = request.params!;
    const method = 'POST';
    const path = encodeURI(`/${index}/_rollup_search`);
    const querystring = toSnakeCase({
      ...getShardTimeout(config),
      ...(await getDefaultSearchParams(uiSettingsClient)),
      ...params,
    });

    const promise = esClient.asCurrentUser.transport.request({
      method,
      path,
      body,
      querystring,
    });

    const esResponse = await shimAbortSignal(promise, options.abortSignal);

    const response = esResponse.body as SearchResponse<any>;
    return {
      rawResponse: response,
      ...getTotalLoaded(response._shards),
    };
  }
};
