/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useQuery } from '@tanstack/react-query';
import type { QueryRulesListRulesetsQueryRulesetListItem } from '@elastic/elasticsearch/lib/api/types';
import { KibanaServerError } from '@kbn/kibana-utils-plugin/common';
import { QUERY_RULES_SETS_QUERY_KEY } from '../../common/constants';
import { DEFAULT_PAGE_VALUE, Page, Paginate } from '../../common/pagination';
import { APIRoutes } from '../../common/api_routes';
import { useKibana } from './use_kibana';

export const useFetchQueryRulesSets = (page: Page = DEFAULT_PAGE_VALUE) => {
  const {
    services: { http },
  } = useKibana();
  return useQuery<
    Paginate<QueryRulesListRulesetsQueryRulesetListItem>,
    { body: KibanaServerError }
  >({
    queryKey: [QUERY_RULES_SETS_QUERY_KEY, page.from, page.size],
    queryFn: async () => {
      return await http.get<Paginate<QueryRulesListRulesetsQueryRulesetListItem>>(
        APIRoutes.QUERY_RULES_SETS,
        {
          query: { from: page.from, size: page.size },
        }
      );
    },
    retry: false,
  });
};
