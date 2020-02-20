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

import { Observable } from 'rxjs';
import { CoreSetup } from '../../../src/core/public';
import { SYNC_SEARCH_STRATEGY, ISearch, ISearchStrategy } from '../../../src/plugins/data/public';
import { DEMO_SEARCH_STRATEGY, IDemoResponse } from '../common';
import { DemoDataSearchStartDependencies } from './plugin';

/**
 * This demo search strategy provider simply provides a shortcut for calling the DEMO_SEARCH_STRATEGY
 * on the server side, without users having to pass it in explicitly, and it takes advantage of the
 * already registered SYNC_SEARCH_STRATEGY that exists on the client.
 *
 * so instead of callers having to do:
 *
 * ```
 * search(
 *   { ...request, serverStrategy: DEMO_SEARCH_STRATEGY },
 *   options,
 *   SYNC_SEARCH_STRATEGY
 *  ) as Observable<IDemoResponse>,
 *```

 * They can instead just do
 *
 * ```
 * search(request, options, DEMO_SEARCH_STRATEGY);
 * ```
 *
 * and are ensured type safety in regard to the request and response objects.
 *
 * @param core - Core setup for this plugin
 */
export const demoClientSearchStrategyProvider = async (
  core: CoreSetup<DemoDataSearchStartDependencies>
): Promise<ISearchStrategy<typeof DEMO_SEARCH_STRATEGY>> => {
  const [, depsStart] = await core.getStartServices();
  const { search: syncSearch } = await depsStart.data.search.getSearchStrategy(
    SYNC_SEARCH_STRATEGY
  );
  const search: ISearch<typeof DEMO_SEARCH_STRATEGY> = (request, options) => {
    return syncSearch({ ...request, serverStrategy: DEMO_SEARCH_STRATEGY }, options) as Observable<
      IDemoResponse
    >;
  };
  return { search };
};
