/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import {
  elasticsearchServiceMock,
  loggingSystemMock,
  savedObjectsClientMock,
  savedObjectsRepositoryMock,
} from '@kbn/core/server/mocks';
import { encryptedSavedObjectsMock } from '@kbn/encrypted-saved-objects-plugin/server/mocks';
import type { Logger } from '@kbn/core/server';
import type { ActionsClientMock } from './actions_client/actions_client.mock';
import { actionsClientMock } from './actions_client/actions_client.mock';
import type { PluginSetupContract, PluginStartContract } from './plugin';
import { renderActionParameterTemplates } from './plugin';
import type { Services, UnsecuredServices } from './types';
import { actionsAuthorizationMock } from './authorization/actions_authorization.mock';
import { ConnectorTokenClient } from './lib/connector_token_client';
import { unsecuredActionsClientMock } from './unsecured_actions_client/unsecured_actions_client.mock';
export { actionsAuthorizationMock };
export { actionsClientMock };
export type { ActionsClientMock };

const logger = loggingSystemMock.create().get() as jest.Mocked<Logger>;

const createSetupMock = () => {
  const mock: jest.Mocked<PluginSetupContract> = {
    registerType: jest.fn(),
    registerSubActionConnectorType: jest.fn(),
    isPreconfiguredConnector: jest.fn(),
    getSubActionConnectorClass: jest.fn(),
    getCaseConnectorClass: jest.fn(),
    getActionsHealth: jest.fn(),
    getActionsConfigurationUtilities: jest.fn().mockReturnValue({
      getAwsSesConfig: jest.fn(),
    }),
    setEnabledConnectorTypes: jest.fn(),
    isActionTypeEnabled: jest.fn(),
  };
  return mock;
};

const createStartMock = () => {
  const mock: jest.Mocked<PluginStartContract> = {
    isActionTypeEnabled: jest.fn(),
    isActionExecutable: jest.fn(),
    getAllTypes: jest.fn(),
    getActionsClientWithRequest: jest.fn().mockResolvedValue(actionsClientMock.create()),
    getUnsecuredActionsClient: jest.fn().mockReturnValue(unsecuredActionsClientMock.create()),
    getActionsAuthorizationWithRequest: jest
      .fn()
      .mockReturnValue(actionsAuthorizationMock.create()),
    inMemoryConnectors: [],
    renderActionParameterTemplates: jest.fn(),
    isSystemActionConnector: jest.fn(),
  };
  return mock;
};

// this is a default renderer that escapes nothing
export function renderActionParameterTemplatesDefault<RecordType>(
  actionTypeId: string,
  actionId: string,
  params: Record<string, unknown>,
  variables: Record<string, unknown>
) {
  return renderActionParameterTemplates(
    logger,
    undefined,
    actionTypeId,
    actionId,
    params,
    variables
  );
}

const createServicesMock = () => {
  const mock: jest.Mocked<
    Services & {
      savedObjectsClient: ReturnType<typeof savedObjectsClientMock.create>;
    }
  > = {
    savedObjectsClient: savedObjectsClientMock.create(),
    scopedClusterClient: elasticsearchServiceMock.createScopedClusterClient().asCurrentUser,
    connectorTokenClient: new ConnectorTokenClient({
      unsecuredSavedObjectsClient: savedObjectsClientMock.create(),
      encryptedSavedObjectsClient: encryptedSavedObjectsMock.createClient(),
      logger,
    }),
  };
  return mock;
};

const createUnsecuredServicesMock = () => {
  const mock: jest.Mocked<
    UnsecuredServices & {
      savedObjectsClient: ReturnType<typeof savedObjectsRepositoryMock.create>;
    }
  > = {
    savedObjectsClient: savedObjectsRepositoryMock.create(),
    scopedClusterClient: elasticsearchServiceMock.createScopedClusterClient().asCurrentUser,
    connectorTokenClient: new ConnectorTokenClient({
      unsecuredSavedObjectsClient: savedObjectsRepositoryMock.create(),
      encryptedSavedObjectsClient: encryptedSavedObjectsMock.createClient(),
      logger,
    }),
  };
  return mock;
};

export const actionsMock = {
  createServices: createServicesMock,
  createUnsecuredServices: createUnsecuredServicesMock,
  createSetup: createSetupMock,
  createStart: createStartMock,
};
