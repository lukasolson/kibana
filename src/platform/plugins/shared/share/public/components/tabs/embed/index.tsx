/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { i18n } from '@kbn/i18n';
import React from 'react';
import { type IModalTabDeclaration } from '@kbn/shared-ux-tabbed-modal';
import { EmbedContent } from './embed_content';
import { useShareTypeContext } from '../../context';

type IEmbedTab = IModalTabDeclaration<{ url: string; isNotSaved: boolean }>;

const EmbedTabContent: NonNullable<IEmbedTab['content']> = ({ state, dispatch }) => {
  const {
    shareableUrlForSavedObject,
    shareableUrl,
    objectType,
    objectTypeMeta,
    isDirty,
    allowShortUrl,
    shareableUrlLocatorParams,
    shareMenuItems,
  } = useShareTypeContext('embed');

  return (
    <EmbedContent
      {...{
        shareableUrlForSavedObject,
        shareableUrl,
        objectType,
        objectConfig: objectTypeMeta?.config,
        isDirty,
        allowShortUrl,
        anonymousAccess: shareMenuItems.config.anonymousAccess,
        shortUrlService: shareMenuItems.config.shortUrlService,
        shareableUrlLocatorParams,
      }}
    />
  );
};

export const embedTab: IEmbedTab = {
  id: 'embed',
  name: i18n.translate('share.contextMenu.embedCodeTab', {
    defaultMessage: 'Embed',
  }),
  content: EmbedTabContent,
};
