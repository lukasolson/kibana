/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { APIClientRequestParamsOf, APIReturnType } from '../rest';

export type GetDataStreamsStatsParams =
  APIClientRequestParamsOf<`GET /internal/dataset_quality/data_streams/stats`>['params'];
export type GetDataStreamsStatsQuery = GetDataStreamsStatsParams['query'];
export type GetDataStreamsStatsResponse =
  APIReturnType<`GET /internal/dataset_quality/data_streams/stats`>;
export type DataStreamStatType = GetDataStreamsStatsResponse['dataStreamsStats'][0];
export type DataStreamStatServiceResponse = GetDataStreamsStatsResponse;
export type GetDataStreamsDegradedDocsStatsParams =
  APIClientRequestParamsOf<`GET /internal/dataset_quality/data_streams/degraded_docs`>['params'];
export type GetDataStreamsDegradedDocsStatsQuery = GetDataStreamsDegradedDocsStatsParams['query'];

/*
Types for stats based in documents inside a DataStream
*/

export type GetDataStreamsTotalDocsParams =
  APIClientRequestParamsOf<`GET /internal/dataset_quality/data_streams/total_docs`>['params'];
export type GetDataStreamsTotalDocsQuery = GetDataStreamsTotalDocsParams['query'];

/*
Types for Degraded Fields inside a DataStream
*/

export type GetDataStreamDegradedFieldsPathParams =
  APIClientRequestParamsOf<`GET /internal/dataset_quality/data_streams/{dataStream}/degraded_fields`>['params']['path'];
export type GetDataStreamDegradedFieldsQueryParams =
  APIClientRequestParamsOf<`GET /internal/dataset_quality/data_streams/{dataStream}/degraded_fields`>['params']['query'];
export type GetDataStreamDegradedFieldsParams = GetDataStreamDegradedFieldsPathParams &
  GetDataStreamDegradedFieldsQueryParams;

/*
Types for Degraded Field Values inside a DataStream
 */

export type GetDataStreamDegradedFieldValuesPathParams =
  APIClientRequestParamsOf<`GET /internal/dataset_quality/data_streams/{dataStream}/degraded_field/{degradedField}/values`>['params']['path'];

/*
Types for DataStream Settings
*/

export type GetDataStreamSettingsParams =
  APIClientRequestParamsOf<`GET /internal/dataset_quality/data_streams/{dataStream}/settings`>['params']['path'];
export type GetDataStreamSettingsResponse =
  APIReturnType<`GET /internal/dataset_quality/data_streams/{dataStream}/settings`>;

/*
Types for DataStream Details
*/

type GetDataStreamDetailsPathParams =
  APIClientRequestParamsOf<`GET /internal/dataset_quality/data_streams/{dataStream}/details`>['params']['path'];
type GetDataStreamDetailsQueryParams =
  APIClientRequestParamsOf<`GET /internal/dataset_quality/data_streams/{dataStream}/details`>['params']['query'];
export type GetDataStreamDetailsParams = GetDataStreamDetailsPathParams &
  GetDataStreamDetailsQueryParams;
export type GetDataStreamDetailsResponse =
  APIReturnType<`GET /internal/dataset_quality/data_streams/{dataStream}/details`>;

export type GetNonAggregatableDataStreamsParams =
  APIClientRequestParamsOf<`GET /internal/dataset_quality/data_streams/non_aggregatable`>['params']['query'];

export type GetIntegrationDashboardsParams =
  APIClientRequestParamsOf<`GET /internal/dataset_quality/integrations/{integration}/dashboards`>['params']['path'];

export type { DataStreamStat } from './data_stream_stat';
export type {
  DataStreamDetails,
  DataStreamSettings,
  DegradedField,
  DegradedFieldResponse,
} from '../api_types';

/*
  Types for Failure store information
*/
export type GetDataStreamsFailedDocsStatsParams =
  APIClientRequestParamsOf<`GET /internal/dataset_quality/data_streams/failed_docs`>['params'];
export type GetDataStreamsFailedDocsStatsQuery = GetDataStreamsFailedDocsStatsParams['query'];
export type GetDataStreamsFailedDocsDetailsParams =
  APIClientRequestParamsOf<`GET /internal/dataset_quality/data_streams/{dataStream}/failed_docs`>['params'];
export type GetDataStreamsFailedDocsDetailsQuery = GetDataStreamsFailedDocsDetailsParams['query'];
export type GetDataStreamFailedDocsDetailsParams = GetDataStreamsFailedDocsDetailsParams['path'] &
  GetDataStreamsFailedDocsDetailsQuery;
export type GetDataStreamsFailedDocsErrorsParams =
  APIClientRequestParamsOf<`GET /internal/dataset_quality/data_streams/{dataStream}/failed_docs/errors`>['params'];
export type GetDataStreamsFailedDocsErrorsQuery = GetDataStreamsFailedDocsErrorsParams['query'];
export type GetDataStreamFailedDocsErrorsParams = GetDataStreamsFailedDocsErrorsParams['path'] &
  GetDataStreamsFailedDocsErrorsQuery;
