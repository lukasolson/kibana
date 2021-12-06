/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { flow } from 'lodash';

export const escapeUnquotedLiteral = flow(
  escapeSpecialCharacters,
  escapeAndOr,
  escapeNot,
  escapeWhitespace
);

export const escapeQuotedString = flow(escapeQuotes, escapeWhitespace);

/**
 * Escapes backslashes and double-quotes. (Useful when putting a string in quotes to use as a value
 * in a KQL expression. See the QuotedCharacter rule in grammar.peggy.)
 */
function escapeQuotes(str: string) {
  return str.replace(/[\\"]/g, '\\$&');
}

// See the SpecialCharacter rule in grammar.peggy
function escapeSpecialCharacters(str: string) {
  return str.replace(/[\\():<>"*{}]/g, '\\$&'); // $& means the whole matched string
}

// See the Keyword rule in grammar.peggy
function escapeAndOr(str: string) {
  return str.replace(/(\s+)(and|or)(\s+)/gi, '$1\\$2$3');
}

function escapeNot(str: string) {
  return str.replace(/not(\s+)/gi, '\\$&');
}

// See the Space rule in grammar.peggy
function escapeWhitespace(str: string) {
  return str.replace(/\t/g, '\\t').replace(/\r/g, '\\r').replace(/\n/g, '\\n');
}
