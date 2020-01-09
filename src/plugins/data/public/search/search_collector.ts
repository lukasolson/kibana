/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { SavedObjectAttributes, SavedObjectsClientContract } from 'kibana/public';
import uuid from 'uuid';
import { IKibanaSearchRequest } from '../../common';

export const SEARCH_COLLECTOR_SAVED_OBJECT_TYPE = 'searchCollector';

export interface SearchCollectorSavedObject extends SavedObjectAttributes {
  requestMap: Record<string, string>;
}

export class SearchCollector {
  private requestMap: Record<string, string> = {};
  private readonly id?: string;
  private initialized: Promise<void> = Promise.resolve();

  constructor(private savedObjectsClient: SavedObjectsClientContract, id?: string) {
    if (id) {
      this.id = id;
      this.initialized = this.savedObjectsClient
        .get<SearchCollectorSavedObject>(SEARCH_COLLECTOR_SAVED_OBJECT_TYPE, id)
        .then(savedObject => {
          this.requestMap = savedObject.attributes.requestMap;
        });
    } else {
      this.id = uuid();
    }
  }

  whenInitialized() {
    return this.initialized;
  }

  clear() {
    this.requestMap = {};
  }

  getId() {
    return this.id;
  }

  getRequestFromKey(key: string) {
    return this.requestMap[key];
  }

  addRequest(key: string, request: Promise<IKibanaSearchRequest>) {
    request.then(response => {
      this.requestMap[key] = response.id!;
    });
  }

  async sendToBackground() {
    await this.savedObjectsClient.create<SearchCollectorSavedObject>(
      SEARCH_COLLECTOR_SAVED_OBJECT_TYPE,
      { requestMap: this.requestMap },
      { id: this.id }
    );
  }
}
