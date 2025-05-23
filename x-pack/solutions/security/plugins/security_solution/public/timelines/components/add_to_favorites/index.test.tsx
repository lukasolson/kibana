/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { mockTimelineModel, TestProviders } from '../../../common/mock';
import { AddToFavoritesButton } from '.';
import { TimelineStatusEnum } from '../../../../common/api/timeline';
import { useUserPrivileges } from '../../../common/components/user_privileges';

jest.mock('../../../common/components/user_privileges');

const mockGetState = jest.fn();
jest.mock('react-redux', () => {
  const original = jest.requireActual('react-redux');
  return {
    ...original,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    useSelector: (selector: any) =>
      selector({
        timeline: {
          timelineById: {
            'timeline-1': {
              ...mockGetState(),
            },
          },
        },
      }),
  };
});

const renderAddFavoritesButton = () =>
  render(
    <TestProviders>
      <AddToFavoritesButton timelineId="timeline-1" />
    </TestProviders>
  );

describe('AddToFavoritesButton', () => {
  beforeEach(() => {
    (useUserPrivileges as jest.Mock).mockReturnValue({
      timelinePrivileges: {
        crud: true,
      },
    });
  });

  it('should render favorite button enabled and unchecked', () => {
    mockGetState.mockReturnValue({
      ...mockTimelineModel,
      status: TimelineStatusEnum.active,
    });

    const { getByTestId, queryByTestId } = renderAddFavoritesButton();

    const button = getByTestId('timeline-favorite-empty-star');

    expect(button).toBeInTheDocument();
    expect(button).toHaveProperty('id', '');
    expect(button.firstChild).toHaveAttribute('data-euiicon-type', 'starEmpty');
    expect(queryByTestId('timeline-favorite-filled-star')).not.toBeInTheDocument();
  });

  it('should render favorite button disabled for users without write access to timeline', () => {
    mockGetState.mockReturnValue({
      ...mockTimelineModel,
      status: TimelineStatusEnum.active,
    });
    (useUserPrivileges as jest.Mock).mockReturnValue({
      timelinePrivileges: {
        crud: false,
      },
    });

    const { getByTestId } = renderAddFavoritesButton();
    expect(getByTestId('timeline-favorite-empty-star')).toHaveProperty('disabled');
  });

  it('should render favorite button disabled for a draft timeline', () => {
    mockGetState.mockReturnValue({
      ...mockTimelineModel,
      status: TimelineStatusEnum.draft,
    });

    const { getByTestId } = renderAddFavoritesButton();

    expect(getByTestId('timeline-favorite-empty-star')).toHaveProperty('disabled');
  });

  it('should render favorite button disabled for an immutable timeline', () => {
    mockGetState.mockReturnValue({
      ...mockTimelineModel,
      status: TimelineStatusEnum.immutable,
    });

    const { getByTestId } = renderAddFavoritesButton();

    expect(getByTestId('timeline-favorite-empty-star')).toHaveProperty('disabled');
  });

  it('should render favorite button filled for a favorite timeline', () => {
    mockGetState.mockReturnValue({
      ...mockTimelineModel,
      isFavorite: true,
    });

    const { getByTestId, queryByTestId } = renderAddFavoritesButton();

    expect(getByTestId('timeline-favorite-filled-star')).toBeInTheDocument();
    expect(queryByTestId('timeline-favorite-empty-star')).not.toBeInTheDocument();
  });
});
