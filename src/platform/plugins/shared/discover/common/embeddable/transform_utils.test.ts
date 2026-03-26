/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { SavedObjectReference } from '@kbn/core-saved-objects-common/src/server_types';
import {
  byReferenceDiscoverSessionToSavedSearchEmbeddableState,
  byReferenceSavedSearchToDiscoverSessionEmbeddableState,
  byValueDiscoverSessionToSavedSearchEmbeddableState,
  byValueSavedSearchToDiscoverSessionEmbeddableState,
  discoverSessionToSavedSearchEmbeddableState,
  fromStoredDataset,
  fromStoredGrid,
  fromStoredHeight,
  fromStoredSearchEmbeddableState,
  fromStoredSort,
  fromStoredTab,
  savedSearchToDiscoverSessionEmbeddableState,
  toStoredDataset,
  toStoredGrid,
  toStoredHeight,
  toStoredSearchEmbeddableState,
  toStoredSort,
  toStoredTab,
} from './transform_utils';
import type {
  SearchEmbeddableByReferenceState,
  StoredSearchEmbeddableByReferenceState,
  StoredSearchEmbeddableByValueState,
  StoredSearchEmbeddableState,
} from './types';
import { SAVED_SEARCH_SAVED_OBJECT_REF_NAME } from './constants';
import { SavedSearchType, VIEW_MODE } from '@kbn/saved-search-plugin/common';
import type {
  DiscoverSessionEmbeddableByReferenceState,
  DiscoverSessionEmbeddableByValueState,
} from '../../server';
import { DataGridDensity } from '@kbn/discover-utils';
import type {
  DiscoverSessionDataViewReference,
  DiscoverSessionDataViewSpec,
} from '../../server/embeddable';
import type { DataViewSpec } from '@kbn/data-views-plugin/common';
import { ASCODE_FILTER_OPERATOR, ASCODE_FILTER_TYPE } from '@kbn/as-code-filters-constants';

