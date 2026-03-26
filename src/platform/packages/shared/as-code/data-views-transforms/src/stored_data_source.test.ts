/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { DataViewSpec } from '@kbn/data-views-plugin/common';
import {
  AS_CODE_DATA_VIEW_REFERENCE_TYPE,
  AS_CODE_DATA_VIEW_SPEC_TYPE,
  type AsCodeDataViewReference,
  type AsCodeDataViewSpec,
} from '@kbn/as-code-data-views-schema';
import { fromStoredDataView } from './from_stored_data_view';
import { toStoredDataView } from './to_stored_data_view';

describe('fromStoredDataView', () => {
  it('throws when index is null', () => {
    expect(() => fromStoredDataView(null as unknown as string)).toThrow(
      'Data view is required to convert from stored data view'
    );
  });

  it('returns data_view_reference when index is a string id', () => {
    const result = fromStoredDataView('my-data-view-id');
    expect(result).toEqual({ type: AS_CODE_DATA_VIEW_REFERENCE_TYPE, id: 'my-data-view-id' });
  });

  it('throws when index object has no title or id', () => {
    expect(() => fromStoredDataView({ timeFieldName: '@timestamp' } as unknown as string)).toThrow(
      'Stored index object must have a title or id to convert to data view'
    );
  });

  it('transforms index-pattern object to AsCodeDataViewSpec', () => {
    const index: DataViewSpec = {
      id: 'eaa3802b-a071-49c0-8442-1fcd2cdcc9fa',
      title: 'f*',
      timeFieldName: '@timestamp',
      sourceFilters: [],
      fieldFormats: {
        foobar: {
          id: 'url',
          params: {
            parsedUrl: {
              origin: 'http://localhost:5601',
              pathname: '/app/dashboards',
              basePath: '',
            },
            type: 'a',
            urlTemplate: 'http://google.com?q={{value}}',
            labelTemplate: 'google search for {{value}}',
            width: null,
            height: null,
          },
        },
      },
      runtimeFieldMap: {
        foobar: {
          type: 'keyword',
          script: {
            source: 'emit(UUID.randomUUID().toString())',
          },
        },
      },
      fieldAttrs: {
        foobar: {
          customLabel: 'my custom label',
          customDescription: 'my custom description',
        },
      },
      allowNoIndex: false,
      name: 'f*',
      allowHidden: false,
      managed: false,
    };
    const expected: AsCodeDataViewSpec = {
      type: AS_CODE_DATA_VIEW_SPEC_TYPE,
      index_pattern: 'f*',
      time_field: '@timestamp',
      runtime_fields: [
        {
          type: 'keyword',
          name: 'foobar',
          script: 'emit(UUID.randomUUID().toString())',
          format: {
            type: 'url',
            params: {
              parsedUrl: {
                origin: 'http://localhost:5601',
                pathname: '/app/dashboards',
                basePath: '',
              },
              type: 'a',
              urlTemplate: 'http://google.com?q={{value}}',
              labelTemplate: 'google search for {{value}}',
              width: null,
              height: null,
            },
          },
          custom_label: 'my custom label',
          custom_description: 'my custom description',
        },
      ],
    };
    const result = fromStoredDataView(index);
    expect(result).toEqual(expected);
  });
});

describe('toStoredDataView', () => {
  it('converts data_view_reference data_source to string id', () => {
    const dataView: AsCodeDataViewReference = {
      type: AS_CODE_DATA_VIEW_REFERENCE_TYPE,
      id: 'my-data-view-id',
    };
    const result = toStoredDataView(dataView);
    expect(result).toBe('my-data-view-id');
  });

  it('converts index-pattern data_source to serialized index spec', () => {
    const dataView: AsCodeDataViewSpec = {
      type: AS_CODE_DATA_VIEW_SPEC_TYPE,
      index_pattern: 'my-index-*',
      time_field: '@timestamp',
      runtime_fields: [
        {
          name: 'rt',
          type: 'keyword',
          script: 'emit(doc["id"].value)',
          format: { type: 'string' },
        },
      ],
    };
    const result = toStoredDataView(dataView);
    expect(result).toEqual({
      title: 'my-index-*',
      timeFieldName: '@timestamp',
      fieldFormats: {
        rt: { id: 'string', params: undefined },
      },
      fieldAttrs: {
        rt: {},
      },
      runtimeFieldMap: {
        rt: {
          type: 'keyword',
          script: { source: 'emit(doc["id"].value)' },
        },
      },
    });
  });

  it('converts index-pattern data_source without runtime fields', () => {
    const dataView: AsCodeDataViewSpec = {
      type: AS_CODE_DATA_VIEW_SPEC_TYPE,
      index_pattern: 'logs-*',
      time_field: '@timestamp',
    };
    const result = toStoredDataView(dataView);
    expect(result).toEqual({
      title: 'logs-*',
      timeFieldName: '@timestamp',
    });
  });
});
