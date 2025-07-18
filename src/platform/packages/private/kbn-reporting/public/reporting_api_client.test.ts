/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { tz } from 'moment-timezone';

import { HttpSetup, IUiSettingsClient } from '@kbn/core/public';
import { httpServiceMock, uiSettingsServiceMock } from '@kbn/core/public/mocks';
import { Job } from './job';
import { ReportingAPIClient } from './reporting_api_client';

describe('ReportingAPIClient', () => {
  let uiSettingsClient: jest.Mocked<IUiSettingsClient>;
  let httpClient: jest.Mocked<HttpSetup>;
  let apiClient: ReportingAPIClient;

  beforeEach(() => {
    uiSettingsClient = uiSettingsServiceMock.createStartContract();
    httpClient = httpServiceMock.createStartContract({ basePath: '/base/path' });
    apiClient = new ReportingAPIClient(httpClient, uiSettingsClient, 'version');
  });

  describe('getReportURL', () => {
    it('should generate the internal report download URL', () => {
      expect(apiClient.getReportURL('123')).toMatchInlineSnapshot(
        `"/base/path/internal/reporting/jobs/download/123?elasticInternalOrigin=true"`
      );
    });
  });

  describe('downloadReport', () => {
    beforeEach(() => {
      jest.spyOn(window, 'open').mockReturnValue(window);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should open a window with download URL', () => {
      apiClient.downloadReport('123');

      expect(window.open).toHaveBeenCalledWith(expect.stringContaining('/download/123'));
    });
  });

  describe('deleteReport', () => {
    it('should send a delete request', async () => {
      await apiClient.deleteReport('123');

      expect(httpClient.delete).toHaveBeenCalledWith(expect.stringContaining('/delete/123'));
    });
  });

  describe('list', () => {
    beforeEach(() => {
      httpClient.get.mockResolvedValueOnce([{ payload: {} }, { payload: {} }]);
    });

    it('should send job IDs in query parameters', async () => {
      await apiClient.list(1, 10, ['123', '456']);

      expect(httpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/list'),
        expect.objectContaining({
          asSystemRequest: true,
          query: {
            page: 1,
            size: 10,
            ids: '123,456',
          },
        })
      );
    });

    it('should return job instances', async () => {
      await expect(apiClient.list(1)).resolves.toEqual(
        expect.arrayContaining([expect.any(Job), expect.any(Job)])
      );
    });
  });

  describe('total', () => {
    beforeEach(() => {
      httpClient.get.mockResolvedValueOnce(10);
    });

    it('should send a get request', async () => {
      await apiClient.total();

      expect(httpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/count'),
        expect.any(Object)
      );
    });

    it('should return a total number', async () => {
      await expect(apiClient.total()).resolves.toBe(10);
    });
  });

  describe('getInfo', () => {
    beforeEach(() => {
      httpClient.get.mockResolvedValueOnce({ payload: {} });
    });

    it('should send a get request', async () => {
      await apiClient.getInfo('123');

      expect(httpClient.get).toHaveBeenCalledWith(expect.stringContaining('/info/123'));
    });

    it('should return a job instance', async () => {
      await expect(apiClient.getInfo('123')).resolves.toBeInstanceOf(Job);
    });
  });

  describe('getScheduledReportInfo', () => {
    beforeEach(() => {
      httpClient.get.mockResolvedValueOnce({
        data: [
          { id: 'scheduled-report-1', title: 'Scheduled Report 1' },
          { id: 'scheduled-report-2', title: 'Schedule Report 2' },
        ],
      });
    });

    it('should send a get request', async () => {
      await apiClient.getScheduledReportInfo('scheduled-report-1', 2, 50);

      expect(httpClient.get).toHaveBeenCalledWith('/internal/reporting/scheduled/list', {
        query: { page: 2, size: 50 },
      });
    });

    it('should return a report', async () => {
      const res = await apiClient.getScheduledReportInfo('scheduled-report-1');

      expect(httpClient.get).toHaveBeenCalledWith('/internal/reporting/scheduled/list', {
        query: { page: 0, size: 50 },
      });

      expect(res).toEqual({
        id: 'scheduled-report-1',
        title: 'Scheduled Report 1',
      });
    });
  });

  describe('getError', () => {
    it('should get an error message', async () => {
      httpClient.get.mockResolvedValueOnce({
        payload: {},
        output: {
          warnings: ['Some error'],
        },
      });

      await expect(apiClient.getError('123')).resolves.toEqual('Some error');
    });

    it('should return an unknown error message', async () => {
      httpClient.get.mockResolvedValueOnce({ payload: {} });

      await expect(apiClient.getError('123')).resolves.toEqual(
        'Report job 123 failed. Error unknown.'
      );
    });
  });

  describe('findForJobIds', () => {
    beforeEach(() => {
      httpClient.fetch.mockResolvedValueOnce([{ payload: {} }, { payload: {} }]);
    });

    it('should send job IDs in query parameters', async () => {
      await apiClient.findForJobIds(['123', '456']);

      expect(httpClient.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/list'),
        expect.objectContaining({
          method: 'GET',
          query: {
            page: 0,
            ids: '123,456',
          },
        })
      );
    });

    it('should return job instances', async () => {
      await expect(apiClient.findForJobIds(['123', '456'])).resolves.toEqual(
        expect.arrayContaining([expect.any(Job), expect.any(Job)])
      );
    });
  });

  describe('getReportingJobPath', () => {
    it('should generate a job path', () => {
      expect(
        apiClient.getReportingPublicJobPath('pdf', {
          browserTimezone: 'UTC',
          objectType: 'something',
          title: 'some title',
          version: 'some version',
        })
      ).toMatchInlineSnapshot(
        `"/base/path/api/reporting/generate/pdf?jobParams=%28browserTimezone%3AUTC%2CobjectType%3Asomething%2Ctitle%3A%27some%20title%27%2Cversion%3A%27some%20version%27%29"`
      );
    });
  });

  describe('createReportingJob', () => {
    beforeEach(() => {
      httpClient.post.mockResolvedValueOnce({ job: { payload: {} } });
    });

    it('should send a post request', async () => {
      await apiClient.createReportingJob('pdf', {
        browserTimezone: 'UTC',
        objectType: 'something',
        title: 'some title',
        version: 'some version',
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/pdf'),
        expect.objectContaining({
          body: '{"jobParams":"(browserTimezone:UTC,objectType:something,title:\'some title\',version:\'some version\')"}',
        })
      );
    });

    it('should return a job instance', async () => {
      await expect(
        apiClient.createReportingJob('pdf', {
          browserTimezone: 'UTC',
          objectType: 'something',
          title: 'some title',
          version: 'some version',
        })
      ).resolves.toBeInstanceOf(Job);
    });
  });

  describe('getDecoratedJobParams', () => {
    beforeEach(() => {
      jest.spyOn(tz, 'guess').mockReturnValue('UTC');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it(`should guess browser's timezone`, () => {
      uiSettingsClient.get.mockReturnValue('Browser');

      expect(
        apiClient.getDecoratedJobParams({ objectType: 'some object type', title: 'some title' })
      ).toEqual(
        expect.objectContaining({
          browserTimezone: 'UTC',
        })
      );
    });

    it('should use a timezone from the UI settings', () => {
      uiSettingsClient.get.mockReturnValue('GMT');

      expect(
        apiClient.getDecoratedJobParams({ objectType: 'some object type', title: 'some title' })
      ).toEqual(
        expect.objectContaining({
          browserTimezone: 'GMT',
        })
      );
    });

    it('should mix in a Kibana version', () => {
      expect(
        apiClient.getDecoratedJobParams({ objectType: 'some object type', title: 'some title' })
      ).toEqual(
        expect.objectContaining({
          version: 'version',
        })
      );
    });
  });

  describe('verifyBrowser', () => {
    it('should send a post request', async () => {
      await apiClient.verifyBrowser();

      expect(httpClient.get).toHaveBeenCalledWith(expect.stringContaining('/diagnose/browser'));
    });
  });

  describe('verifyScreenCapture', () => {
    it('should send a post request', async () => {
      await apiClient.verifyScreenCapture();

      expect(httpClient.post).toHaveBeenCalledWith(expect.stringContaining('/diagnose/screenshot'));
    });
  });

  describe('migrateReportingIndicesIlmPolicy', () => {
    it('should send a put request', async () => {
      await apiClient.migrateReportingIndicesIlmPolicy();

      expect(httpClient.put).toHaveBeenCalledWith(expect.stringContaining('/migrate_ilm_policy'));
    });
  });
});
