/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { from, timer, NEVER } from 'rxjs';
import { expand, tap, takeUntil, takeWhile, switchMap } from 'rxjs/operators';
import {
  IEsSearchRequest,
  IEsSearchResponse,
  IKibanaSearchRequest,
  IKibanaSearchResponse,
  ISearchCancelGeneric,
  ISearchGeneric,
  ISearchOptions,
  isErrorResponse,
  isPartialResponse,
  toPromise,
  AbortError,
} from '../../../../../src/plugins/data/common';

export function getAsyncSearch<
  Request extends IKibanaSearchRequest = IEsSearchRequest,
  Response extends IKibanaSearchResponse = IEsSearchResponse
>(search: ISearchGeneric, cancel: ISearchCancelGeneric, pollInterval = 1000) {
  return (request: Request, options: ISearchOptions) =>
    search<Request, Response>(request, options).pipe(
      // Wait the given interval before making the next search request
      expand(() => timer(pollInterval).pipe(switchMap(() => search(request, options)))),
      // Stop polling if the user aborts
      takeUntil(options?.abortSignal ? from(toPromise(options.abortSignal)) : NEVER),
      // Stop polling if the search indicates an error
      takeWhile((response) => {
        if (!isErrorResponse(response)) return true;
        throw new AbortError(); // TODO: Improve this error with the actual error message
      }),
      // Stop polling if the search completes
      takeWhile(isPartialResponse, true),
      tap(
        // Include the `id` from the response in follow-up requests
        (response) => (request = { ...request, id: response.id }),
        // Cancel the search if it is aborted (or fails)
        () => cancel(request.id, options)
      )
    );
}
