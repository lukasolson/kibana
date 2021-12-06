/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { flow } from 'lodash';
import type { KqlNode } from './types';

export const KQL_NODE_TYPE_LITERAL = 'literal';

export type KqlLiteralType = null | boolean | string;

export interface KqlLiteralNode extends KqlNode {
  type: typeof KQL_NODE_TYPE_LITERAL;
  value: KqlLiteralType;
  isPhrase: boolean;
}

export function isNode(node: KqlNode): node is KqlLiteralNode {
  return node.type === KQL_NODE_TYPE_LITERAL;
}

export function buildNode(value: KqlLiteralType, isPhrase: boolean = false): KqlLiteralNode {
  return {
    type: KQL_NODE_TYPE_LITERAL,
    value,
    isPhrase,
  };
}

export function toKqlExpression({ value, isPhrase }: KqlLiteralNode) {
  const escapedValue = isPhrase ? escapeQuotedString(`${value}`) : escapeUnquotedString(`${value}`);
  return isPhrase ? `"${escapedValue}"` : escapedValue;
}

export function toElasticsearchQuery({ value }: KqlLiteralNode) {
  return value;
}

export const escapeQuotedString = flow(escapeQuotes, escapeWhitespace);
export const escapeUnquotedString = flow(escapeSpecialCharacters, escapeKeyword, escapeWhitespace);

/**
 * @see QuotedCharacter rule in grammar.peggy
 */
function escapeQuotes(str: string) {
  return str.replace(/[\\"]/g, '\\$&');
}

/**
 * @see SpecialCharacter rule in grammar.peggy
 */
function escapeSpecialCharacters(str: string) {
  return str.replace(/[\\():<>"*{}]/g, '\\$&'); // $& means the whole matched string
}

/**
 * @see Keyword rule in grammar.peggy
 */
function escapeKeyword(str: string) {
  return str
    .replace(/(\s+)(and|or)(\s+)/gi, '$1\\$2$3') // AND/OR
    .replace(/not(\s+)/gi, '\\$&'); // NOT
}

/**
 * @see Space rule in grammar.peggy
 */
function escapeWhitespace(str: string) {
  return str.replace(/\t/g, '\\t').replace(/\r/g, '\\r').replace(/\n/g, '\\n');
}
