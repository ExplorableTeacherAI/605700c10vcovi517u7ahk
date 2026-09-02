import React, { useRef, useState, type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InlineFormula,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InlineSpotColor,
    InlineTooltip,
    InlineTrigger,
    InteractionHintSequence,
} from "@/components/atoms";
import { Figure, FigureSlider, FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { clamp, remap, useSpring } from "@/lib/motion";
import {
    getVariableInfo,
    choicePropsFromDefinition,
    clozePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
    scrubVarsFromDefinitions,
    spotColorPropsFromDefinition,
} from "../variables";
import {
    COLOR_CONSTANT,
    COLOR_X,
    COLOR_X_TEXT,
    COLOR_Y_TEXT,
    FORMULA_COLORS,
} from "../lessonColors";

const xProps = spotColorPropsFromDefinition(getVariableInfo("quantityX"));
const yProps = spotColorPropsFromDefinition(getVariableInfo("quantityY"));
const kProps = spotColorPropsFromDefinition(getVariableInfo("quantityConstant"));

// ── View geometry ────────────────────────────────────────────────────────────
// Right gutter of 180px is reserved for the bracket labels before the plot is
// sized, so the widest label still lands inside the viewBox.

const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 400;
const PLOT_LEFT = 72;
const PLOT_RIGHT = 420;
const PLOT_TOP = 72;
const PLOT_BOTTOM = 330;

const AXIS_MAX = 48;
const CONSTANT = 120; // k, held fixed for this figure
const START_MIN = 3;
const START_MAX = 6;
const START_STEP = 0.5;
const START_DEFAULT = 4;
const CHAIN_LENGTH = 4;

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const GRID = "#F1F5F9";
const ACCENT = COLOR_CONSTANT; // teal: the halving that never changes

/** One formatter for every x and y this figure prints, in the figure and the prose. */
const trimNumber = (value: number) => {
    const fixed = value.toFixed(2);
    return fixed.replace(/\.?0+$/, "");
};

const xToPx = (x: number) => remap(x, 0, AXIS_MAX, PLOT_LEFT, PLOT_RIGHT);
const yToPx = (y: number) => remap(y, 0, AXIS_MAX, PLOT_BOTTOM, PLOT_TOP);

const curvePath = () => {
    const startX = CONSTANT / AXIS_MAX;
    const steps = 90;
    let path = "";
    for (let i = 0; i <= steps; i += 1) {
        const x = startX + ((AXIS_MAX - startX) * i) / steps;
        path += `${i === 0 ? "M" : "L"} ${xToPx(x).toFixed(2)} ${yToPx(CONSTANT / x).toFixed(2)} `;
    }
    return path.trim();
};

const snapStart = (value: number) =>
    clamp(Math.round(value / START_STEP) * START_STEP, START_MIN, START_MAX);

// ── Shared highlight contract ────────────────────────────────────────────────

const EASE_150 = { transition: "opacity 150ms ease, stroke-width 150ms ease" } as const;

const useChainHighlight = () => {
    const highlight = useVar<string>("doublingHighlight", "");
    const setVar = useSetVar();
    return {
        opacity: (id: string) => (highlight && highlight !== id ? 0.38 : 1),
        isActive: (id: string) => highlight === id,
        hoverProps: (id: string) => ({
            onPointerEnter: () => setVar("doublingHighlight", id),
            onPointerLeave: () => setVar("doublingHighlight", ""),
        }),
    };
};

// ── The drawing ──────────────────────────────────────────────────────────────

function DoublingChainDrawing() {
    const setVar = useSetVar();
    const startX = useVar<number>("doublingStartX", START_DEFAULT);
    const { opacity, isActive, hoverProps } = useChainHighlight();

    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const draggingRef = useRef(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const handleScale = useSpring(dragging || hovered ? 1.15 : 1, {
        stiffness: 400,
        damping: 26,
    });

    const handlePointerMove = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!draggingRef.current || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const pointerX = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
        setVar("doublingStartX", snapStart(remap(pointerX, PLOT_LEFT, PLOT_RIGHT, 0, AXIS_MAX)));
    };

    // The chain: each dot doubles the x of the one before it.
    const chain = Array.from({ length: CHAIN_LENGTH }, (_, index) => {
        const x = startX * 2 ** index;
        return { x, y: CONSTANT / x };
    });

    // Bracket labels are pushed down when a step is too shallow to hold them,
    // with a leader line back to the bracket it belongs to.
    let lastLabelY = -Infinity;
    const brackets = chain.slice(0, -1).map((from, index) => {
        const to = chain[index + 1];
        const midY = (yToPx(from.y) + yToPx(to.y)) / 2;
        const labelY = Math.max(midY, lastLabelY + 34);
        lastLabelY = labelY;
        return { from, to, midY, labelY };
    });

    const firstX = xToPx(chain[0].x);
    const firstY = yToPx(chain[0].y);

    return (
        <>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
                className="block w-full select-none"
                role="img"
                aria-label="A curve with four dots, each at double the x of the one before, and brackets reporting each fall in y as a subtraction and as a fraction"
            >
                <defs>
                    <filter id="doubling-chain-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                    </filter>
                </defs>

                {/* Readout strip, top-right, where the hyperbola never reaches. */}
                <g fontSize="12" style={{ fontVariantNumeric: "tabular-nums", ...EASE_150 }}>
                    <text x={VIEW_WIDTH - 24} y="32" textAnchor="end" fill={COLOR_X_TEXT} opacity={opacity("__structure")}>
                        {`x:  ${chain.map((dot) => trimNumber(dot.x)).join("  →  ")}`}
                    </text>
                    <text x={VIEW_WIDTH - 24} y="52" textAnchor="end" fill={COLOR_Y_TEXT} opacity={opacity("fractions")}>
                        {`y:  ${chain.map((dot) => trimNumber(dot.y)).join("  →  ")}`}
                    </text>
                </g>

                {/* Ambient structure: grid, axes, ticks, the curve itself. */}
                <g opacity={opacity("__structure")} style={EASE_150}>
                    {[12, 24, 36, 48].map((tick) => (
                        <g key={`grid-${tick}`}>
                            <line x1={PLOT_LEFT} y1={yToPx(tick)} x2={PLOT_RIGHT} y2={yToPx(tick)} stroke={GRID} strokeWidth="1.5" />
                            <text x={PLOT_LEFT - 8} y={yToPx(tick) + 4} textAnchor="end" fontSize="11" fill={INK_STRUCTURE}>
                                {tick}
                            </text>
                            <text x={xToPx(tick)} y={PLOT_BOTTOM + 20} textAnchor="middle" fontSize="11" fill={INK_STRUCTURE}>
                                {tick}
                            </text>
                        </g>
                    ))}
                    <line x1={PLOT_LEFT} y1={PLOT_BOTTOM} x2={PLOT_RIGHT} y2={PLOT_BOTTOM} stroke={INK_QUIET} strokeWidth="1.5" />
                    <line x1={PLOT_LEFT} y1={PLOT_TOP} x2={PLOT_LEFT} y2={PLOT_BOTTOM} stroke={INK_QUIET} strokeWidth="1.5" />
                    <path d={curvePath()} fill="none" stroke={INK_STRUCTURE} strokeWidth="2" strokeLinecap="round" />
                    <text x={(PLOT_LEFT + PLOT_RIGHT) / 2} y={PLOT_BOTTOM + 44} textAnchor="middle" fontSize="12" fill={COLOR_X_TEXT}>
                        x
                    </text>
                    <text x={PLOT_LEFT} y={PLOT_TOP - 14} textAnchor="middle" fontSize="12" fill={COLOR_Y_TEXT}>
                        y
                    </text>
                </g>

                {/* Each step: x doubles across, y falls down. */}
                {brackets.map(({ from, to, midY, labelY }, index) => {
                    const verticalX = xToPx(to.x);
                    const fell = from.y - to.y;
                    return (
                        <g key={`bracket-${index}`}>
                            <g opacity={opacity("__structure")} style={EASE_150}>
                                <line
                                    x1={xToPx(from.x)}
                                    y1={yToPx(from.y)}
                                    x2={verticalX}
                                    y2={yToPx(from.y)}
                                    stroke={INK_QUIET}
                                    strokeWidth="1.5"
                                    strokeDasharray="3 4"
                                />
                                {Math.abs(labelY - midY) > 8 && (
                                    <polyline
                                        points={`${verticalX + 4},${midY} ${verticalX + 8},${labelY - 4}`}
                                        fill="none"
                                        stroke={INK_QUIET}
                                        strokeWidth="1"
                                    />
                                )}
                            </g>

                            {/* SUBTRACTIONS — the amount y drops. Different every step. */}
                            <g {...hoverProps("subtractions")} opacity={opacity("subtractions")} style={EASE_150}>
                                <line
                                    x1={verticalX}
                                    y1={yToPx(from.y)}
                                    x2={verticalX}
                                    y2={yToPx(to.y)}
                                    stroke={INK_STRUCTURE}
                                    strokeWidth={isActive("subtractions") ? 3.2 : 2}
                                    strokeLinecap="round"
                                />
                                {isActive("subtractions") && (
                                    <line
                                        x1={verticalX}
                                        y1={yToPx(from.y)}
                                        x2={verticalX}
                                        y2={yToPx(to.y)}
                                        stroke={INK_STRUCTURE}
                                        strokeWidth="9"
                                        opacity={0.28}
                                        strokeLinecap="round"
                                    />
                                )}
                                <text
                                    x={verticalX + 12}
                                    y={labelY}
                                    fontSize="12"
                                    fill={INK}
                                    style={{ fontVariantNumeric: "tabular-nums" }}
                                >
                                    {`− ${trimNumber(fell)}`}
                                </text>
                            </g>

                            {/* FRACTIONS — the same drop as a fraction. Always one half. */}
                            <g {...hoverProps("fractions")} opacity={opacity("fractions")} style={EASE_150}>
                                {isActive("fractions") && (
                                    <rect
                                        x={verticalX + 8}
                                        y={labelY + 4}
                                        width="32"
                                        height="18"
                                        rx="5"
                                        fill={ACCENT}
                                        opacity={0.24}
                                    />
                                )}
                                <text
                                    x={verticalX + 12}
                                    y={labelY + 16}
                                    fontSize="12"
                                    fill={ACCENT}
                                    fontWeight={isActive("fractions") ? 700 : 500}
                                    style={{ fontVariantNumeric: "tabular-nums" }}
                                >
                                    {"× ½"}
                                </text>
                            </g>
                        </g>
                    );
                })}

                {/* The dots. Only the first one is grabbable. */}
                <g opacity={opacity("__structure")} style={EASE_150}>
                    {chain.slice(1).map((dot) => (
                        <circle
                            key={`dot-${dot.x}`}
                            cx={xToPx(dot.x)}
                            cy={yToPx(dot.y)}
                            r="6"
                            fill="#FFFFFF"
                            stroke={COLOR_X}
                            strokeWidth="2"
                        />
                    ))}
                </g>

                <g transform={`translate(${firstX} ${firstY}) scale(${handleScale})`}>
                    <circle r="9" fill={COLOR_X} filter="url(#doubling-chain-shadow)" />
                </g>
                <circle
                    cx={firstX}
                    cy={firstY}
                    r="24"
                    fill="transparent"
                    style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                    onPointerDown={(event) => {
                        event.currentTarget.setPointerCapture(event.pointerId);
                        draggingRef.current = true;
                        setDragging(true);
                    }}
                    onPointerMove={handlePointerMove}
                    onPointerUp={() => {
                        draggingRef.current = false;
                        setDragging(false);
                    }}
                    onPointerCancel={() => {
                        draggingRef.current = false;
                        setDragging(false);
                    }}
                    onPointerEnter={() => setHovered(true)}
                    onPointerLeave={() => setHovered(false)}
                />
            </svg>

            <div className="px-6 pb-5">
                <FigureSlider
                    varName="doublingStartX"
                    label="First dot at x ="
                    {...numberPropsFromDefinition(getVariableInfo("doublingStartX"))}
                    formatValue={trimNumber}
                />
            </div>
        </>
    );
}

function DoublingChainFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="doubling-chain"
            onReset={() => setVar("doublingStartX", START_DEFAULT)}
            caption="Four dots on y = 120/x, each one at double the x of the dot before. Drag the solid indigo dot and the whole chain rebuilds itself around it."
        >
            <DoublingChainDrawing />
            <InteractionHintSequence
                hintKey="doubling-chain-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the solid indigo dot along the curve",
                        position: { x: "17%", y: "38%" },
                        dragPath: { type: "line", startOffset: { x: -22, y: 0 }, endOffset: { x: 22, y: 0 } },
                    },
                ]}
            />
        </Figure>
    );
}

