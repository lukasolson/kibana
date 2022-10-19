/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { Filter, isAndFilter } from '../filters';
import { DataViewBase } from './types';
import { buildQueryFromFilters, EsQueryFiltersConfig } from './from_filters';

/** @internal */
export const handleAndFilter = (
  filter: Filter,
  inputDataViews?: DataViewBase | DataViewBase[],
  options: EsQueryFiltersConfig = {}
): Filter => {
  if (!isAndFilter(filter)) return filter;
  const { params } = filter.meta;
  const query = buildQueryFromFilters(params, inputDataViews, options);
  return { ...filter, query };
};
