/**
 * Lesson colour language
 * ======================
 *
 * One quantity, one colour — in the figures, in the formulas and in the prose.
 *
 * | Meaning                              | Figure ink | Text / chip ink |
 * |--------------------------------------|-----------|-----------------|
 * | k, the constant (and inverse graphs) | teal      | dark teal       |
 * | x, the input you change              | indigo    | dark indigo     |
 * | y, the value that responds           | violet    | dark violet     |
 * | the direct relationship (y = 2x)     | coral     | dark coral      |
 * | a student's own answer               | rose      | dark rose       |
 */

/** k, the constant — and every inverse curve it draws. */
export const COLOR_CONSTANT = "#62D0AD";
export const COLOR_CONSTANT_TEXT = "#3EAE8C";

/** x, the quantity the student changes. */
export const COLOR_X = "#8E90F5";
export const COLOR_X_TEXT = "#6E70DE";

/** y, the quantity that answers back. */
export const COLOR_Y = "#AC8BF9";
export const COLOR_Y_TEXT = "#8A5FE0";

/** The direct relationship, kept apart from the inverse one. */
export const COLOR_DIRECT = "#F4A89A";
export const COLOR_DIRECT_TEXT = "#C96A52";

/** Answers the student types or picks. */
export const COLOR_ANSWER = "#D2649F";
export const COLOR_ANSWER_BG = "rgba(248, 160, 205, 0.18)";

/** Ready-made colorMap for the x / y / k terms inside a formula. */
export const FORMULA_COLORS = {
    x: COLOR_X_TEXT,
    y: COLOR_Y_TEXT,
    k: COLOR_CONSTANT_TEXT,
    direct: COLOR_DIRECT_TEXT,
    inverse: COLOR_CONSTANT_TEXT,
} as const;
