/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { schema } from '@kbn/config-schema';
import { IRouter, Logger } from '@kbn/core/server';
import { transformError } from '@kbn/securitysolution-es-utils';
import type {
  AlertsClient,
  RuleRegistryPluginStartContract,
} from '@kbn/rule-registry-plugin/server';
import { SECURITY_SOLUTION_RULE_TYPE_IDS } from '@kbn/securitysolution-rules';
import {
  ALERT_STATUS_ROUTE,
  ALERT_UUID_PROPERTY,
  PREVIEW_ALERTS_INDEX,
} from '../../common/constants';
import { expandDottedObject } from '../../common/utils/expand_dotted_object';

export const registerAlertStatusRoute = (
  router: IRouter,
  logger: Logger,
  ruleRegistry: RuleRegistryPluginStartContract
) => {
  router.versioned
    .get({
      access: 'internal',
      path: ALERT_STATUS_ROUTE,
      security: {
        authz: {
          requiredPrivileges: ['securitySolution'],
        },
      },
    })
    .addVersion(
      {
        version: '1',
        validate: {
          request: {
            query: schema.object({
              alertUuid: schema.string(),
            }),
          },
        },
      },
      async (_context, request, response) => {
        const client = await ruleRegistry.getRacClientWithRequest(request);
        const { alertUuid } = request.query;
        try {
          const body = await searchAlertByUuid(client, alertUuid);

          return response.ok({ body });
        } catch (err) {
          const error = transformError(err);
          logger.error(`Failed to fetch alert status: ${err}`);

          return response.customError({
            body: { message: error.message },
            statusCode: error.statusCode,
          });
        }
      }
    );
};

export const searchAlertByUuid = async (client: AlertsClient, alertUuid: string) => {
  const indices = (
    await client.getAuthorizedAlertsIndices(SECURITY_SOLUTION_RULE_TYPE_IDS)
  )?.filter((index) => index !== PREVIEW_ALERTS_INDEX);

  if (!indices) {
    return { events: [] };
  }

  const result = await client.find({
    query: {
      match: {
        [ALERT_UUID_PROPERTY]: alertUuid,
      },
    },
    track_total_hits: false,
    size: 1,
    index: indices.join(','),
  });

  const events = result.hits.hits.map((hit: any) => {
    // the alert indexes flattens many properties. this util unflattens them as session view expects structured json.
    hit._source = expandDottedObject(hit._source);

    return hit;
  });

  return { events };
};
