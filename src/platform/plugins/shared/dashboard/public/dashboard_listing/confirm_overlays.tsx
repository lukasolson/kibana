/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';

import {
  EUI_MODAL_CANCEL_BUTTON,
  EuiButton,
  EuiButtonEmpty,
  EuiFocusTrap,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiOutsideClickDetector,
  EuiText,
} from '@elastic/eui';
import { toMountPoint } from '@kbn/react-kibana-mount';

import { ViewMode } from '@kbn/presentation-publishing';
import { coreServices } from '../services/kibana_services';
import { createConfirmStrings, resetConfirmStrings } from './_dashboard_listing_strings';

export type DiscardOrKeepSelection = 'cancel' | 'discard' | 'keep';

export const confirmDiscardUnsavedChanges = (
  discardCallback: () => void,
  viewMode: ViewMode = 'edit' // we want to show the danger modal on the listing page
) => {
  coreServices.overlays
    .openConfirm(resetConfirmStrings.getResetSubtitle(viewMode), {
      confirmButtonText: resetConfirmStrings.getResetConfirmButtonText(),
      buttonColor: viewMode === 'edit' ? 'danger' : 'primary',
      maxWidth: 500,
      defaultFocusedButton: EUI_MODAL_CANCEL_BUTTON,
      title: resetConfirmStrings.getResetTitle(),
    })
    .then((isConfirmed) => {
      if (isConfirmed) {
        discardCallback();
      }
    });
};

export const confirmCreateWithUnsaved = (
  startBlankCallback: () => void,
  contineCallback: () => void
) => {
  const titleId = 'confirmDiscardOrKeepTitle';
  const descriptionId = 'confirmDiscardOrKeepDescription';

  const session = coreServices.overlays.openModal(
    toMountPoint(
      <EuiFocusTrap
        clickOutsideDisables={true}
        initialFocus={'.dashboardCreateConfirmContinueButton'}
      >
        <EuiOutsideClickDetector onOutsideClick={() => session.close()}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
          >
            <EuiModalHeader data-test-subj="dashboardCreateConfirm">
              <EuiModalHeaderTitle id={titleId} component="h2">
                {createConfirmStrings.getCreateTitle()}
              </EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody>
              <EuiText>
                <p id={descriptionId}>{createConfirmStrings.getCreateSubtitle()}</p>
              </EuiText>
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButtonEmpty
                data-test-subj="dashboardCreateConfirmCancel"
                onClick={() => session.close()}
              >
                {createConfirmStrings.getCancelButtonText()}
              </EuiButtonEmpty>
              <EuiButtonEmpty
                color="danger"
                data-test-subj="dashboardCreateConfirmStartOver"
                onClick={() => {
                  startBlankCallback();
                  session.close();
                }}
              >
                {createConfirmStrings.getStartOverButtonText()}
              </EuiButtonEmpty>
              <EuiButton
                fill
                data-test-subj="dashboardCreateConfirmContinue"
                className="dashboardCreateConfirmContinueButton"
                onClick={() => {
                  contineCallback();
                  session.close();
                }}
              >
                {createConfirmStrings.getContinueButtonText()}
              </EuiButton>
            </EuiModalFooter>
          </div>
        </EuiOutsideClickDetector>
      </EuiFocusTrap>,
      coreServices
    ),
    {
      'data-test-subj': 'dashboardCreateConfirmModal',
    }
  );
};