/**
 * The rule with the live value in it: teal constant, indigo draggable x, violet y.
 */
function LiveDoublingFormula() {
    const startX = useVar<number>("doublingStartX", START_DEFAULT);
    return (
        <FormulaBlock
            latex={`\\clr{y}{y} = \\dfrac{\\clr{k}{120}}{\\scrub{doublingStartX}} = \\clr{y}{${trimNumber(CONSTANT / startX)}}`}
            colorMap={{ y: FORMULA_COLORS.y, k: FORMULA_COLORS.k }}
            variables={scrubVarsFromDefinitions(["doublingStartX"])}
        />
    );
}

/** Derived readout: y for the first dot, using the figure's fixed k. */
function FirstDotY() {
    const startX = useVar<number>("doublingStartX", START_DEFAULT);
    return <span style={{ fontVariantNumeric: "tabular-nums" }}>{trimNumber(CONSTANT / startX)}</span>;
}

export const whenXDoublesBlocks: ReactElement[] = [
    <StackLayout key="layout-doubling-heading" maxWidth="xl">
        <Block id="doubling-heading" padding="md">
            <EditableH2 id="h2-doubling-heading" blockId="doubling-heading">
                When x Doubles
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-doubling-worked-example" maxWidth="xl">
        <Block id="doubling-worked-example" padding="sm">
            <EditableParagraph id="para-doubling-worked-example" blockId="doubling-worked-example">
                Here is where inverse relationships catch people out. Keeping{" "}
                <InlineSpotColor varName="quantityConstant" {...kProps}>k</InlineSpotColor>
                {" "}at 120: when{" "}
                <InlineSpotColor varName="quantityX" {...xProps}>x</InlineSpotColor>
                {" "}is{" "}
                <InlineScrubbleNumber
                    varName="doublingStartX"
                    {...numberPropsFromDefinition(getVariableInfo("doublingStartX"))}
                />
                ,{" "}
                <InlineSpotColor varName="quantityY" {...yProps}>y</InlineSpotColor>
                {" "}is <FirstDotY />, because the two multiply back to 120. Drag the solid indigo dot
                along the curve, and every hollow dot behind it doubles x once more.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-doubling-visual" maxWidth="xl">
        <Block id="doubling-visual" padding="sm" hasVisualization>
            <DoublingChainFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-doubling-live-formula" maxWidth="xl">
        <Block id="doubling-live-formula" padding="lg">
            <LiveDoublingFormula />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-doubling-halving-rule" maxWidth="xl">
        <Block id="doubling-halving-rule" padding="sm">
            <EditableParagraph id="para-doubling-halving-rule" blockId="doubling-halving-rule">
                Halving, not subtracting. Look along the chain: the{" "}
                <InlineLinkedHighlight
                    varName="doublingHighlight"
                    highlightId="subtractions"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("doublingSubtractionHighlight"))}
                >
                    amount y drops
                </InlineLinkedHighlight>
                {" "}is different at every step, while the{" "}
                <InlineLinkedHighlight
                    varName="doublingHighlight"
                    highlightId="fractions"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("doublingHighlight"))}
                >
                    fraction beside it
                </InlineLinkedHighlight>
                {" "}stays stuck at{" "}
                <InlineTooltip
                    id="tooltip-halving-definition"
                    tooltip="Multiplying by one half, which is the same as dividing by two."
                >
                    one half
                </InlineTooltip>
                . For the tidiest run of all, start the chain at{" "}
                <InlineTrigger varName="doublingStartX" value={3} icon="zap">
                    x = 3
                </InlineTrigger>
                . So what would tripling x do instead?
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-doubling-question-halved" maxWidth="xl">
        <Block id="doubling-question-halved" padding="md">
            <EditableParagraph id="para-doubling-question-halved" blockId="doubling-question-halved">
                A shorter journey has a constant of 36, so{" "}
                <InlineFormula
                    latex="\clr{x}{3} \times \clr{y}{12} = \clr{k}{36}"
                    colorMap={{ x: FORMULA_COLORS.x, y: FORMULA_COLORS.y, k: FORMULA_COLORS.k }}
                />
                . Double x to 6 and y becomes{" "}
                <InlineFeedback
                    varName="answer_doubling_halved"
                    correctValue="6"
                    position="terminal"
                    successMessage="— exactly, half of 12, and 6 × 6 still gives 36"
                    failureMessage="— that looks like taking 2 away."
                    hint="Doubling x has to halve y, because the pair must still multiply back to 36"
                    visualizationHint={{
                        blockId: "doubling-visual",
                        hintKey: "doubling-visual-fraction-holds",
                        label: "Discover it yourself",
                        resetVars: { doublingStartX: 4 },
                        steps: [
                            {
                                gesture: "drag-horizontal",
                                label: "Drag the solid indigo dot right to x = 6 and watch every teal fraction label stay at one half",
                                position: { x: "17%", y: "38%" },
                                dragPath: { type: "line", startOffset: { x: -22, y: 0 }, endOffset: { x: 22, y: 0 } },
                                completionVar: "doublingStartX",
                                completionValue: 6,
                                completionTolerance: 0.6,
                            },
                        ],
                    }}
                >
                    <InlineClozeInput
                        varName="answer_doubling_halved"
                        correctAnswer="6"
                        {...clozePropsFromDefinition(getVariableInfo("answer_doubling_halved"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-doubling-question-tripled" maxWidth="xl">
        <Block id="doubling-question-tripled" padding="md">
            <EditableParagraph id="para-doubling-question-tripled" blockId="doubling-question-tripled">
                Now stretch the idea. If{" "}
                <InlineFormula
                    latex="\clr{x}{x} \longrightarrow \clr{x}{3x}"
                    colorMap={{ x: FORMULA_COLORS.x }}
                />
                {" "}instead of doubling, y ends up{" "}
                <InlineFeedback
                    varName="answer_doubling_tripled"
                    correctValue="a third of it"
                    position="terminal"
                    successMessage="— right, tripling one side has to divide the other by three to keep the product still"
                    failureMessage="— have another think."
                    hint="Whatever you multiply x by, y must be divided by the same number"
                >
                    <InlineClozeChoice
                        varName="answer_doubling_tripled"
                        correctAnswer="a third of it"
                        options={["a third of it", "half of it", "two thirds of it", "three times it"]}
                        {...choicePropsFromDefinition(getVariableInfo("answer_doubling_tripled"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
