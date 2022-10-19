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
export interface AndFilterMeta extends FilterMeta {
  type: typeof FILTERS.AND;
  params: Filter[];
}

/**
 * @public
 */
export interface AndFilter extends Filter {
  meta: AndFilterMeta;
}

/**
 * @public
 */
export function isAndFilter(filter: Filter): filter is AndFilter {
  return filter?.meta?.type === FILTERS.AND;
}

/**
 * Builds an AND filter. An AND filter is a filter with multiple sub-filters, to be combined in an AND query.
 * @param filters An array of Filters
 * @public
 */

export function buildAndFilter(filters: Filter[], alias?: string): AndFilter {
  const filter = buildEmptyFilter(false);
  return {
    ...filter,
    meta: {
      ...filter.meta,
      alias,
      type: FILTERS.AND,
      params: filters,
    },
  };
}
