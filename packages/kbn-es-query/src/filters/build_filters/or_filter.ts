/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Filter, FilterMeta, FILTERS } from './types';
import { buildEmptyFilter } from './build_empty_filter';

/**
 * @public
 */
export interface OrFilterMeta extends FilterMeta {
  type: typeof FILTERS.OR;
  params: Filter[];
}

/**
 * @public
 */
export interface OrFilter extends Filter {
  meta: OrFilterMeta;
}

/**
 * @public
 */
export function isOrFilter(filter: Filter): filter is OrFilter {
  return filter?.meta?.type === FILTERS.OR;
}

/**
 * Builds an OR filter. An OR filter is a filter with multiple sub-filters, to be combined in an OR query.
 * @param filters An array of Filters
 * @public
 */

export function buildOrFilter(filters: Filter[], alias?: string): OrFilter {
  const filter = buildEmptyFilter(false);
  return {
    ...filter,
    meta: {
      ...filter.meta,
      alias,
      type: FILTERS.OR,
      params: filters,
    },
  };
}
