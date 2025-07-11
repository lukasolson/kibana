/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useEffect, useMemo } from 'react';

import { useUpdateUrlParam } from '../../utils/global_query_string';
import type { TimelineUrl } from '../../../timelines/store/model';
import { timelineSelectors } from '../../../timelines/store';
import { TimelineId } from '../../../../common/types';
import { useShallowEqualSelector } from '../use_selector';
import { URL_PARAM_KEY } from '../use_url_state';

export const useSyncTimelineUrlParam = () => {
  const updateUrlParam = useUpdateUrlParam<TimelineUrl>(URL_PARAM_KEY.timeline);
  const getTimeline = useMemo(() => timelineSelectors.getTimelineByIdSelector(), []);
  const { activeTab, show, savedObjectId, savedSearchId, kqlQuery } = useShallowEqualSelector(
    (state) => getTimeline(state, TimelineId.active) ?? {}
  );

  useEffect(() => {
    const params = {
      ...(savedObjectId ? { id: savedObjectId } : {}),
      isOpen: show,
      activeTab,
      savedSearchId: savedSearchId ? savedSearchId : undefined,
      query: {
        kind: kqlQuery?.filterQuery?.kuery?.kind ?? 'kuery',
        expression: kqlQuery?.filterQuery?.kuery?.expression ?? '',
      },
    };
    updateUrlParam(params);
  }, [activeTab, savedObjectId, show, updateUrlParam, savedSearchId, kqlQuery]);
};
