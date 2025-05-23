/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export const formatPipelineName = (rawName: string) =>
  rawName
    .trim()
    .replace(/\s+/g, '_') // Convert whitespaces to underscores
    .toLowerCase();

export const getInferencePipelineNameFromIndexName = (indexName: string) =>
  `${indexName}@ml-inference`;

export const getPrefixedInferencePipelineProcessorName = (pipelineName: string) =>
  pipelineName.startsWith('ml-inference-')
    ? formatPipelineName(pipelineName)
    : `ml-inference-${formatPipelineName(pipelineName)}`;
