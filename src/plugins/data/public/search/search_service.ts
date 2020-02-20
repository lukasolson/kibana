/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { Plugin, CoreSetup, CoreStart, PackageInfo } from '../../../../core/public';
import { SYNC_SEARCH_STRATEGY, syncSearchStrategyProvider } from './sync_search_strategy';
import { ISearchSetup, ISearchStart, ISearchStrategy } from './types';
import { TStrategyTypes } from './strategy_types';
import { getEsClient, LegacyApiCaller } from './es_client';
import { ES_SEARCH_STRATEGY, DEFAULT_SEARCH_STRATEGY } from '../../common/search';
import { esSearchStrategyProvider } from './es_search/es_search_strategy';

/**
 * The search plugin exposes two registration methods for other plugins:
 *  -  registerSearchStrategyProvider for plugins to add their own custom
 * search strategies
 *  -  registerSearchStrategyContext for plugins to expose information
 * and/or functionality for other search strategies to use
 *
 * It also comes with two search strategy implementations - SYNC_SEARCH_STRATEGY and ES_SEARCH_STRATEGY.
 */
export class SearchService implements Plugin<ISearchSetup, ISearchStart> {
  /**
   * A mapping of search strategies keyed by a unique identifier.  Plugins can use this unique identifier
   * to override certain strategy implementations.
   */
  private searchStrategies: {
    [K in TStrategyTypes]?: Promise<ISearchStrategy<any>>;
  } = {};

  private esClient?: LegacyApiCaller;

  private registerSearchStrategy = <T extends TStrategyTypes>(
    name: T,
    searchStrategy: Promise<ISearchStrategy<T>>
  ) => {
    this.searchStrategies[name] = searchStrategy;
  };

  private getSearchStrategy = <T extends TStrategyTypes>(name: T): Promise<ISearchStrategy<T>> => {
    const searchStrategy = this.searchStrategies[name];
    if (!searchStrategy) throw new Error(`Search strategy ${name} not found`);
    return searchStrategy;
  };

  public setup(core: CoreSetup, packageInfo: PackageInfo): ISearchSetup {
    this.esClient = getEsClient(core.injectedMetadata, core.http, packageInfo);
    const syncSearchStrategy = syncSearchStrategyProvider(core);
    this.registerSearchStrategy(SYNC_SEARCH_STRATEGY, syncSearchStrategy);
    this.registerSearchStrategy(
      ES_SEARCH_STRATEGY,
      esSearchStrategyProvider(core, syncSearchStrategy)
    );
    return {
      registerSearchStrategy: this.registerSearchStrategy,
    };
  }

  public start(core: CoreStart): ISearchStart {
    return {
      search: (request, options, strategyName) => {
        const searchStrategy = this.getSearchStrategy(strategyName || DEFAULT_SEARCH_STRATEGY);
        return from(searchStrategy).pipe(
          mergeMap(({ search }) => {
            return search(request as any, options);
          })
        );
      },
      getSearchStrategy: this.getSearchStrategy,
      __LEGACY: {
        esClient: this.esClient!,
      },
    };
  }

  public stop() {}
}
