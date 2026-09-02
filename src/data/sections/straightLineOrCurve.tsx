import React, { useRef, useState, type ReactElement } from "react";
import { Block } from "@/components/templates";
import { SplitLayout, StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
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
    spotColorPropsFromDefinition,
} from "../variables";
import {
    COLOR_CONSTANT,
    COLOR_CONSTANT_TEXT,
    COLOR_DIRECT,
    COLOR_DIRECT_TEXT,
    COLOR_X,
    COLOR_X_TEXT,
} from "../lessonColors";

const xProps = spotColorPropsFromDefinition(getVariableInfo("quantityX"));
const directProps = spotColorPropsFromDefinition(getVariableInfo("quantityDirect"));
const kProps = spotColorPropsFromDefinition(getVariableInfo("quantityConstant"));

/**
 * A LINKED PAIR. Both views read `contrastX` and `contrastHighlight` from the
 * store — nothing else connects them, and neither holds its own copy. The
 * graphs are on the left, the arithmetic on the right, and hovering either one
 * pops its counterpart in the other.
 */

const CONSTANT = 2; // k, shared by both relationships
const X_MIN = 0.5;
const X_MAX_DRAG = 3;
const X_DEFAULT = 2;
const AXIS_X_MAX = 3;
const AXIS_Y_MAX = 6;

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const GRID = "#F1F5F9";
const LINE_COLOR = COLOR_DIRECT; // y = 2x, the direct relationship
const LINE_TEXT = COLOR_DIRECT_TEXT;
const CURVE_COLOR = COLOR_CONSTANT; // y = 2/x, the inverse relationship
const CURVE_TEXT = COLOR_CONSTANT_TEXT;

/** One formatter for every value either view prints, and for the prose. */
const fmt = (value: number) => value.toFixed(1);

const lineY = (x: number) => CONSTANT * x;
const curveY = (x: number) => CONSTANT / x;

const EASE_150 = { transition: "opacity 150ms ease, stroke-width 150ms ease" } as const;

const useContrastHighlight = () => {
    const highlight = useVar<string>("contrastHighlight", "");
    const setVar = useSetVar();
    return {
        highlight,
        hoverProps: (id: string) => ({
            onPointerEnter: () => setVar("contrastHighlight", id),
            onPointerLeave: () => setVar("contrastHighlight", ""),
        }),
    };
};

// ── VIEW A: both graphs on one grid ──────────────────────────────────────────

const A_WIDTH = 380;
const A_HEIGHT = 330;
const A_LEFT = 52;
const A_RIGHT = 344;
const A_TOP = 44;
const A_BOTTOM = 264;

const aX = (x: number) => remap(x, 0, AXIS_X_MAX, A_LEFT, A_RIGHT);
const aY = (y: number) => remap(y, 0, AXIS_Y_MAX, A_BOTTOM, A_TOP);

const linePath = () => `M ${aX(0)} ${aY(0)} L ${aX(AXIS_Y_MAX / CONSTANT)} ${aY(AXIS_Y_MAX)}`;

const curveSvgPath = () => {
    const startX = CONSTANT / AXIS_Y_MAX;
    const steps = 90;
    let path = "";
    for (let i = 0; i <= steps; i += 1) {
        const x = startX + ((AXIS_X_MAX - startX) * i) / steps;
        path += `${i === 0 ? "M" : "L"} ${aX(x).toFixed(2)} ${aY(curveY(x)).toFixed(2)} `;
    }
    return path.trim();
};

