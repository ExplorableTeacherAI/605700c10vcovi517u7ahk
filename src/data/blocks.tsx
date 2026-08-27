import { type ReactElement } from "react";

// Initialize variables and their colors from this file's variable definitions
import { useVariableStore, initializeVariableColors } from "@/stores";
import { getDefaultValues, variableDefinitions } from "./variables";
useVariableStore.getState().initialize(getDefaultValues());
initializeVariableColors(variableDefinitions);

import { introDirectInverseBlocks } from "./sections/introDirectInverse";
import { inverseConstantBlocks } from "./sections/inverseConstant";
import { whenXDoublesBlocks } from "./sections/whenXDoubles";
import { straightLineOrCurveBlocks } from "./sections/straightLineOrCurve";
import { wrappingUpBlocks } from "./sections/wrappingUp";

export const blocks: ReactElement[] = [
    ...introDirectInverseBlocks,
    ...inverseConstantBlocks,
    ...whenXDoublesBlocks,
    ...straightLineOrCurveBlocks,
    ...wrappingUpBlocks,
];
