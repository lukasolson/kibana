/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { i18n } from '@kbn/i18n';
import React, { memo } from 'react';
import styled from '@emotion/styled';

export const RegularExpressionRepresentation: React.FunctionComponent<{
  maximumSegmentCount?: number;
  regularExpression: string;
}> = memo(({ maximumSegmentCount = 30, regularExpression }) => {
  const segments = regularExpression.split(collapsedRegularExpressionCharacters);

  return (
    <CategoryPattern>
      {segments
        .slice(0, maximumSegmentCount)
        .map((segment, segmentIndex) => [
          segmentIndex > 0 ? (
            <CategoryPatternWildcard key={`wildcard-${segmentIndex}`}>⁕</CategoryPatternWildcard>
          ) : null,
          <CategoryPatternSegment key={`segment-${segmentIndex}`}>
            {segment.replace(escapedRegularExpressionCharacters, '$1')}
          </CategoryPatternSegment>,
        ])}
      {segments.length > maximumSegmentCount ? (
        <CategoryPatternWildcard
          title={i18n.translate(
            'xpack.infra.logs.logEntryCategories.truncatedPatternSegmentDescription',
            {
              defaultMessage:
                '{extraSegmentCount, plural, one {one more segment} other {# more segments}}',
              values: {
                extraSegmentCount: segments.length - maximumSegmentCount,
              },
            }
          )}
        >
          &hellip;
        </CategoryPatternWildcard>
      ) : null}
    </CategoryPattern>
  );
});

const CategoryPattern = styled.span`
  font-family: ${(props) => props.theme.euiTheme.font.familyCode};
  word-break: break-all;
`;

const CategoryPatternWildcard = styled.span`
  color: ${(props) => props.theme.euiTheme.colors.mediumShade};
`;

const CategoryPatternSegment = styled.span`
  font-weight: bold;
`;

const collapsedRegularExpressionCharacters = /\.[+*]\??/g;

const escapedRegularExpressionCharacters = /\\([\\^$*+?.()\[\]])/g;