function GraphsDrawing() {
    const setVar = useSetVar();
    const x = useVar<number>("contrastX", X_DEFAULT);
    const { highlight, hoverProps } = useContrastHighlight();

    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const draggingRef = useRef(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const lineScale = useSpring(draggingId === "line" || hoveredId === "line" ? 1.15 : 1, { stiffness: 400, damping: 26 });
    const curveScale = useSpring(draggingId === "curve" || hoveredId === "curve" ? 1.15 : 1, { stiffness: 400, damping: 26 });

    const graphOpacity = (id: string) => {
        if (!highlight) return 1;
        if (highlight === id) return 1;
        if (highlight === "product" || highlight === "ratio") return 0.5;
        return 0.38;
    };
    const structureOpacity = highlight ? 0.38 : 1;
    const weight = (id: string, resting: number) => (highlight === id ? resting * 1.6 : resting);

    const movePointer = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!draggingRef.current || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const pointerX = ((event.clientX - rect.left) / rect.width) * A_WIDTH;
        const next = remap(pointerX, A_LEFT, A_RIGHT, 0, AXIS_X_MAX);
        setVar("contrastX", clamp(Math.round(next * 10) / 10, X_MIN, X_MAX_DRAG));
    };

    const dots = [
        { id: "line", color: LINE_COLOR, y: lineY(x), scale: lineScale },
        { id: "curve", color: CURVE_COLOR, y: curveY(x), scale: curveScale },
    ];

    return (
        <>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${A_WIDTH} ${A_HEIGHT}`}
                className="block w-full select-none"
                role="img"
                aria-label="A rising straight line y = 2x and a falling curve y = 2 over x on one grid, each with a draggable dot read at the same x"
            >
                <defs>
                    <filter id="contrast-dot-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                    </filter>
                </defs>

                {/* Structure: grid, axes, ticks, and the ghost of the starting x. */}
                <g opacity={structureOpacity} style={EASE_150}>
                    {[2, 4, 6].map((tick) => (
                        <g key={`y-${tick}`}>
                            <line x1={A_LEFT} y1={aY(tick)} x2={A_RIGHT} y2={aY(tick)} stroke={GRID} strokeWidth="1.5" />
                            <text x={A_LEFT - 8} y={aY(tick) + 4} textAnchor="end" fontSize="11" fill={INK_STRUCTURE}>
                                {tick}
                            </text>
                        </g>
                    ))}
                    {[1, 2, 3].map((tick) => (
                        <text key={`x-${tick}`} x={aX(tick)} y={A_BOTTOM + 20} textAnchor="middle" fontSize="11" fill={INK_STRUCTURE}>
                            {tick}
                        </text>
                    ))}
                    <line x1={A_LEFT} y1={A_BOTTOM} x2={A_RIGHT} y2={A_BOTTOM} stroke={INK_QUIET} strokeWidth="1.5" />
                    <line x1={A_LEFT} y1={A_TOP} x2={A_LEFT} y2={A_BOTTOM} stroke={INK_QUIET} strokeWidth="1.5" />
                    <text x={(A_LEFT + A_RIGHT) / 2} y={A_BOTTOM + 42} textAnchor="middle" fontSize="12" fill={COLOR_X_TEXT}>
                        x
                    </text>
                    <text x={A_LEFT} y={A_TOP - 16} textAnchor="middle" fontSize="12" fill={INK}>
                        y
                    </text>

                    {/* Where the pair started — the before-state, kept in view. */}
                    <line
                        x1={aX(X_DEFAULT)}
                        y1={A_TOP}
                        x2={aX(X_DEFAULT)}
                        y2={A_BOTTOM}
                        stroke={INK_QUIET}
                        strokeWidth="1.5"
                        strokeDasharray="2 5"
                    />
                    <circle cx={aX(X_DEFAULT)} cy={aY(lineY(X_DEFAULT))} r="5" fill="none" stroke={INK_QUIET} strokeWidth="1.5" />
                    <circle cx={aX(X_DEFAULT)} cy={aY(curveY(X_DEFAULT))} r="5" fill="none" stroke={INK_QUIET} strokeWidth="1.5" />

                    {/* The visible tie: one x, read by both graphs. */}
                    <line x1={aX(x)} y1={A_TOP} x2={aX(x)} y2={A_BOTTOM} stroke={COLOR_X} strokeWidth="1.5" strokeDasharray="4 4" />
                    <text x={A_RIGHT} y={A_TOP - 16} textAnchor="end" fontSize="12" fill={COLOR_X_TEXT} style={{ fontVariantNumeric: "tabular-nums" }}>
                        {`x = ${fmt(x)}`}
                    </text>
                </g>

                {/* PRODUCT overlay — the rectangle whose area is x times y. */}
                {highlight === "product" &&
                    dots.map((dot) => (
                        <rect
                            key={`product-${dot.id}`}
                            x={A_LEFT}
                            y={aY(dot.y)}
                            width={aX(x) - A_LEFT}
                            height={A_BOTTOM - aY(dot.y)}
                            fill={dot.color}
                            fillOpacity={0.24}
                            stroke={dot.color}
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                        />
                    ))}

                {/* RATIO overlay — the ray from the origin, whose steepness is y over x. */}
                {highlight === "ratio" &&
                    dots.map((dot) => (
                        <line
                            key={`ratio-${dot.id}`}
                            x1={A_LEFT}
                            y1={A_BOTTOM}
                            x2={aX(x)}
                            y2={aY(dot.y)}
                            stroke={dot.color}
                            strokeWidth="2.5"
                            strokeDasharray="5 4"
                        />
                    ))}

                {/* THE STRAIGHT LINE — y = 2x. */}
                <g {...hoverProps("line")} opacity={graphOpacity("line")} style={EASE_150}>
                    {highlight === "line" && (
                        <path d={linePath()} fill="none" stroke={LINE_COLOR} strokeWidth="9" opacity={0.28} strokeLinecap="round" />
                    )}
                    <path d={linePath()} fill="none" stroke={LINE_COLOR} strokeWidth={weight("line", 3)} strokeLinecap="round" />
                    <text x={aX(1.5) - 10} y={aY(3) - 8} textAnchor="end" fontSize="12" fill={LINE_TEXT}>
                        y = 2x
                    </text>
                </g>

                {/* THE CURVE — y = 2/x. */}
                <g {...hoverProps("curve")} opacity={graphOpacity("curve")} style={EASE_150}>
                    {highlight === "curve" && (
                        <path d={curveSvgPath()} fill="none" stroke={CURVE_COLOR} strokeWidth="9" opacity={0.28} strokeLinecap="round" />
                    )}
                    <path d={curveSvgPath()} fill="none" stroke={CURVE_COLOR} strokeWidth={weight("curve", 3)} strokeLinecap="round" />
                    <text x={aX(2.4)} y={aY(curveY(2.4)) + 22} textAnchor="middle" fontSize="12" fill={CURVE_TEXT}>
                        y = 2/x
                    </text>
                </g>

                {/* Both dots are draggable, and both write the same x. */}
                {dots.map((dot) => (
                    <g key={`dot-${dot.id}`}>
                        <g transform={`translate(${aX(x)} ${aY(dot.y)}) scale(${dot.scale})`} opacity={graphOpacity(dot.id)} style={EASE_150}>
                            <circle r="9" fill={dot.color} filter="url(#contrast-dot-shadow)" />
                        </g>
                        <circle
                            cx={aX(x)}
                            cy={aY(dot.y)}
                            r="22"
                            fill="transparent"
                            style={{ cursor: draggingId === dot.id ? "grabbing" : "grab", touchAction: "none" }}
                            onPointerDown={(event) => {
                                event.currentTarget.setPointerCapture(event.pointerId);
                                draggingRef.current = true;
                                setDraggingId(dot.id);
                            }}
                            onPointerMove={movePointer}
                            onPointerUp={() => {
                                draggingRef.current = false;
                                setDraggingId(null);
                            }}
                            onPointerCancel={() => {
                                draggingRef.current = false;
                                setDraggingId(null);
                            }}
                            onPointerEnter={() => setHoveredId(dot.id)}
                            onPointerLeave={() => setHoveredId(null)}
                        />
                    </g>
                ))}
            </svg>

            <div className="px-6 pb-5">
                <FigureSlider
                    varName="contrastX"
                    label="Read both graphs at x ="
                    {...numberPropsFromDefinition(getVariableInfo("contrastX"))}
                    formatValue={fmt}
                />
            </div>
        </>
    );
}

function GraphsFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="contrast-graphs"
            onReset={() => {
                setVar("contrastX", X_DEFAULT);
                setVar("contrastHighlight", "");
            }}
            caption="Both relationships built on the same constant, k = 2. Drag the coral dot or the teal one sideways; both graphs are always read at the same x, and the hollow grey dots show where the pair started."
        >
            <GraphsDrawing />
            <InteractionHintSequence
                hintKey="contrast-graphs-drag"
                steps={[
                    {
                        gesture: "drag-horizontal",
                        label: "Drag the coral dot or the teal one sideways",
                        position: { x: "65%", y: "30%" },
                        dragPath: { type: "line", startOffset: { x: -22, y: 0 }, endOffset: { x: 22, y: 0 } },
                    },
                ]}
            />
        </Figure>
    );
}

// ── VIEW B: the arithmetic for the very same point ───────────────────────────

const B_WIDTH = 380;
const B_HEIGHT = 330;
const PRODUCT_CENTER = 190;
const RATIO_CENTER = 300;
const ROW_Y = [140, 220];

function ArithmeticDrawing() {
    const x = useVar<number>("contrastX", X_DEFAULT);
    const { highlight, hoverProps } = useContrastHighlight();

    const rows = [
        {
            id: "line",
            label: "y = 2x",
            color: LINE_COLOR,
            textColor: LINE_TEXT,
            product: lineY(x) * x,
            ratio: lineY(x) / x,
            frozen: "ratio",
            startProduct: lineY(X_DEFAULT) * X_DEFAULT,
            startRatio: lineY(X_DEFAULT) / X_DEFAULT,
        },
        {
            id: "curve",
            label: "y = 2/x",
            color: CURVE_COLOR,
            textColor: CURVE_TEXT,
            product: curveY(x) * x,
            ratio: curveY(x) / x,
            frozen: "product",
            startProduct: curveY(X_DEFAULT) * X_DEFAULT,
            startRatio: curveY(X_DEFAULT) / X_DEFAULT,
        },
    ];

    const dim = (...ids: string[]) => (highlight && !ids.includes(highlight) ? 0.38 : 1);

    return (
        <svg
            viewBox={`0 0 ${B_WIDTH} ${B_HEIGHT}`}
            className="block w-full select-none"
            role="img"
            aria-label="A table of x times y and y divided by x for each relationship at the shared x"
        >
            <text x="24" y="34" fontSize="12" fill={INK} opacity={dim("")} style={{ fontVariantNumeric: "tabular-nums", ...EASE_150 }}>
                {`for the very same point, x = ${fmt(x)}`}
            </text>

            {/* Column headers — each one a highlight target with a counterpart
                overlay in the graph view. */}
            <g {...hoverProps("product")} opacity={dim("product", "line", "curve")} style={EASE_150}>
                <text x={PRODUCT_CENTER} y="72" textAnchor="middle" fontSize="13" fill={CURVE_TEXT} fontWeight={highlight === "product" ? 700 : 600}>
                    x × y
                </text>
            </g>
            <g {...hoverProps("ratio")} opacity={dim("ratio", "line", "curve")} style={EASE_150}>
                <text x={RATIO_CENTER} y="72" textAnchor="middle" fontSize="13" fill={LINE_TEXT} fontWeight={highlight === "ratio" ? 700 : 600}>
                    y ÷ x
                </text>
            </g>
            <line x1="24" y1="84" x2={B_WIDTH - 24} y2="84" stroke={INK_QUIET} strokeWidth="1.5" opacity={dim("")} style={EASE_150} />

            {rows.map((row, rowIndex) => {
                const y = ROW_Y[rowIndex];
                const cells = [
                    { column: "product", center: PRODUCT_CENTER, value: row.product, start: row.startProduct },
                    { column: "ratio", center: RATIO_CENTER, value: row.ratio, start: row.startRatio },
                ];
                return (
                    <g key={row.id}>
                        <g {...hoverProps(row.id)} opacity={dim(row.id, "product", "ratio")} style={EASE_150}>
                            <line
                                x1="24"
                                y1={y - 5}
                                x2="44"
                                y2={y - 5}
                                stroke={row.color}
                                strokeWidth={highlight === row.id ? 4.8 : 3}
                                strokeLinecap="round"
                            />
                            <text x="52" y={y} fontSize="13" fill={INK} fontWeight={highlight === row.id ? 700 : 500}>
                                {row.label}
                            </text>
                        </g>

                        {cells.map((cell) => {
                            const isFrozen = row.frozen === cell.column;
                            const isActive = highlight === row.id || highlight === cell.column;
                            const moved = Math.abs(cell.value - cell.start) > 0.05;
                            return (
                                <g
                                    key={`${row.id}-${cell.column}`}
                                    {...hoverProps(cell.column)}
                                    opacity={highlight && !isActive ? 0.38 : 1}
                                    style={EASE_150}
                                >
                                    {isFrozen && (
                                        <rect
                                            x={cell.center - 46}
                                            y={y - 22}
                                            width="92"
                                            height="30"
                                            rx="7"
                                            fill={row.color}
                                            opacity={isActive ? 0.3 : 0.16}
                                        />
                                    )}
                                    <text
                                        x={cell.center}
                                        y={y}
                                        textAnchor="middle"
                                        fontSize="18"
                                        fill={isFrozen ? row.textColor : INK}
                                        fontWeight={isFrozen ? 700 : 500}
                                        style={{ fontVariantNumeric: "tabular-nums" }}
                                    >
                                        {fmt(cell.value)}
                                    </text>
                                    {isFrozen ? (
                                        <text x={cell.center} y={y + 24} textAnchor="middle" fontSize="10" fill={row.textColor}>
                                            same every time
                                        </text>
                                    ) : (
                                        moved && (
                                            <text
                                                x={cell.center}
                                                y={y + 24}
                                                textAnchor="middle"
                                                fontSize="10"
                                                fill={INK_STRUCTURE}
                                                style={{ fontVariantNumeric: "tabular-nums" }}
                                            >
                                                {`was ${fmt(cell.start)}`}
                                            </text>
                                        )
                                    )}
                                </g>
                            );
                        })}
                    </g>
                );
            })}

            <text x="24" y="292" fontSize="12" fill={INK_STRUCTURE} opacity={dim("")} style={EASE_150}>
                One number in each row never moves.
            </text>
        </svg>
    );
}

function ArithmeticFigure() {
    return (
        <Figure
            id="contrast-arithmetic"
            caption="The same two numbers, multiplied and divided. The tinted value in each row is the one that holds still, whatever x you choose."
        >
            <ArithmeticDrawing />
        </Figure>
    );
}

export const straightLineOrCurveBlocks: ReactElement[] = [
    <StackLayout key="layout-contrast-heading" maxWidth="xl">
        <Block id="contrast-heading" padding="md">
            <EditableH2 id="h2-contrast-heading" blockId="contrast-heading">
                Straight Line or Curve
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-contrast-two-rules" maxWidth="xl">
        <Block id="contrast-two-rules" padding="sm">
            <EditableParagraph id="para-contrast-two-rules" blockId="contrast-two-rules">
                Now set the two rules against each other on the same{" "}
                <InlineSpotColor varName="quantityConstant" {...kProps}>constant, k = 2</InlineSpotColor>
                : the{" "}
                <InlineSpotColor varName="quantityDirect" {...directProps}>coral line</InlineSpotColor>
                {" "}is a{" "}
                <InlineTooltip
                    id="tooltip-direct-definition"
                    tooltip="A relationship where both quantities grow together, because y divided by x always lands on the same number."
                >
                    direct
                </InlineTooltip>
                {" "}rule, y = 2x, and the{" "}
                <InlineSpotColor varName="quantityConstant" {...kProps}>teal curve</InlineSpotColor>
                {" "}is an inverse one, y = 2/x. Drag either dot sideways, then watch which number in
                each row refuses to move.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <SplitLayout key="layout-contrast-visual" ratio="1:1" gap="lg" align="start">
        <Block id="contrast-visual" padding="sm" hasVisualization>
            <GraphsFigure />
        </Block>
        <Block id="contrast-arithmetic-view" padding="sm" hasVisualization>
            <ArithmeticFigure />
        </Block>
    </SplitLayout>,

    <StackLayout key="layout-contrast-tests-formula" maxWidth="xl">
        <Block id="contrast-tests-formula" padding="lg">
            <FormulaBlock
                latex="\clr{direct}{y = 2x} \;\Rightarrow\; \highlight{ratio}{y \div x} = 2 \qquad\qquad \clr{inverse}{y = 2/x} \;\Rightarrow\; \highlight{product}{x \times y} = 2"
                colorMap={{ direct: COLOR_DIRECT_TEXT, inverse: COLOR_CONSTANT_TEXT }}
                linkedHighlights={{
                    ratio: {
                        varName: "contrastHighlight",
                        color: COLOR_DIRECT_TEXT,
                        bgColor: "rgba(244, 168, 154, 0.24)",
                    },
                    product: {
                        varName: "contrastHighlight",
                        color: COLOR_CONSTANT_TEXT,
                        bgColor: "rgba(98, 208, 173, 0.22)",
                    },
                }}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-contrast-real-test" maxWidth="xl">
        <Block id="contrast-real-test" padding="sm">
            <EditableParagraph id="para-contrast-real-test" blockId="contrast-real-test">
                One climbs, one falls, and that part is easy. The trap is assuming anything falling
                must be inverse, so the honest test is arithmetic. At{" "}
                <InlineSpotColor varName="quantityX" {...xProps}>x</InlineSpotColor>
                {" "}={" "}
                <InlineScrubbleNumber
                    varName="contrastX"
                    {...numberPropsFromDefinition(getVariableInfo("contrastX"))}
                    formatValue={fmt}
                />
                ,{" "}
                <InlineLinkedHighlight
                    varName="contrastHighlight"
                    highlightId="product"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("contrastHighlight"))}
                >
                    multiplying x by y
                </InlineLinkedHighlight>
                {" "}holds still for the curve, while{" "}
                <InlineLinkedHighlight
                    varName="contrastHighlight"
                    highlightId="ratio"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("contrastRatioHighlight"))}
                >
                    dividing y by x
                </InlineLinkedHighlight>
                {" "}holds still for the line. There is one{" "}
                <InlineTrigger varName="contrastX" value={1} icon="zap">
                    x where the two agree
                </InlineTrigger>
                , and even there the tests tell them apart.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-contrast-question-neither" maxWidth="xl">
        <Block id="contrast-question-neither" padding="md">
            <EditableParagraph id="para-contrast-question-neither" blockId="contrast-question-neither">
                Here is a fresh pair of readings: when x is 1, y is 8, and when x is 2, y is 6. Since y
                falls as x grows, this relationship is{" "}
                <InlineFeedback
                    varName="answer_contrast_neither"
                    correctValue="neither"
                    position="terminal"
                    successMessage="— exactly, 1 × 8 = 8 but 2 × 6 = 12, so nothing holds still and falling was never proof"
                    failureMessage="— falling on its own is not proof."
                    hint="Work out x × y for both readings, then y ÷ x, and see whether either one repeats"
                    visualizationHint={{
                        blockId: "contrast-visual",
                        hintKey: "contrast-visual-product-holds",
                        label: "Discover it yourself",
                        resetVars: { contrastX: 2, contrastHighlight: "" },
                        steps: [
                            {
                                gesture: "drag-horizontal",
                                label: "Drag either dot out to x = 3 and watch the tinted value in each row stay exactly where it was",
                                position: { x: "65%", y: "30%" },
                                dragPath: { type: "line", startOffset: { x: -22, y: 0 }, endOffset: { x: 22, y: 0 } },
                                completionVar: "contrastX",
                                completionValue: 3,
                                completionTolerance: 0.3,
                            },
                        ],
                    }}
                >
                    <InlineClozeChoice
                        varName="answer_contrast_neither"
                        correctAnswer="neither"
                        options={["inverse", "direct", "neither"]}
                        {...choicePropsFromDefinition(getVariableInfo("answer_contrast_neither"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-contrast-question-constant" maxWidth="xl">
        <Block id="contrast-question-constant" padding="md">
            <EditableParagraph id="para-contrast-question-constant" blockId="contrast-question-constant">
                Another set of readings gives x × y = 30 every single time. Written in the form y = k/x,
                its constant k must be{" "}
                <InlineFeedback
                    varName="answer_contrast_constant"
                    correctValue="30"
                    position="terminal"
                    successMessage="— right, the product that never moves is the constant itself"
                    failureMessage="— close."
                    hint="For an inverse relationship, the number x × y keeps landing on is k"
                >
                    <InlineClozeInput
                        varName="answer_contrast_constant"
                        correctAnswer="30"
                        {...clozePropsFromDefinition(getVariableInfo("answer_contrast_constant"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
