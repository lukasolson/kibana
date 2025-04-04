/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { RuleTypeModel } from '../../types';
import type { IsEnabledResult, IsDisabledResult } from './check_rule_type_enabled';

export type RuleTypeGroup = [
  string,
  Array<{
    id: string;
    name: string;
    checkEnabledResult: IsEnabledResult | IsDisabledResult;
    ruleTypeItem: RuleTypeModel;
  }>
];

export function ruleTypeGroupCompare(
  left: RuleTypeGroup,
  right: RuleTypeGroup,
  groupNames: Map<string, string> | undefined
) {
  const groupNameA = left[0];
  const groupNameB = right[0];
  const leftRuleTypesList = left[1];
  const rightRuleTypesList = right[1];

  const hasEnabledRuleTypeInListLeft =
    leftRuleTypesList.find((ruleTypeItem) => ruleTypeItem.checkEnabledResult.isEnabled) !==
    undefined;

  const hasEnabledRuleTypeInListRight =
    rightRuleTypesList.find((ruleTypeItem) => ruleTypeItem.checkEnabledResult.isEnabled) !==
    undefined;

  if (hasEnabledRuleTypeInListLeft && !hasEnabledRuleTypeInListRight) {
    return -1;
  }
  if (!hasEnabledRuleTypeInListLeft && hasEnabledRuleTypeInListRight) {
    return 1;
  }

  return groupNames
    ? groupNames.get(groupNameA)!.localeCompare(groupNames.get(groupNameB)!)
    : groupNameA.localeCompare(groupNameB);
}

export function ruleTypeUngroupedCompare(
  left: RuleTypeGroup,
  right: RuleTypeGroup,
  ruleTypes?: string[]
) {
  const leftRuleTypesList = left[1];
  const rightRuleTypesList = right[1];

  const hasEnabledRuleTypeInListLeft =
    leftRuleTypesList.find((ruleTypeItem) => ruleTypeItem.checkEnabledResult.isEnabled) !==
    undefined;

  const hasEnabledRuleTypeInListRight =
    rightRuleTypesList.find((ruleTypeItem) => ruleTypeItem.checkEnabledResult.isEnabled) !==
    undefined;

  if (hasEnabledRuleTypeInListLeft && !hasEnabledRuleTypeInListRight) {
    return -1;
  }
  if (!hasEnabledRuleTypeInListLeft && hasEnabledRuleTypeInListRight) {
    return 1;
  }

  return ruleTypes
    ? ruleTypes.findIndex((frtA) => leftRuleTypesList.some((aRuleType) => aRuleType.id === frtA)) -
        ruleTypes.findIndex((frtB) => rightRuleTypesList.some((bRuleType) => bRuleType.id === frtB))
    : 0;
}

export function ruleTypeCompare(
  a: {
    id: string;
    name: string;
    checkEnabledResult: IsEnabledResult | IsDisabledResult;
    ruleTypeItem: RuleTypeModel;
  },
  b: {
    id: string;
    name: string;
    checkEnabledResult: IsEnabledResult | IsDisabledResult;
    ruleTypeItem: RuleTypeModel;
  }
) {
  if (a.checkEnabledResult.isEnabled === true && b.checkEnabledResult.isEnabled === false) {
    return -1;
  }
  if (a.checkEnabledResult.isEnabled === false && b.checkEnabledResult.isEnabled === true) {
    return 1;
  }
  return a.name.localeCompare(b.name);
}
