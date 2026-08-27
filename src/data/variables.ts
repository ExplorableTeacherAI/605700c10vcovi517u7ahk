/**
 * Variables Configuration
 * =======================
 * 
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 * 
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 * 
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /**
     * Correct answer for cloze input validation.
     * Accepts a single string, pipe-separated alternates (e.g. "first | 1 | 1st"),
     * or an array of accepted answers (e.g. ["first", "1", "1st"]).
     */
    correctAnswer?: string | string[];
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE
 * =====================================================
 * 
 * SUPPORTED TYPES:
 * 
 * 1. NUMBER (slider):
 *    { defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }
 * 
 * 2. TEXT (free text):
 *    { defaultValue: 'Hello', type: 'text', placeholder: 'Enter text...' }
 * 
 * 3. SELECT (dropdown):
 *    { defaultValue: 'sine', type: 'select', options: ['sine', 'cosine', 'tangent'] }
 * 
 * 4. BOOLEAN (toggle):
 *    { defaultValue: true, type: 'boolean' }
 * 
 * 5. ARRAY (list of numbers):
 *    { defaultValue: [1, 2, 3], type: 'array' }
 * 
 * 6. OBJECT (complex data):
 *    { defaultValue: { x: 5, y: 10 }, type: 'object', schema: '{ x: number, y: number }' }
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ========================================
    // SECTION: The Constant Behind y = k/x
    // ========================================

    /** The constant k — the distance of the journey, in km. */
    inverseConstant: {
        defaultValue: 120,
        type: 'number',
        label: 'Journey distance',
        description: 'The constant k in y = k/x, shown as the distance of the drive in km',
        unit: 'km',
        min: 0,
        max: 300,
        step: 30,
        color: '#62D0AD',
    },

    /** Shared highlight channel for the curve figure: '' | 'current' | 'ghosts'. */
    inverseCurveHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Curve highlight',
        description: 'Which curve group is currently highlighted in the family-of-curves figure',
        color: '#3EAE8C',
        bgColor: 'rgba(98, 208, 173, 0.22)',
    },

    /** Chip colours only — spread onto the ghost phrase, which writes inverseCurveHighlight. */
    inverseGhostHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Ghost curve highlight chip',
        description: 'Slate chip colours for the prose phrase that highlights the ghost curves',
        color: '#64748B',
        bgColor: 'rgba(100, 116, 139, 0.16)',
    },

    // ========================================
    // SECTION: Straight Line or Curve (linked pair)
    // ========================================

    /** The shared x of both dots — the ONE variable that links the two views. */
    contrastX: {
        defaultValue: 2,
        type: 'number',
        label: 'Shared x',
        description: 'The x at which both the straight line and the curve are read (k is fixed at 2)',
        min: 0.5,
        max: 3,
        step: 0.1,
        color: '#64748B',
    },

    /** Shared highlight channel across BOTH views: '' | 'line' | 'curve' | 'product' | 'ratio'. */
    contrastHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Contrast highlight',
        description: 'Which graph or table column is highlighted across the linked pair',
        color: '#6E70DE',
        bgColor: 'rgba(142, 144, 245, 0.22)',
    },

    /** Chip colours only — spread onto the y divided by x phrase, which writes contrastHighlight. */
    contrastRatioHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Ratio column highlight chip',
        description: 'Teal chip colours for the prose phrase that highlights the y divided by x column',
        color: '#3EAE8C',
        bgColor: 'rgba(98, 208, 173, 0.22)',
    },

    /** Assessment: a falling pair of readings that is neither direct nor inverse. */
    answer_contrast_neither: {
        defaultValue: '',
        type: 'select',
        label: 'Which relationship',
        description: 'Student answer for readings where y falls but neither the product nor the ratio repeats',
        placeholder: '???',
        options: ['inverse', 'direct', 'neither'],
        correctAnswer: 'neither',
        color: '#8E90F5',
    },

    /** Assessment: the constant behind readings whose product is always 30. */
    answer_contrast_constant: {
        defaultValue: '',
        type: 'text',
        label: 'Constant from a product',
        description: 'Student answer for k when x times y is always 30',
        placeholder: '???',
        correctAnswer: '30',
        color: '#8E90F5',
    },

    // ========================================
    // SECTION: When x Doubles
    // ========================================

    /** The x of the first dot in the chain; each dot after it doubles x again. */
    doublingStartX: {
        defaultValue: 4,
        type: 'number',
        label: 'First dot',
        description: 'The x value of the first dot in the doubling chain (k is fixed at 120)',
        min: 3,
        max: 6,
        step: 0.5,
        color: '#62D0AD',
    },

    /** Shared highlight channel for the chain figure: '' | 'fractions' | 'subtractions'. */
    doublingHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Chain highlight',
        description: 'Which set of bracket labels is highlighted in the doubling-chain figure',
        color: '#3EAE8C',
        bgColor: 'rgba(98, 208, 173, 0.22)',
    },

    /** Chip colours only — spread onto the subtraction phrase, which writes doublingHighlight. */
    doublingSubtractionHighlight: {
        defaultValue: '',
        type: 'text',
        label: 'Subtraction label highlight chip',
        description: 'Slate chip colours for the prose phrase that highlights the subtraction labels',
        color: '#64748B',
        bgColor: 'rgba(100, 116, 139, 0.16)',
    },

    /** Assessment: y after doubling x, on a journey with k = 36. */
    answer_doubling_halved: {
        defaultValue: '',
        type: 'text',
        label: 'y after doubling x',
        description: 'Student answer for y when x doubles from 3 to 6 with k = 36',
        placeholder: '???',
        correctAnswer: '6',
        color: '#8E90F5',
    },

    /** Assessment: what tripling x does to y. */
    answer_doubling_tripled: {
        defaultValue: '',
        type: 'select',
        label: 'Effect of tripling x',
        description: 'Student answer for what happens to y when x is tripled',
        placeholder: '???',
        options: ['a third of it', 'half of it', 'two thirds of it', 'three times it'],
        correctAnswer: 'a third of it',
        color: '#8E90F5',
    },

    /** Assessment: the constant of a 15 km/h, 4 hour ride. */
    answer_constant_product: {
        defaultValue: '',
        type: 'text',
        label: 'Constant from speed and time',
        description: 'Student answer for the constant of a 15 km/h ride lasting 4 hours',
        placeholder: '???',
        correctAnswer: ['60', '60 km'],
        color: '#8E90F5',
    },

    /** Assessment: time for a 60 km journey at 20 km/h. */
    answer_constant_time: {
        defaultValue: '',
        type: 'text',
        label: 'Time at 20 km/h',
        description: 'Student answer for the time a 60 km journey takes at 20 km/h',
        placeholder: '???',
        correctAnswer: ['3', '3 h', '3 hours'],
        color: '#8E90F5',
    },

    // Uncomment and modify these examples for your lesson:

    /*
    // ─────────────────────────────────────────
    // NUMBER - Use with sliders
    // ─────────────────────────────────────────
    myValue: {
        defaultValue: 5,
        type: 'number',
        label: 'My Value',
        description: 'A number that controls something',
        unit: 'm',           // optional unit display
        min: 0,
        max: 10,
        step: 0.5,
    },

    // ─────────────────────────────────────────
    // TEXT - Free text input
    // ─────────────────────────────────────────
    lessonTitle: {
        defaultValue: 'My Lesson',
        type: 'text',
        label: 'Lesson Title',
        description: 'The title of your lesson',
        placeholder: 'Enter a title...',
    },

    // ─────────────────────────────────────────
    // SELECT - Dropdown with options
    // ─────────────────────────────────────────
    difficulty: {
        defaultValue: 'medium',
        type: 'select',
        label: 'Difficulty',
        description: 'The difficulty level of the lesson',
        options: ['easy', 'medium', 'hard', 'expert'],
    },

    // ─────────────────────────────────────────
    // BOOLEAN - Toggle switch
    // ─────────────────────────────────────────
    showHints: {
        defaultValue: true,
        type: 'boolean',
        label: 'Show Hints',
        description: 'Toggle to show or hide hints',
    },

    // ─────────────────────────────────────────
    // ARRAY - List of numbers
    // ─────────────────────────────────────────
    dataPoints: {
        defaultValue: [1, 4, 9, 16, 25],
        type: 'array',
        label: 'Data Points',
        description: 'Y-values for plotting a graph',
    },

    // ─────────────────────────────────────────
    // OBJECT - Complex structured data
    // ─────────────────────────────────────────
    graphSettings: {
        defaultValue: { 
            xMin: -10, 
            xMax: 10, 
            showGrid: true 
        },
        type: 'object',
        label: 'Graph Settings',
        description: 'Configuration for the graph display',
        schema: '{ xMin: number, xMax: number, showGrid: boolean }',
    },
    */
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
