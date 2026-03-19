/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type {
  SearchEmbeddableByReferenceState,
  SearchEmbeddableByValueState,
  SearchEmbeddableState,
  StoredSearchEmbeddableState,
} from './types';

export function isSearchEmbeddableByReferenceState(
  state: SearchEmbeddableState | StoredSearchEmbeddableState
): state is SearchEmbeddableByReferenceState {
  return 'savedObjectId' in state;
}

export function isSearchEmbeddableByValueState(
  state: StoredSearchEmbeddableState
): state is SearchEmbeddableByValueState {
  return 'attributes' in state && typeof state.attributes === 'object' && state.attributes !== null;
}

export function isSearchEmbeddableLegacyPanelState(
  state: SearchEmbeddableState | StoredSearchEmbeddableState
): state is SearchEmbeddableState {
  return isSearchEmbeddableByReferenceState(state) || isSearchEmbeddableByValueState(state);
}
