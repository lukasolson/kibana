/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { cloneDeep } from 'lodash';

import type { estypes } from '@elastic/elasticsearch';

const DEFAULT_DSL_QUERY: estypes.QueryDslQueryContainer = {
  bool: {
    must: [
      {
        match_all: {},
      },
    ],
  },
};

/**
 * Default DSL query which matches all the results
 */
export function getDefaultDSLQuery(): estypes.QueryDslQueryContainer {
  return cloneDeep(DEFAULT_DSL_QUERY);
}
