/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { throwError, Subscription } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';
import {
  IKibanaSearchRequest,
  ISearchOptions,
  SearchInterceptor,
  SearchInterceptorDeps,
  UI_SETTINGS,
} from '../../../../../src/plugins/data/public';
import { TimeoutErrorMode } from '../../../../../src/plugins/data/public';
import { ENHANCED_ES_SEARCH_STRATEGY } from '../../common';
import { getAsyncSearch } from '../../common/search/async_search_utils';

export class EnhancedSearchInterceptor extends SearchInterceptor {
  private uiSettingsSub: Subscription;
  private searchTimeout: number;

  /**
   * @internal
   */
  constructor(deps: SearchInterceptorDeps) {
    super(deps);
    this.searchTimeout = deps.uiSettings.get(UI_SETTINGS.SEARCH_TIMEOUT);

    this.uiSettingsSub = deps.uiSettings
      .get$(UI_SETTINGS.SEARCH_TIMEOUT)
      .subscribe((timeout: number) => {
        this.searchTimeout = timeout;
      });
  }

  public stop() {
    this.uiSettingsSub.unsubscribe();
  }

  protected getTimeoutMode() {
    return this.application.capabilities.advancedSettings?.save
      ? TimeoutErrorMode.CHANGE
      : TimeoutErrorMode.CONTACT;
  }

  /**
   * Abort our `AbortController`, which in turn aborts any intercepted searches.
   */
  public cancelPending = () => {
    this.abortController.abort();
    this.abortController = new AbortController();
    if (this.deps.usageCollector) this.deps.usageCollector.trackQueriesCancelled();
  };

  public search(request: IKibanaSearchRequest, options: ISearchOptions = {}) {
    const { combinedSignal, timeoutSignal, cleanup } = this.setupAbortSignal({
      abortSignal: options.abortSignal,
      timeout: this.searchTimeout,
    });
    const { strategy = ENHANCED_ES_SEARCH_STRATEGY } = options;

    this.pendingCount$.next(this.pendingCount$.getValue() + 1);

    return this.asyncSearch(request, { strategy, ...options, abortSignal: combinedSignal }).pipe(
      catchError((e: any) => {
        return throwError(this.handleSearchError(e, request, timeoutSignal, options));
      }),
      finalize(() => {
        this.pendingCount$.next(this.pendingCount$.getValue() - 1);
        cleanup();
      })
    );
  }

  private asyncSearch = getAsyncSearch(
    (request, options) => this.runSearch(request, options?.abortSignal, options?.strategy),
    (id, options) => {
      // If we haven't received the response to the initial request, including the ID, then
      // we don't need to send a follow-up request to delete this search. Otherwise, we
      // send the follow-up request to delete this search, then throw an abort error.
      if (id !== undefined) {
        return this.deps.http.delete(`/internal/search/${options?.strategy}/${id}`);
      }
    }
  );
}
