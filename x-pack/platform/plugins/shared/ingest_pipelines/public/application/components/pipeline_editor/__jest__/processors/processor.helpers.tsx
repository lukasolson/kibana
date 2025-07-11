/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { act } from 'react-dom/test-utils';
import React from 'react';

import { usageCollectionPluginMock } from '@kbn/usage-collection-plugin/public/mocks';
import { docLinksServiceMock } from '@kbn/core/public/mocks';
import { HttpSetup } from '@kbn/core/public';

import { registerTestBed, TestBed } from '@kbn/test-jest-helpers';
import { stubWebWorker } from '@kbn/test-jest-helpers';
import { uiMetricService, apiService, documentationService } from '../../../../services';
import { Props } from '../..';
import { initHttpRequests } from '../http_requests.helpers';
import { ProcessorsEditorWithDeps } from '../processors_editor';

stubWebWorker();

jest.mock('@kbn/code-editor', () => {
  const original = jest.requireActual('@kbn/code-editor');
  return {
    ...original,
    // Mocking CodeEditor, which uses React Monaco under the hood
    CodeEditor: (props: any) => (
      <input
        data-test-subj={props['data-test-subj'] || 'mockCodeEditor'}
        data-currentvalue={props.value}
        onChange={(e: any) => {
          props.onChange(e.jsonContent);
        }}
      />
    ),
  };
});

jest.mock('@elastic/eui', () => {
  const original = jest.requireActual('@elastic/eui');
  return {
    ...original,
    // Mocking EuiComboBox, as it utilizes "react-virtualized" for rendering search suggestions,
    // which does not produce a valid component wrapper
    EuiComboBox: (props: any) => (
      <input
        data-test-subj={props['data-test-subj']}
        data-currentvalue={props.selectedOptions}
        onChange={async (syntheticEvent: any) => {
          props.onChange([syntheticEvent['0']]);
        }}
      />
    ),
  };
});

jest.mock('react-virtualized/dist/commonjs/AutoSizer', () => ({ children }: { children: any }) => (
  <div>{children({ height: 500, width: 500 })}</div>
));

const testBedSetup = registerTestBed<TestSubject>(
  (props: Props) => <ProcessorsEditorWithDeps {...props} />,
  {
    doMountAsync: false,
  }
);

export interface SetupResult extends TestBed<TestSubject> {
  actions: ReturnType<typeof createActions>;
}

const createActions = (testBed: TestBed<TestSubject>) => {
  const { find, component } = testBed;

  return {
    async saveNewProcessor() {
      await act(async () => {
        find('addProcessorForm.submitButton').simulate('click');
        jest.advanceTimersByTime(0); // advance timers to allow the form to validate
      });
      component.update();
    },

    async addProcessorType(type: string) {
      await act(async () => {
        find('processorTypeSelector.input').simulate('change', [{ value: type }]);
      });
      component.update();
    },

    addProcessor() {
      find('addProcessorButton').simulate('click');
    },
  };
};

export const setup = async (httpSetup: HttpSetup, props: Props): Promise<SetupResult> => {
  apiService.setup(httpSetup, uiMetricService);

  const testBed = testBedSetup(props);
  return {
    ...testBed,
    actions: createActions(testBed),
  };
};

export const setupEnvironment = () => {
  // Initialize mock services
  uiMetricService.setup(usageCollectionPluginMock.createSetupContract());
  documentationService.setup(docLinksServiceMock.createStartContract());

  return initHttpRequests();
};

export const getProcessorValue = (onUpdate: jest.Mock, type: string) => {
  const [onUpdateResult] = onUpdate.mock.calls[onUpdate.mock.calls.length - 1];
  const { processors } = onUpdateResult.getData();
  return processors;
};

type TestSubject =
  | 'addProcessorForm.submitButton'
  | 'addProcessorButton'
  | 'addProcessorForm.submitButton'
  | 'comboxValueField.input'
  | 'allowDuplicatesSwitch.input'
  | 'formatsValueField.input'
  | 'timezoneField.input'
  | 'outputFormatField.input'
  | 'localeField.input'
  | 'processorTypeSelector.input'
  | 'fieldNameField.input'
  | 'policyNameField.input'
  | 'messageField.input'
  | 'mockCodeEditor'
  | 'pathField.input'
  | 'tagField.input'
  | 'typeSelectorField'
  | 'dateRoundingField'
  | 'ignoreMissingSwitch.input'
  | 'ignoreFailureSwitch.input'
  | 'indexNamePrefixField.input'
  | 'indexNameFormatField.input'
  | 'dateFormatsField.input'
  | 'timezoneField.input'
  | 'localeField.input'
  | 'ifField.textarea'
  | 'targetField.input'
  | 'targetFieldsField.input'
  | 'keepOriginalField.input'
  | 'removeIfSuccessfulField.input'
  | 'shapeSelectorField'
  | 'errorDistanceField.input'
  | 'separatorValueField.input'
  | 'quoteValueField.input'
  | 'emptyValueField.input'
  | 'extractDeviceTypeSwitch.input'
  | 'propertiesValueField'
  | 'regexFileField.input'
  | 'textValueField.input'
  | 'mediaTypeSelectorField'
  | 'networkDirectionField.input'
  | 'toggleCustomField'
  | 'toggleRemoveField'
  | 'toggleCustomField.input'
  | 'ignoreEmptyField.input'
  | 'overrideField.input'
  | 'fieldsValueField.input'
  | 'saltValueField.input'
  | 'methodsValueField'
  | 'sourceIpField.input'
  | 'sourcePortField.input'
  | 'destinationIpField.input'
  | 'destinationPortField.input'
  | 'icmpTypeField.input'
  | 'icmpCodeField.input'
  | 'ianaField.input'
  | 'transportField.input'
  | 'seedField.input'
  | 'copyFromInput.input'
  | 'trimSwitch.input'
  | 'droppableList.addButton'
  | 'droppableList.input-0'
  | 'droppableList.input-1'
  | 'droppableList.input-2'
  | 'prefixField.input'
  | 'suffixField.input'
  | 'indexedCharsField.input'
  | 'indexedCharsFieldField.input'
  | 'removeBinaryField.input'
  | 'resourceNameField.input'
  | 'propertiesField'
  | 'tileTypeField'
  | 'targetFormatField'
  | 'parentField.input'
  | 'childrenField.input'
  | 'nonChildrenField.input'
  | 'precisionField.input'
  | 'patternDefinitionsField'
  | 'pipelineNameField.input'
  | 'ignoreMissingPipelineSwitch.input'
  | 'destinationField.input'
  | 'datasetField.input'
  | 'namespaceField.input'
  | 'processorField'
  | 'paramsField'
  | 'scriptSource'
  | 'inferenceModelId.input'
  | 'inferenceConfig'
  | 'fieldMap'
  | 'toggleTextField'
  | 'jsonValueField';