describe('search embeddable transform utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('savedSearchToDiscoverSessionEmbeddableState', () => {
    it('dispatches to by-reference transform when state has no attributes', () => {
      const storedState: StoredSearchEmbeddableByReferenceState = {
        title: 'My Search',
        description: 'My description',
        time_range: { from: 'now-15m', to: 'now' },
      };
      const references: SavedObjectReference[] = [
        { name: SAVED_SEARCH_SAVED_OBJECT_REF_NAME, type: SavedSearchType, id: 'session-123' },
      ];
      const result = savedSearchToDiscoverSessionEmbeddableState(storedState, references);
      expect(result).toMatchObject({
        title: 'My Search',
        description: 'My description',
        time_range: { from: 'now-15m', to: 'now' },
        discover_session_id: 'session-123',
        selected_tab_id: undefined,
        overrides: {},
      });
    });

    it('dispatches to by-value transform when state has attributes', () => {
      const storedState = {
        title: 'My Search',
        description: 'My description',
        attributes: {
          title: '',
          sort: [['@timestamp', 'desc']],
          columns: ['message'],
          grid: {},
          hideChart: false,
          viewMode: VIEW_MODE.DOCUMENT_LEVEL,
          isTextBasedQuery: false,
          timeRestore: false,
          kibanaSavedObjectMeta: {
            searchSourceJSON:
              '{"query":{"language":"kuery","query":""},"index":"dv-1","filter":[]}',
          },
          tabs: [
            {
              id: 'tab-1',
              label: 'Tab 1',
              attributes: {
                sort: [['@timestamp', 'desc']],
                columns: ['message'],
                grid: {},
                hideChart: false,
                viewMode: VIEW_MODE.DOCUMENT_LEVEL,
                isTextBasedQuery: false,
                timeRestore: false,
                kibanaSavedObjectMeta: {
                  searchSourceJSON:
                    '{"query":{"language":"kuery","query":""},"index":"dv-1","filter":[]}',
                },
              },
            },
          ],
        },
      } as StoredSearchEmbeddableByValueState;
      const references: SavedObjectReference[] = [
        { name: 'kibanaSavedObjectMeta.searchSourceJSON.index', type: 'index-pattern', id: 'dv-1' },
      ];
      const result = savedSearchToDiscoverSessionEmbeddableState(storedState, references);
      expect('tabs' in result && result.tabs).toBeDefined();
      expect('tabs' in result && Array.isArray(result.tabs)).toBe(true);
      expect('tabs' in result && result.tabs.length).toBe(1);
    });

    it('merges attributes.references when converting by-value legacy state (embedded save and return)', () => {
      const dataViewId = 'dv-from-embedded-editor';
      const indexRefName = 'kibanaSavedObjectMeta.searchSourceJSON.index';
      const searchSourceWithRef = JSON.stringify({
        query: { language: 'kuery', query: '' },
        filter: [],
        indexRefName,
      });
      const storedState = {
        title: 'Panel from Discover',
        description: '',
        attributes: {
          title: '',
          sort: [['@timestamp', 'desc']],
          columns: ['message'],
          grid: {},
          hideChart: false,
          viewMode: VIEW_MODE.DOCUMENT_LEVEL,
          isTextBasedQuery: false,
          timeRestore: false,
          kibanaSavedObjectMeta: {
            searchSourceJSON: searchSourceWithRef,
          },
          references: [{ name: indexRefName, type: 'index-pattern', id: dataViewId }],
          tabs: [
            {
              id: 'tab-1',
              label: 'Tab 1',
              attributes: {
                sort: [['@timestamp', 'desc']],
                columns: ['message'],
                grid: {},
                hideChart: false,
                viewMode: VIEW_MODE.DOCUMENT_LEVEL,
                isTextBasedQuery: false,
                timeRestore: false,
                kibanaSavedObjectMeta: {
                  searchSourceJSON: searchSourceWithRef,
                },
              },
            },
          ],
        },
      } as StoredSearchEmbeddableByValueState;

      const result = savedSearchToDiscoverSessionEmbeddableState(storedState);

      expect('tabs' in result && result.tabs).toBeDefined();
      expect('tabs' in result && result.tabs?.[0]).toMatchObject({
        dataset: { type: 'dataView', id: dataViewId },
      });
    });
  });

  describe('discoverSessionToSavedSearchEmbeddableState', () => {
    it('dispatches to by-reference transform when state has discover_session_id', () => {
      const apiState: DiscoverSessionEmbeddableByReferenceState = {
        title: 'My Search',
        description: 'My description',
        time_range: { from: 'now-15m', to: 'now' },
        discover_session_id: 'session-456',
        selected_tab_id: undefined,
        overrides: {},
      };
      const { state, references } = discoverSessionToSavedSearchEmbeddableState(apiState);
      expect(references).toContainEqual({
        name: SAVED_SEARCH_SAVED_OBJECT_REF_NAME,
        type: SavedSearchType,
        id: 'session-456',
      });
      expect(state).toMatchObject({
        title: 'My Search',
        description: 'My description',
        time_range: { from: 'now-15m', to: 'now' },
      });
    });

    it('dispatches to by-value transform when state has tabs', () => {
      const apiState: DiscoverSessionEmbeddableByValueState = {
        title: 'Panel Title',
        description: 'Panel description',
        tabs: [
          {
            column_order: ['message'],
            sort: [],
            view_mode: VIEW_MODE.DOCUMENT_LEVEL,
            density: DataGridDensity.COMPACT,
            header_row_height: 'auto',
            row_height: 'auto',
            query: { language: 'kuery', query: '' },
            filters: [],
            dataset: { type: 'dataView', id: 'data-view-1' },
          },
        ],
      };
      const { state, references } = discoverSessionToSavedSearchEmbeddableState(apiState);
      expect(state).toHaveProperty('attributes');
      expect((state as StoredSearchEmbeddableByValueState).attributes.tabs).toHaveLength(1);
      expect(references).toContainEqual({
        id: 'data-view-1',
        name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
        type: 'index-pattern',
      });
    });
  });

  describe('byValueSavedSearchToDiscoverSessionEmbeddableState', () => {
    it('converts to DiscoverSessionEmbeddableByValueState', () => {
      const storedState: StoredSearchEmbeddableByValueState = {
        title: '[filebeat-*] elasticsearch logs',
        description: 'my description',
        // type: 'search',
        attributes: {
          kibanaSavedObjectMeta: {
            searchSourceJSON:
              '{"query":{"language":"kuery","query":"service.type: \\"elasticsearch\\""},"highlightAll":true,"fields":[{"field":"*","include_unmapped":true}],"sort":[{"@timestamp":{"order":"desc","format":"strict_date_optional_time"}},{"_doc":"desc"}],"filter":[{"meta":{"disabled":false,"negate":false,"alias":null,"key":"service.type","field":"service.type","params":{"query":"elasticsearch"},"type":"phrase","index":"c7d7a1f5-19da-4ba9-af15-5919e8cd2528"},"query":{"match_phrase":{"service.type":"elasticsearch"}},"$state":{"store":"appState"}}],"index":"c7d7a1f5-19da-4ba9-af15-5919e8cd2528"}',
          },
          title: '',
          sort: [['@timestamp', 'desc']],
          columns: ['message'],
          description: '',
          grid: {},
          hideChart: false,
          viewMode: VIEW_MODE.DOCUMENT_LEVEL,
          isTextBasedQuery: false,
          timeRestore: false,
          tabs: [
            {
              id: 'e0ae3a4e-67b9-4383-a8c1-ce463000b4bd',
              label: 'Untitled',
              attributes: {
                kibanaSavedObjectMeta: {
                  searchSourceJSON:
                    '{"query":{"language":"kuery","query":"service.type: \\"elasticsearch\\""},"highlightAll":true,"fields":[{"field":"*","include_unmapped":true}],"sort":[{"@timestamp":{"order":"desc","format":"strict_date_optional_time"}},{"_doc":"desc"}],"filter":[{"meta":{"disabled":false,"negate":false,"alias":null,"key":"service.type","field":"service.type","params":{"query":"elasticsearch"},"type":"phrase","index":"c7d7a1f5-19da-4ba9-af15-5919e8cd2528"},"query":{"match_phrase":{"service.type":"elasticsearch"}},"$state":{"store":"appState"}}],"index":"c7d7a1f5-19da-4ba9-af15-5919e8cd2528"}',
                },
                sort: [['@timestamp', 'desc']],
                columns: ['message'],
                grid: {},
                hideChart: false,
                viewMode: VIEW_MODE.DOCUMENT_LEVEL,
                isTextBasedQuery: false,
                timeRestore: false,
              },
            },
          ],
        },
      };

      const expected: DiscoverSessionEmbeddableByValueState = {
        title: '[filebeat-*] elasticsearch logs',
        description: 'my description',
        tabs: [
          {
            query: { language: 'kuery', query: 'service.type: "elasticsearch"' },
            filters: [
              {
                type: ASCODE_FILTER_TYPE.CONDITION,
                condition: {
                  field: 'service.type',
                  operator: ASCODE_FILTER_OPERATOR.IS,
                  value: 'elasticsearch',
                },
                data_view_id: 'c7d7a1f5-19da-4ba9-af15-5919e8cd2528',
                disabled: false,
                negate: false,
              },
            ],
            sort: [{ name: '@timestamp', direction: 'desc' }],
            column_order: ['message'],
            view_mode: VIEW_MODE.DOCUMENT_LEVEL,
            density: DataGridDensity.COMPACT,
            header_row_height: 3,
            dataset: {
              type: 'dataView',
              id: 'c7d7a1f5-19da-4ba9-af15-5919e8cd2528',
            },
          },
        ],
      };

      const result = byValueSavedSearchToDiscoverSessionEmbeddableState(storedState);

      expect(result).toEqual(expected);
    });
  });

  describe('byReferenceSavedSearchToDiscoverSessionEmbeddableState', () => {
    it('converts stored by-reference state to discover session embeddable state with references', () => {
      const storedSearch: StoredSearchEmbeddableByReferenceState = {
        title: 'My Saved Search',
        description: 'My description',
        time_range: { from: 'now-15m', to: 'now' },
      };
      const references: SavedObjectReference[] = [
        { name: 'savedObjectRef', type: SavedSearchType, id: 'session-123' },
      ];
      const result = byReferenceSavedSearchToDiscoverSessionEmbeddableState(
        storedSearch,
        references
      );
      expect(result).toEqual({
        title: 'My Saved Search',
        description: 'My description',
        time_range: { from: 'now-15m', to: 'now' },
        discover_session_id: 'session-123',
        selected_tab_id: undefined,
        overrides: {},
      });
    });

    it('puts editable panel fields in overrides (not top-level) and maps selectedTabId to selected_tab_id', () => {
      const storedSearch: StoredSearchEmbeddableByReferenceState = {
        title: 'My Saved Search',
        description: 'My description',
        time_range: { from: 'now-15m', to: 'now' },
        selectedTabId: 'tab-active',
        sort: [['@timestamp', 'desc']],
        columns: ['message'],
        rowHeight: -1,
        sampleSize: 500,
        rowsPerPage: 100,
        headerRowHeight: 3,
        density: DataGridDensity.COMPACT,
        grid: {
          columns: {
            message: { width: 100 },
          },
        },
      };
      const references: SavedObjectReference[] = [
        { name: SAVED_SEARCH_SAVED_OBJECT_REF_NAME, type: SavedSearchType, id: 'session-xyz' },
      ];
      const result = byReferenceSavedSearchToDiscoverSessionEmbeddableState(
        storedSearch,
        references
      );
      expect(result).toEqual({
        title: 'My Saved Search',
        description: 'My description',
        time_range: { from: 'now-15m', to: 'now' },
        discover_session_id: 'session-xyz',
        selected_tab_id: 'tab-active',
        overrides: {
          sort: [{ name: '@timestamp', direction: 'desc' }],
          column_order: ['message'],
          column_settings: { message: { width: 100 } },
          row_height: 'auto',
          sample_size: 500,
          rows_per_page: 100,
          header_row_height: 3,
          density: DataGridDensity.COMPACT,
        },
      });
      expect(result).not.toHaveProperty('sort');
      expect(result).not.toHaveProperty('columns');
      expect(result).not.toHaveProperty('selectedTabId');
    });

    it('throws when no saved search reference matches type and name', () => {
      const storedSearch: StoredSearchEmbeddableByReferenceState = {
        title: 'My Saved Search',
      };
      expect(() =>
        byReferenceSavedSearchToDiscoverSessionEmbeddableState(storedSearch, [])
      ).toThrow(`Missing reference of type "${SavedSearchType}"`);
      expect(() =>
        byReferenceSavedSearchToDiscoverSessionEmbeddableState(storedSearch, [
          { name: 'wrongRefName', type: SavedSearchType, id: 'id-1' },
        ])
      ).toThrow(`Missing reference of type "${SavedSearchType}"`);
    });

    it('uses the reference that matches SavedSearchType and SAVED_SEARCH_SAVED_OBJECT_REF_NAME', () => {
      const storedSearch: StoredSearchEmbeddableByReferenceState = {
        title: 'Panel',
      };
      const references: SavedObjectReference[] = [
        { name: 'kibanaSavedObjectMeta.searchSourceJSON.index', type: 'index-pattern', id: 'dv-1' },
        { name: SAVED_SEARCH_SAVED_OBJECT_REF_NAME, type: SavedSearchType, id: 'session-picked' },
      ];
      const result = byReferenceSavedSearchToDiscoverSessionEmbeddableState(
        storedSearch,
        references
      );
      expect(result.discover_session_id).toBe('session-picked');
    });

    it('uses savedObjectId on state when present so a saved search reference is not required', () => {
      const storedSearch: SearchEmbeddableByReferenceState = {
        title: 'Runtime / API state',
        savedObjectId: 'session-without-ref-array',
      };
      const result = byReferenceSavedSearchToDiscoverSessionEmbeddableState(storedSearch, []);
      expect(result.discover_session_id).toBe('session-without-ref-array');
    });

    it('prefers savedObjectId on state over the matching saved search reference', () => {
      const storedSearch: SearchEmbeddableByReferenceState = {
        title: 'Panel',
        savedObjectId: 'id-from-state',
      };
      const references: SavedObjectReference[] = [
        {
          name: SAVED_SEARCH_SAVED_OBJECT_REF_NAME,
          type: SavedSearchType,
          id: 'id-from-reference',
        },
      ];
      const result = byReferenceSavedSearchToDiscoverSessionEmbeddableState(
        storedSearch,
        references
      );
      expect(result.discover_session_id).toBe('id-from-state');
    });
  });

  describe('byReferenceDiscoverSessionToSavedSearchEmbeddableState', () => {
    it('converts discover session by-reference state to stored state with references', () => {
      const apiState: DiscoverSessionEmbeddableByReferenceState = {
        title: 'My Search',
        description: 'My description',
        time_range: { from: 'now-15m', to: 'now' },
        discover_session_id: 'session-456',
        selected_tab_id: 'tab-1',
        overrides: {},
      };
      const result = byReferenceDiscoverSessionToSavedSearchEmbeddableState(apiState);
      expect(result.references).toEqual([
        {
          name: SAVED_SEARCH_SAVED_OBJECT_REF_NAME,
          type: SavedSearchType,
          id: 'session-456',
        },
      ]);
      expect(result.state).toEqual({
        title: 'My Search',
        description: 'My description',
        time_range: { from: 'now-15m', to: 'now' },
        selectedTabId: 'tab-1',
      });
    });
  });

  describe('byValueDiscoverSessionToSavedSearchEmbeddableState', () => {
    it('converts discover session by-value state to stored state with references', () => {
      const apiState: DiscoverSessionEmbeddableByValueState = {
        title: 'Panel Title',
        description: 'Panel description',
        time_range: { from: 'now-1h', to: 'now' },
        tabs: [
          {
            column_order: ['message', '@timestamp'],
            column_settings: { '@timestamp': { width: 200 } },
            sort: [{ name: '@timestamp', direction: 'desc' }],
            view_mode: VIEW_MODE.DOCUMENT_LEVEL,
            density: DataGridDensity.COMPACT,
            header_row_height: 'auto',
            row_height: 'auto',
            query: { language: 'kuery', query: '' },
            filters: [],
            rows_per_page: 100,
            sample_size: 1000,
            dataset: { type: 'dataView', id: 'data-view-1' },
          },
        ],
      };
      const result = byValueDiscoverSessionToSavedSearchEmbeddableState(apiState);
      expect(result.references).toEqual([
        {
          id: 'data-view-1',
          name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
          type: 'index-pattern',
        },
      ]);
      expect(result.state.title).toBe('Panel Title');
      expect(result.state.description).toBe('Panel description');
      expect(result.state.attributes.tabs).toHaveLength(1);
      expect(result.state.attributes.tabs[0].attributes.columns).toEqual(['message', '@timestamp']);
      expect(result.state.attributes.tabs[0].attributes.sort).toEqual([['@timestamp', 'desc']]);
      expect(result.state.attributes.tabs[0].attributes.grid).toEqual({
        columns: { '@timestamp': { width: 200 } },
      });
      expect(result.state.attributes.tabs[0].attributes.rowHeight).toBe(-1);
      expect(result.state.attributes.tabs[0].attributes.headerRowHeight).toBe(-1);
      const searchSource = JSON.parse(
        result.state.attributes.tabs[0].attributes.kibanaSavedObjectMeta.searchSourceJSON
      );
      expect(searchSource.indexRefName).toBe('kibanaSavedObjectMeta.searchSourceJSON.index');
      expect(searchSource.index).toBeUndefined();
      expect(searchSource.query).toEqual({ language: 'kuery', query: '' });
      expect(searchSource.filter).toEqual([]);
    });

    it('converts index-pattern tab with runtime fields to stored state', () => {
      const apiState: DiscoverSessionEmbeddableByValueState = {
        title: 'Adhoc',
        time_range: { from: 'now-1h', to: 'now' },
        tabs: [
          {
            column_order: ['foo'],
            sort: [],
            view_mode: VIEW_MODE.DOCUMENT_LEVEL,
            density: DataGridDensity.COMPACT,
            header_row_height: 50,
            row_height: 30,
            query: { language: 'kuery', query: '' },
            filters: [],
            rows_per_page: 25,
            sample_size: 500,
            dataset: {
              type: 'index',
              index: 'my-*',
              time_field: '@timestamp',
              runtime_fields: [
                {
                  name: 'rt',
                  type: 'keyword',
                  script: 'emit("x")',
                  format: { type: 'string' },
                },
              ],
            },
          },
        ],
      };
      const result = byValueDiscoverSessionToSavedSearchEmbeddableState(apiState);
      const searchSource = JSON.parse(
        result.state.attributes.tabs[0].attributes.kibanaSavedObjectMeta.searchSourceJSON
      );
      expect(searchSource.index).toEqual({
        title: 'my-*',
        timeFieldName: '@timestamp',
        fieldFormats: {
          rt: { id: 'string' },
        },
        fieldAttrs: {
          rt: {},
        },
        runtimeFieldMap: {
          rt: {
            type: 'keyword',
            script: { source: 'emit("x")' },
          },
        },
      });
    });
  });

  describe('transform then reversion (1:1 validation)', () => {
    it('by-value: SavedSearch → API → SavedSearch yields semantically identical state', () => {
      const storedState: StoredSearchEmbeddableByValueState = {
        title: 'My Discover Session',
        description: 'Session description',
        attributes: {
          title: '',
          description: '',
          sort: [['@timestamp', 'desc']],
          columns: ['message', '@timestamp'],
          grid: { columns: { '@timestamp': { width: 200 } } },
          hideChart: false,
          viewMode: VIEW_MODE.DOCUMENT_LEVEL,
          isTextBasedQuery: false,
          timeRestore: false,
          kibanaSavedObjectMeta: {
            searchSourceJSON:
              '{"query":{"language":"kuery","query":""},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
          },
          tabs: [
            {
              id: 'tab-1',
              label: 'Tab 1',
              attributes: {
                sort: [['@timestamp', 'desc']],
                columns: ['message', '@timestamp'],
                grid: { columns: { '@timestamp': { width: 200 } } },
                hideChart: false,
                viewMode: VIEW_MODE.DOCUMENT_LEVEL,
                isTextBasedQuery: false,
                timeRestore: false,
                rowHeight: -1,
                headerRowHeight: -1,
                kibanaSavedObjectMeta: {
                  searchSourceJSON:
                    '{"query":{"language":"kuery","query":""},"filter":[],"indexRefName":"kibanaSavedObjectMeta.searchSourceJSON.index"}',
                },
              },
            },
          ],
        },
      };
      const references: SavedObjectReference[] = [
        {
          name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
          type: 'index-pattern',
          id: 'data-view-123',
        },
      ];

      const apiState = byValueSavedSearchToDiscoverSessionEmbeddableState(storedState, references);
      const { state: reverted, references: revertedRefs } =
        byValueDiscoverSessionToSavedSearchEmbeddableState(apiState, []);

      expect(reverted.attributes.title).toBe(storedState.title);
      expect(reverted.attributes.description).toBe(storedState.description);
      expect(reverted.attributes.tabs).toHaveLength(storedState.attributes.tabs!.length);

      const initialTabAttrs = storedState.attributes.tabs![0].attributes;
      const revertedTabAttrs = reverted.attributes.tabs[0].attributes;
      expect(revertedTabAttrs.sort).toEqual(initialTabAttrs.sort);
      expect(revertedTabAttrs.columns).toEqual(initialTabAttrs.columns);
      expect(revertedTabAttrs.grid).toEqual(initialTabAttrs.grid);
      expect(revertedTabAttrs.hideChart).toBe(initialTabAttrs.hideChart);
      expect(revertedTabAttrs.viewMode).toBe(initialTabAttrs.viewMode);
      expect(revertedTabAttrs.isTextBasedQuery).toBe(initialTabAttrs.isTextBasedQuery);
      // timeRestore/timeRange are intentionally dropped at the simplified API level
      expect(revertedTabAttrs.rowHeight).toBe(initialTabAttrs.rowHeight);
      expect(revertedTabAttrs.headerRowHeight).toBe(initialTabAttrs.headerRowHeight);
      expect(revertedTabAttrs.kibanaSavedObjectMeta.searchSourceJSON).toBe(
        initialTabAttrs.kibanaSavedObjectMeta.searchSourceJSON
      );

      expect(revertedRefs).toEqual(references);
    });

    it('by-reference: SavedSearch → API → SavedSearch yields semantically identical state', () => {
      const storedState: StoredSearchEmbeddableByReferenceState = {
        title: 'By-Ref Session',
        description: 'Ref description',
        time_range: { from: 'now-15m', to: 'now' },
        selectedTabId: 'tab-2',
        sort: [['_score', 'desc']],
        columns: ['message'],
      };
      const references: SavedObjectReference[] = [
        { name: SAVED_SEARCH_SAVED_OBJECT_REF_NAME, type: SavedSearchType, id: 'session-ref-1' },
      ];

      const apiState = byReferenceSavedSearchToDiscoverSessionEmbeddableState(
        storedState,
        references
      );
      const { state: reverted, references: revertedRefs } =
        byReferenceDiscoverSessionToSavedSearchEmbeddableState(apiState, []);

      expect(reverted.title).toBe(storedState.title);
      expect(reverted.description).toBe(storedState.description);
      expect(reverted.time_range).toEqual(storedState.time_range);
      expect(reverted.selectedTabId).toBe(storedState.selectedTabId);
      expect(reverted.sort).toEqual(storedState.sort);
      expect(reverted.columns).toEqual(storedState.columns);
      expect(revertedRefs).toEqual(references);
    });
  });

  describe('fromStoredGrid', () => {
    it('maps saved grid.columns to column_settings', () => {
      expect(
        fromStoredGrid({
          columns: {
            message: { width: 100 },
            '@timestamp': { width: 200 },
          },
        })
      ).toEqual({
        message: { width: 100 },
        '@timestamp': { width: 200 },
      });
    });

    it('returns empty object when grid has no column entries', () => {
      expect(fromStoredGrid({ columns: {} })).toEqual({});
      expect(fromStoredGrid({})).toEqual({});
    });
  });

  describe('toStoredGrid', () => {
    it('builds saved grid from non-empty column_settings', () => {
      expect(
        toStoredGrid({
          message: { width: 100 },
          '@timestamp': { width: 200 },
        })
      ).toEqual({
        columns: {
          message: { width: 100 },
          '@timestamp': { width: 200 },
        },
      });
    });

    it('returns empty object when column_settings is empty', () => {
      expect(toStoredGrid({})).toEqual({});
    });

    it('returns empty object when column_settings is undefined (default)', () => {
      expect(toStoredGrid()).toEqual({});
    });
  });

  describe('fromStoredSearchEmbeddableState', () => {
    it('converts stored state with all fields to panel overrides', () => {
      const storedState: StoredSearchEmbeddableState = {
        sort: [['@timestamp', 'desc']],
        columns: ['message', '@timestamp'],
        rowHeight: -1,
        sampleSize: 500,
        rowsPerPage: 100,
        headerRowHeight: 3,
        density: DataGridDensity.COMPACT,
        grid: {
          columns: {
            message: { width: 100 },
            '@timestamp': { width: 200 },
          },
        },
      };
      const result = fromStoredSearchEmbeddableState(storedState);
      expect(result).toEqual({
        sort: [{ name: '@timestamp', direction: 'desc' }],
        column_order: ['message', '@timestamp'],
        column_settings: {
          message: { width: 100 },
          '@timestamp': { width: 200 },
        },
        row_height: 'auto',
        sample_size: 500,
        rows_per_page: 100,
        header_row_height: 3,
        density: DataGridDensity.COMPACT,
      });
    });

    it('omits undefined/falsy stored fields from result', () => {
      const storedState: StoredSearchEmbeddableState = {
        sort: [['@timestamp', 'desc']],
        columns: ['message'],
        grid: { columns: {} },
      };
      const result = fromStoredSearchEmbeddableState(storedState);
      expect(result).toEqual({
        sort: [{ name: '@timestamp', direction: 'desc' }],
        column_order: ['message'],
      });
      expect(result.row_height).toBeUndefined();
      expect(result.sample_size).toBeUndefined();
      expect(result.rows_per_page).toBeUndefined();
      expect(result.header_row_height).toBeUndefined();
      expect(result.density).toBeUndefined();
    });

    it('converts numeric row heights to API form', () => {
      const storedState = {
        rowHeight: 5,
        headerRowHeight: 2,
      };
      const result = fromStoredSearchEmbeddableState(storedState);
      expect(result.row_height).toBe(5);
      expect(result.header_row_height).toBe(2);
    });

    it('converts -1 height to "auto"', () => {
      const storedState = {
        rowHeight: -1,
        headerRowHeight: -1,
      };
      const result = fromStoredSearchEmbeddableState(storedState);
      expect(result.row_height).toBe('auto');
      expect(result.header_row_height).toBe('auto');
    });
  });

  describe('toStoredSearchEmbeddableState', () => {
    it('converts panel overrides with all fields to stored state', () => {
      const apiState = {
        sort: [{ name: '@timestamp', direction: 'desc' as const }],
        column_order: ['message', '@timestamp'],
        column_settings: { '@timestamp': { width: 200 } },
        row_height: 'auto' as const,
        sample_size: 500,
        rows_per_page: 100 as const,
        header_row_height: 3,
        density: DataGridDensity.COMPACT,
      };
      const result = toStoredSearchEmbeddableState(apiState);
      expect(result).toEqual({
        sort: [['@timestamp', 'desc']],
        columns: ['message', '@timestamp'],
        rowHeight: -1,
        sampleSize: 500,
        rowsPerPage: 100,
        headerRowHeight: 3,
        density: DataGridDensity.COMPACT,
        grid: {
          columns: {
            '@timestamp': { width: 200 },
          },
        },
      });
    });

    it('omits undefined/falsy API fields from result', () => {
      const apiState = {
        sort: [{ name: '@timestamp', direction: 'desc' as const }],
        column_order: ['message'],
      };
      const result = toStoredSearchEmbeddableState(apiState);
      expect(result).toEqual({
        sort: [['@timestamp', 'desc']],
        columns: ['message'],
      });
      expect(result.rowHeight).toBeUndefined();
      expect(result.sampleSize).toBeUndefined();
      expect(result.rowsPerPage).toBeUndefined();
      expect(result.headerRowHeight).toBeUndefined();
      expect(result.density).toBeUndefined();
    });

    it('converts "auto" height to -1 in stored form', () => {
      const apiState = {
        row_height: 'auto' as const,
        header_row_height: 'auto' as const,
      };
      const result = toStoredSearchEmbeddableState(apiState);
      expect(result.rowHeight).toBe(-1);
      expect(result.headerRowHeight).toBe(-1);
    });

    it('preserves numeric heights in stored form', () => {
      const apiState = {
        row_height: 5,
        header_row_height: 2,
      };
      const result = toStoredSearchEmbeddableState(apiState);
      expect(result.rowHeight).toBe(5);
      expect(result.headerRowHeight).toBe(2);
    });

    it('round-trips with fromStoredSearchEmbeddableState', () => {
      const storedState: StoredSearchEmbeddableState = {
        sort: [
          ['@timestamp', 'desc'],
          ['message', 'asc'],
        ],
        columns: ['message', '@timestamp'],
        rowHeight: -1,
        sampleSize: 1000,
        rowsPerPage: 50,
        headerRowHeight: 3,
        density: DataGridDensity.NORMAL,
        grid: {
          columns: {
            '@timestamp': { width: 150 },
          },
        },
      };
      const overrides = fromStoredSearchEmbeddableState(storedState);
      const back = toStoredSearchEmbeddableState(overrides);
      expect(back.sort).toEqual(storedState.sort);
      expect(back.columns).toEqual(storedState.columns);
      expect(back.rowHeight).toBe(storedState.rowHeight);
      expect(back.sampleSize).toBe(storedState.sampleSize);
      expect(back.rowsPerPage).toBe(storedState.rowsPerPage);
      expect(back.headerRowHeight).toBe(storedState.headerRowHeight);
      expect(back.density).toBe(storedState.density);
      expect(back.grid).toEqual(storedState.grid);
    });
  });

  describe('fromStoredSort', () => {
    it('converts array of [field, direction] to sort objects', () => {
      const sort = [
        ['@timestamp', 'desc'],
        ['message', 'asc'],
      ];
      const result = fromStoredSort(sort);
      expect(result).toEqual([
        { name: '@timestamp', direction: 'desc' },
        { name: 'message', direction: 'asc' },
      ]);
    });

    it('defaults direction to desc when not asc or desc', () => {
      const sort = [['field', 'other' as 'desc']];
      const result = fromStoredSort(sort);
      expect(result).toEqual([{ name: 'field', direction: 'desc' }]);
    });
  });

  describe('toStoredSort', () => {
    it('converts sort objects to array of [name, direction]', () => {
      const sort = [
        { name: '@timestamp', direction: 'desc' as const },
        { name: 'message', direction: 'asc' as const },
      ];
      const result = toStoredSort(sort);
      expect(result).toEqual([
        ['@timestamp', 'desc'],
        ['message', 'asc'],
      ]);
    });

    it('returns empty array when sort is undefined (default)', () => {
      expect(toStoredSort()).toEqual([]);
    });

    it('returns empty array when sort is empty', () => {
      expect(toStoredSort([])).toEqual([]);
    });
  });

  describe('fromStoredHeight', () => {
    it('returns numeric height as-is', () => {
      expect(fromStoredHeight(3)).toBe(3);
      expect(fromStoredHeight(5)).toBe(5);
    });

    it('returns "auto" when height is -1', () => {
      expect(fromStoredHeight(-1)).toBe('auto');
    });

    it('defaults to 3 when height is undefined', () => {
      expect(fromStoredHeight(undefined as unknown as number)).toBe(3);
    });
  });

  describe('toStoredHeight', () => {
    it('returns numeric height as-is', () => {
      expect(toStoredHeight(3)).toBe(3);
      expect(toStoredHeight(5)).toBe(5);
    });

    it('returns -1 when height is "auto"', () => {
      expect(toStoredHeight('auto')).toBe(-1);
    });
  });

  describe('fromStoredDataset', () => {
    it('throws when index is null', () => {
      expect(() => fromStoredDataset(null as unknown as string)).toThrow(
        'Data view is required to convert from stored dataset'
      );
    });

    it('returns dataView reference when index is a string id', () => {
      const result = fromStoredDataset('my-data-view-id');
      expect(result).toEqual({ type: 'dataView', id: 'my-data-view-id' });
    });

    it('throws when index object has no title or id', () => {
      expect(() => fromStoredDataset({ timeFieldName: '@timestamp' } as unknown as string)).toThrow(
        'Stored index object must have a title or id to convert to dataset'
      );
    });

    it('transforms index-pattern object to DiscoverSessionDataViewSpec', () => {
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
      const expected: DiscoverSessionDataViewSpec = {
        type: 'index',
        index: 'f*',
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
      const result = fromStoredDataset(index);
      expect(result).toEqual(expected);
    });
  });

  describe('toStoredDataset', () => {
    it('converts dataView dataset to string id', () => {
      const dataset: DiscoverSessionDataViewReference = {
        type: 'dataView',
        id: 'my-data-view-id',
      };
      const result = toStoredDataset(dataset);
      expect(result).toBe('my-data-view-id');
    });

    it('converts index-pattern dataset to serialized index spec', () => {
      const dataset: DiscoverSessionDataViewSpec = {
        type: 'index',
        index: 'my-index-*',
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
      const result = toStoredDataset(dataset);
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

    it('converts index-pattern dataset without runtime fields', () => {
      const dataset: DiscoverSessionDataViewSpec = {
        type: 'index',
        index: 'logs-*',
        time_field: '@timestamp',
      };
      const result = toStoredDataset(dataset);
      expect(result).toEqual({
        title: 'logs-*',
        timeFieldName: '@timestamp',
      });
    });
  });

  describe('fromStoredTab', () => {
    it('converts stored tab with dataView id to API tab', () => {
      const storedTab = {
        sort: [['@timestamp', 'desc']],
        columns: ['message', '@timestamp'],
        grid: { columns: { '@timestamp': { width: 200 } } },
        rowHeight: -1,
        headerRowHeight: -1,
        sampleSize: 500,
        rowsPerPage: 100,
        density: DataGridDensity.COMPACT,
        viewMode: VIEW_MODE.DOCUMENT_LEVEL,
        hideChart: false,
        isTextBasedQuery: false,
        kibanaSavedObjectMeta: {
          searchSourceJSON: JSON.stringify({
            query: { language: 'kuery', query: '' },
            index: 'data-view-1',
            filter: [],
          }),
        },
      };
      const references: SavedObjectReference[] = [
        {
          name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
          type: 'index-pattern',
          id: 'data-view-1',
        },
      ];
      const result = fromStoredTab(
        storedTab as unknown as Parameters<typeof fromStoredTab>[0],
        references
      );
      expect(result.sort).toEqual([{ name: '@timestamp', direction: 'desc' }]);
      expect(result.column_order).toEqual(['message', '@timestamp']);
      expect(result.column_settings).toEqual({ '@timestamp': { width: 200 } });
      expect(result.row_height).toBe('auto');
      expect(result.header_row_height).toBe('auto');
      expect(result.density).toBe(DataGridDensity.COMPACT);
      expect('dataset' in result && result.dataset).toEqual({
        type: 'dataView',
        id: 'data-view-1',
      });
      expect('view_mode' in result && result.view_mode).toBe(VIEW_MODE.DOCUMENT_LEVEL);
    });
  });

  describe('toStoredTab', () => {
    it('converts API classic tab to stored tab with references', () => {
      const apiTab: DiscoverSessionEmbeddableByValueState['tabs'][0] = {
        column_order: ['message', '@timestamp'],
        column_settings: { '@timestamp': { width: 200 } },
        sort: [{ name: '@timestamp', direction: 'desc' }],
        view_mode: VIEW_MODE.DOCUMENT_LEVEL,
        density: DataGridDensity.COMPACT,
        header_row_height: 'auto',
        row_height: 'auto',
        query: { language: 'kuery', query: '' },
        filters: [],
        rows_per_page: 100,
        sample_size: 500,
        dataset: { type: 'dataView', id: 'data-view-1' },
      };
      const { state, references } = toStoredTab(apiTab);
      expect(references).toContainEqual({
        name: 'kibanaSavedObjectMeta.searchSourceJSON.index',
        type: 'index-pattern',
        id: 'data-view-1',
      });
      expect(state.sort).toEqual([['@timestamp', 'desc']]);
      expect(state.columns).toEqual(['message', '@timestamp']);
      expect(state.rowHeight).toBe(-1);
      expect(state.headerRowHeight).toBe(-1);
      expect(state.density).toBe(DataGridDensity.COMPACT);
      expect(state.hideChart).toBe(false);
      expect(state.isTextBasedQuery).toBe(false);
      const searchSource = JSON.parse(state.kibanaSavedObjectMeta.searchSourceJSON);
      expect(searchSource.indexRefName).toBe('kibanaSavedObjectMeta.searchSourceJSON.index');
      expect(searchSource.index).toBeUndefined();
      expect(searchSource.query).toEqual({ language: 'kuery', query: '' });
      expect(searchSource.filter).toEqual([]);
    });

    it('converts API tab with index-pattern dataset (no refs) when inline', () => {
      const apiTab: DiscoverSessionEmbeddableByValueState['tabs'][0] = {
        column_order: ['foo'],
        sort: [],
        view_mode: VIEW_MODE.DOCUMENT_LEVEL,
        density: DataGridDensity.COMPACT,
        header_row_height: 3,
        row_height: 3,
        query: { language: 'kuery', query: '' },
        filters: [],
        dataset: {
          type: 'index',
          index: 'my-*',
          time_field: '@timestamp',
        },
      };
      const { state, references } = toStoredTab(apiTab);
      expect(references).toEqual([]);
      const searchSource = JSON.parse(state.kibanaSavedObjectMeta.searchSourceJSON);
      expect(searchSource.index).toEqual({
        title: 'my-*',
        timeFieldName: '@timestamp',
      });
    });
  });
});
