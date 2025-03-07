/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import expect from '@kbn/expect';

import { FtrProviderContext } from '../../../ftr_provider_context';

export default function ({ getService, getPageObjects }: FtrProviderContext) {
  const log = getService('log');
  const inspector = getService('inspector');
  const { visualize, visEditor, visChart, timePicker } = getPageObjects([
    'visualize',
    'visEditor',
    'visChart',
    'timePicker',
  ]);

  describe('heatmap chart', function indexPatternCreation() {
    const vizName1 = 'Visualization HeatmapChart';
    let isNewChartsLibraryEnabled = false;

    before(async function () {
      isNewChartsLibraryEnabled = await visChart.isNewChartsLibraryEnabled(
        'visualization:visualize:legacyHeatmapChartsLibrary'
      );
      await visualize.initTests(!isNewChartsLibraryEnabled);
      log.debug('navigateToApp visualize');
      await visualize.navigateToNewAggBasedVisualization();
      log.debug('clickHeatmapChart');
      await visualize.clickHeatmapChart();
      await visualize.clickNewSearch();
      await timePicker.setDefaultAbsoluteRange();
      log.debug('Bucket = X-Axis');
      await visEditor.clickBucket('X-axis');
      log.debug('Aggregation = Date Histogram');
      await visEditor.selectAggregation('Date Histogram');
      log.debug('Field = @timestamp');
      await visEditor.selectField('@timestamp');
      // leaving Interval set to Auto
      await visEditor.clickGo(!isNewChartsLibraryEnabled);
    });

    it('should save and load', async function () {
      await visualize.saveVisualizationExpectSuccessAndBreadcrumb(vizName1);

      await visualize.loadSavedVisualization(vizName1);
      await visChart.waitForVisualization();
    });

    it('should have inspector enabled', async function () {
      await inspector.expectIsEnabled();
    });

    it('should show correct data', async function () {
      // this is only the first page of the tabular data.
      const expectedChartData = [
        ['2015-09-20 00:00', '37'],
        ['2015-09-20 03:00', '202'],
        ['2015-09-20 06:00', '740'],
        ['2015-09-20 09:00', '1,437'],
        ['2015-09-20 12:00', '1,371'],
        ['2015-09-20 15:00', '751'],
        ['2015-09-20 18:00', '188'],
        ['2015-09-20 21:00', '31'],
        ['2015-09-21 00:00', '42'],
        ['2015-09-21 03:00', '202'],
        ['2015-09-21 06:00', '683'],
        ['2015-09-21 09:00', '1,361'],
        ['2015-09-21 12:00', '1,415'],
        ['2015-09-21 15:00', '707'],
        ['2015-09-21 18:00', '177'],
        ['2015-09-21 21:00', '27'],
        ['2015-09-22 00:00', '32'],
        ['2015-09-22 03:00', '175'],
        ['2015-09-22 06:00', '707'],
        ['2015-09-22 09:00', '1,408'],
      ];

      await inspector.open();
      await inspector.expectTableData(expectedChartData);
      await inspector.close();
    });

    it('should show 4 color ranges as default colorNumbers param', async function () {
      const legends = await visChart.getLegendEntries();
      let expectedLegends = [];
      if (isNewChartsLibraryEnabled) {
        // the bands are different because we always scale to data bounds in the implementation
        expectedLegends = ['27 - 379.5', '379.5 - 732', '732 - 1,084.5', '1,084.5 - 1,437'];
      } else {
        expectedLegends = ['0 - 400', '400 - 800', '800 - 1,200', '1,200 - 1,600'];
      }
      expect(legends).to.eql(expectedLegends);
    });

    it('should show 6 color ranges if changed on options', async function () {
      await visEditor.clickOptionsTab();
      await visEditor.changeHeatmapColorNumbers(6);
      await visEditor.clickGo(!isNewChartsLibraryEnabled);
      await visChart.waitForVisualizationRenderingStabilized();

      const legends = await visChart.getLegendEntries();
      let expectedLegends = [];
      if (isNewChartsLibraryEnabled) {
        // the bands are different because we always scale to data bounds in the implementation
        expectedLegends = [
          '27 - 262',
          '262 - 497',
          '497 - 732',
          '732 - 967',
          '967 - 1,202',
          '1,202 - 1,437',
        ];
      } else {
        expectedLegends = [
          '0 - 267',
          '267 - 534',
          '534 - 800',
          '800 - 1,067',
          '1,067 - 1,334',
          '1,334 - 1,600',
        ];
      }
      expect(legends).to.eql(expectedLegends);
    });
    it('should show 6 custom color ranges', async function () {
      await visEditor.clickOptionsTab();
      await visEditor.clickEnableCustomRanges();
      await visEditor.clickAddRange();
      await visEditor.clickAddRange();
      await visEditor.clickAddRange();
      await visEditor.clickAddRange();
      await visEditor.clickAddRange();
      await visEditor.clickAddRange();
      await visEditor.clickAddRange();

      log.debug('customize 2 last ranges');
      await visEditor.setCustomRangeByIndex(6, '650', '720');
      await visEditor.setCustomRangeByIndex(7, '800', '905');
      await visEditor.clickGo(!isNewChartsLibraryEnabled);

      await visChart.waitForVisualizationRenderingStabilized();
      const legends = await visChart.getLegendEntries();
      let expectedLegends = [];
      if (isNewChartsLibraryEnabled) {
        expectedLegends = [
          '0 - 100',
          '100 - 200',
          '200 - 300',
          '300 - 400',
          '400 - 500',
          '500 - 600',
          '600 - 650',
          '650 - 720',
          '720 - 800',
          '800 - 905',
        ];
      } else {
        expectedLegends = [
          '0 - 100',
          '100 - 200',
          '200 - 300',
          '300 - 400',
          '400 - 500',
          '500 - 600',
          '650 - 720',
          '800 - 905',
        ];
      }
      expect(legends).to.eql(expectedLegends);
    });
  });
}
