/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { ReactElement } from 'react';
import { Router } from '@kbn/shared-ux-router';
import { MemoryHistory } from 'history/createMemoryHistory';
import { createMemoryHistory, History } from 'history';
import { mountWithIntl, renderWithI18nProvider, shallowWithIntl } from '@kbn/test-jest-helpers';
import { KibanaContextProvider } from '@kbn/kibana-react-plugin/public';
import { MountWithReduxProvider } from './helper_with_redux';
import { AppState } from '../../state';
import { mockState } from '../__mocks__/uptime_store.mock';
import { KibanaProviderOptions, mockCore, MockRouter } from './rtl_helpers';

interface RenderRouterOptions<ExtraCore> extends KibanaProviderOptions<ExtraCore> {
  history?: History;
  state?: Partial<AppState>;
}

const helperWithRouter: <R>(
  helper: (node: ReactElement) => R,
  component: ReactElement,
  customHistory?: MemoryHistory,
  wrapReduxStore?: boolean,
  storeState?: AppState
) => R = (helper, component, customHistory, wrapReduxStore, storeState) => {
  const history = customHistory ?? createMemoryHistory();

  history.location.key = 'TestKeyForTesting';

  const routerWrapper = (
    <KibanaContextProvider services={{ ...mockCore() }}>
      <Router history={history}>{component}</Router>
    </KibanaContextProvider>
  );

  if (wrapReduxStore) {
    return helper(
      <MountWithReduxProvider state={storeState}>{routerWrapper}</MountWithReduxProvider>
    );
  }

  return helper(routerWrapper);
};

export const renderWithRouter = (component: ReactElement, customHistory?: MemoryHistory) => {
  return helperWithRouter(renderWithI18nProvider, component, customHistory);
};

export const shallowWithRouter = (component: ReactElement, customHistory?: MemoryHistory) => {
  return helperWithRouter(shallowWithIntl, component, customHistory);
};

export const mountWithRouter = (component: ReactElement, customHistory?: MemoryHistory) => {
  return helperWithRouter(mountWithIntl, component, customHistory);
};

export const renderWithRouterRedux = (component: ReactElement, customHistory?: MemoryHistory) => {
  return helperWithRouter(renderWithI18nProvider, component, customHistory, true);
};

export const shallowWithRouterRedux = (component: ReactElement, customHistory?: MemoryHistory) => {
  return helperWithRouter(shallowWithIntl, component, customHistory, true);
};

export const mountWithRouterRedux = (
  component: ReactElement,
  options?: { customHistory?: MemoryHistory; storeState?: AppState }
) => {
  return helperWithRouter(
    mountWithIntl,
    component,
    options?.customHistory,
    true,
    options?.storeState
  );
};

/* Custom enzyme render */
export function render<ExtraCore>(
  ui: ReactElement,
  { history, core, kibanaProps, state }: RenderRouterOptions<ExtraCore> = {}
) {
  const testState: AppState = {
    ...mockState,
    ...state,
  };
  return renderWithI18nProvider(
    <MountWithReduxProvider state={testState}>
      <MockRouter history={history} kibanaProps={kibanaProps} core={core}>
        {ui}
      </MockRouter>
    </MountWithReduxProvider>
  );
}

/* Custom enzyme render */
export function mount<ExtraCore>(
  ui: ReactElement,
  { history, core, kibanaProps, state }: RenderRouterOptions<ExtraCore> = {}
) {
  const testState: AppState = {
    ...mockState,
    ...state,
  };
  return mountWithIntl(
    <MountWithReduxProvider state={testState}>
      <MockRouter history={history} kibanaProps={kibanaProps} core={core}>
        {ui}
      </MockRouter>
    </MountWithReduxProvider>
  );
}
