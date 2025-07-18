/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

export { observer } from './src/lib/agent_config';
export type { AgentConfigFields } from './src/lib/agent_config/agent_config_fields';
export { apm, apmOtel } from './src/lib/apm';
export type { ApmFields } from './src/lib/apm/apm_fields';
export type {
  ApmOtelFields,
  ApmOtelAttributes,
  SpanKind,
} from './src/lib/apm/otel/apm_otel_fields';
export type { Instance } from './src/lib/apm/instance';
export type { OtelInstance } from './src/lib/apm/otel/otel_instance';
export { MobileDevice } from './src/lib/apm/mobile_device';
export type {
  DeviceInfo,
  GeoInfo,
  NetworkConnectionInfo,
  OSInfo,
} from './src/lib/apm/mobile_device';
export { httpExitSpan } from './src/lib/apm/span';
export { DistributedTrace } from './src/lib/dsl/distributed_trace_client';
export { serviceMap } from './src/lib/dsl/service_map';
export type { Fields } from './src/lib/entity';
export { Entity } from './src/lib/entity';
export { infra, type InfraDocument } from './src/lib/infra';
export { parseInterval } from './src/lib/interval';
export { monitoring, type MonitoringDocument } from './src/lib/monitoring';
export { Serializable } from './src/lib/serializable';
export { timerange } from './src/lib/timerange';
export type { Timerange } from './src/lib/timerange';
export { dedot } from './src/lib/utils/dedot';
export {
  generateLongId,
  generateShortId,
  setIdGeneratorStrategy,
} from './src/lib/utils/generate_id';
export { appendHash, hashKeysOf } from './src/lib/utils/hash';
export {
  type ESDocumentWithOperation,
  type SynthtraceESAction,
  type SynthtraceGenerator,
  type SynthtraceDynamicTemplate,
  type ApmSynthtracePipelines,
  ApmSynthtracePipelineSchema,
} from './src/types';
export { log, type LogDocument, LONG_FIELD_NAME } from './src/lib/logs';
export { otelLog, type OtelLogDocument } from './src/lib/otel_logs';
export { syntheticsMonitor, type SyntheticsMonitorDocument } from './src/lib/synthetics';
