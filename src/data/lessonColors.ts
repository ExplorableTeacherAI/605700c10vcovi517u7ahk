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

/** The two tests, each borrowing the colour of the relationship it belongs to. */
export const COLOR_PRODUCT_TEXT = COLOR_CONSTANT_TEXT; // x times y — the inverse test
export const COLOR_RATIO_TEXT = COLOR_DIRECT_TEXT; // y divided by x — the direct test

/** Ready-made colorMap for the x / y / k terms inside a formula. */
export const FORMULA_COLORS = {
    /** x, the input — indigo. */
    x: COLOR_X_TEXT,
    /** y, the response — violet. */
    y: COLOR_Y_TEXT,
    /** k, the constant — teal. */
    k: COLOR_CONSTANT_TEXT,
    /** The direct rule and everything it owns — coral. */
    direct: COLOR_DIRECT_TEXT,
    /** The inverse rule and everything it owns — teal. */
    inverse: COLOR_CONSTANT_TEXT,
    /** x times y, the inverse test — teal, matching the tinted column. */
    product: COLOR_PRODUCT_TEXT,
    /** y divided by x, the direct test — coral, matching the tinted column. */
    ratio: COLOR_RATIO_TEXT,
    /** A value the student supplies — rose. */
    answer: COLOR_ANSWER,
} as const;
