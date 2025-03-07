/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { FieldMap } from '@kbn/alerts-as-data-utils';

export const uptimeRuleFieldMap: FieldMap = {
  // common fields
  'monitor.id': {
    type: 'keyword',
    required: false,
  },
  'url.full': {
    type: 'keyword',
    required: false,
  },
  'observer.name': {
    type: 'keyword',
    array: true,
    required: false,
  },
  'observer.geo.name': {
    type: 'keyword',
    array: true,
    required: false,
  },
  // monitor status alert fields
  'error.message': {
    type: 'text',
    required: false,
  },
  'error.stack_trace': {
    type: 'wildcard',
    required: false,
  },
  'agent.name': {
    type: 'keyword',
    required: false,
  },
  'monitor.name': {
    type: 'keyword',
    required: false,
  },
  'monitor.type': {
    type: 'keyword',
    required: false,
  },
  'monitor.tags': {
    type: 'keyword',
    array: true,
    required: false,
  },
  'monitor.state.id': {
    type: 'keyword',
    required: false,
  },
  configId: {
    type: 'keyword',
    required: false,
  },
  'host.name': {
    type: 'keyword',
    required: false,
  },
  'location.id': {
    type: 'keyword',
    array: true,
    required: false,
  },
  'location.name': {
    type: 'keyword',
    array: true,
    required: false,
  },
  // tls alert fields
  'tls.server.x509.issuer.common_name': {
    type: 'keyword',
    required: false,
  },
  'tls.server.x509.subject.common_name': {
    type: 'keyword',
    required: false,
  },
  'tls.server.x509.not_after': {
    type: 'date',
    required: false,
  },
  'tls.server.x509.not_before': {
    type: 'date',
    required: false,
  },
  'tls.server.hash.sha256': {
    type: 'keyword',
    required: false,
  },
  // anomaly alert fields
  'anomaly.start': {
    type: 'date',
    required: false,
  },
  'anomaly.bucket_span.minutes': {
    type: 'keyword',
    required: false,
  },
  'service.name': {
    type: 'keyword',
    required: false,
  },
  labels: {
    type: 'object',
    required: false,
  },
} as const;
