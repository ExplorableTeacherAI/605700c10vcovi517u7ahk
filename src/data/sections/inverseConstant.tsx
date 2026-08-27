import React, { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout, Step, StepLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineClozeChoice,
    InlineClozeInput,
    InlineFeedback,
    InlineLinkedHighlight,
    InlineScrubbleNumber,
    InlineTooltip,
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
} from "../variables";

// ── View geometry ────────────────────────────────────────────────────────────
// Gutters are reserved BEFORE the plot is sized, so no label can be clipped.

const VIEW_WIDTH = 560;
const VIEW_HEIGHT = 348;
const PLOT_LEFT = 64;
const PLOT_RIGHT = 512; // 48px right gutter: the "120" tick label still fits
const PLOT_TOP = 64;
const PLOT_BOTTOM = 280;

const SPEED_MIN = 10; // km/h
const SPEED_MAX = 120;
const TIME_MIN = 0; // hours
const TIME_MAX = 6;

const K_MIN = 0;
const K_MAX = 300;
const K_STEP = 30;
const K_DEFAULT = 120;
const HANDLE_SPEED = 60; // the handle rides the curve at a steady 60 km/h

const INK = "#334155";
const INK_STRUCTURE = "#64748B";
const INK_QUIET = "#CBD5E1";
const GRID = "#F1F5F9";
const ACCENT = "#62D0AD"; // ONE accent: the curve the student is holding

// One formatter per quantity — figure, slider readout and prose all use these.
const formatDistance = (value: number) => `${Math.round(value)} km`;
const formatTime = (value: number) => `${value.toFixed(1)} h`;

const speedToPx = (speed: number) =>
    remap(speed, SPEED_MIN, SPEED_MAX, PLOT_LEFT, PLOT_RIGHT);
const timeToPx = (time: number) =>
    remap(time, TIME_MIN, TIME_MAX, PLOT_BOTTOM, PLOT_TOP);

/** y = k/x, sampled from where it enters the top of the frame to the right edge. */
const curvePath = (k: number) => {
    const startSpeed = Math.max(SPEED_MIN, k / TIME_MAX);
    const steps = 90;
    let path = "";
    for (let i = 0; i <= steps; i += 1) {
        const speed = startSpeed + ((SPEED_MAX - startSpeed) * i) / steps;
        const x = speedToPx(speed);
        const y = timeToPx(k / speed);
        path += `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)} `;
    }
    return path.trim();
};

const snapConstant = (value: number) =>
    clamp(Math.round(value / K_STEP) * K_STEP, K_MIN, K_MAX);

// ── Shared highlight contract ────────────────────────────────────────────────

const EASE_150 = { transition: "opacity 150ms ease, stroke-width 150ms ease" } as const;

const useCurveHighlight = () => {
    const highlight = useVar<string>("inverseCurveHighlight", "");
    const setVar = useSetVar();
    return {
        opacity: (id: string) => (highlight && highlight !== id ? 0.38 : 1),
        weight: (id: string, resting: number) => (highlight === id ? resting * 1.6 : resting),
        isActive: (id: string) => highlight === id,
        hoverProps: (id: string) => ({
            onPointerEnter: () => setVar("inverseCurveHighlight", id),
            onPointerLeave: () => setVar("inverseCurveHighlight", ""),
        }),
    };
};

const Halo = ({ active, children }: { active: boolean; children: React.ReactNode }) =>
    active ? <g opacity={0.28}>{children}</g> : null;

// ── The drawing ──────────────────────────────────────────────────────────────

interface DrawingProps {
    /** Every constant the curve has already visited — owned by the figure shell. */
    ghosts: number[];
    onVisit: (previousConstant: number) => void;
}

function FamilyOfCurvesDrawing({ ghosts, onVisit }: DrawingProps) {
    const setVar = useSetVar();
    const constant = useVar<number>("inverseConstant", K_DEFAULT);
    const { opacity, weight, isActive, hoverProps } = useCurveHighlight();

    const previousConstant = useRef(constant);

    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const draggingRef = useRef(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const handleScale = useSpring(dragging || hovered ? 1.15 : 1, {
        stiffness: 400,
        damping: 26,
    });

    // Any change of k — handle, slider or the number in the prose — drops a ghost.
    useEffect(() => {
        const previous = previousConstant.current;
        if (previous === constant) return;
        previousConstant.current = constant;
        onVisit(previous);
    }, [constant, onVisit]);

    const handlePointerMove = (event: React.PointerEvent<SVGCircleElement>) => {
        if (!draggingRef.current || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const pointerY = ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT;
        const time = remap(pointerY, PLOT_BOTTOM, PLOT_TOP, TIME_MIN, TIME_MAX);
        setVar("inverseConstant", snapConstant(HANDLE_SPEED * time));
    };

    const handleTime = constant / HANDLE_SPEED;
    const handleX = speedToPx(HANDLE_SPEED);
    const handleY = timeToPx(handleTime);

    return (
        <>
            <svg
                ref={svgRef}
                viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
                className="block w-full select-none"
                role="img"
                aria-label="Travel time against speed for a fixed distance, with a draggable handle that changes the distance and leaves faded curves behind"
            >
                <defs>
                    <filter id="family-curves-shadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
                    </filter>
                </defs>

                {/* Readouts — beside the drawing, never over it. */}
                <g fontSize="12" style={{ fontVariantNumeric: "tabular-nums", ...EASE_150 }}>
                    <text x="24" y="40" fill={INK} opacity={opacity("__structure")}>
                        time (h)
                    </text>
                    <text x={PLOT_RIGHT} y="40" textAnchor="end" fill={ACCENT} opacity={opacity("current")}>
                        {`distance k = ${formatDistance(constant)}`}
                    </text>
                    <text x={PLOT_RIGHT} y="58" textAnchor="end" fill={INK} opacity={opacity("current")}>
                        {`60 km/h × ${formatTime(handleTime)} = ${formatDistance(constant)}`}
                    </text>
                </g>

                {/* Ambient structure: grid, axes, ticks. */}
                <g opacity={opacity("__structure")} style={EASE_150}>
                    {[0, 2, 4, 6].map((time) => (
                        <g key={`time-${time}`}>
                            <line
                                x1={PLOT_LEFT}
                                y1={timeToPx(time)}
                                x2={PLOT_RIGHT}
                                y2={timeToPx(time)}
                                stroke={GRID}
                                strokeWidth="1.5"
                            />
                            <text x={PLOT_LEFT - 8} y={timeToPx(time) + 4} textAnchor="end" fontSize="11" fill={INK_STRUCTURE}>
                                {time}
                            </text>
                        </g>
                    ))}
                    {[20, 40, 60, 80, 100, 120].map((speed) => (
                        <text
                            key={`speed-${speed}`}
                            x={speedToPx(speed)}
                            y={PLOT_BOTTOM + 20}
                            textAnchor="middle"
                            fontSize="11"
                            fill={INK_STRUCTURE}
                        >
                            {speed}
                        </text>
                    ))}
                    <line x1={PLOT_LEFT} y1={PLOT_BOTTOM} x2={PLOT_RIGHT} y2={PLOT_BOTTOM} stroke={INK_QUIET} strokeWidth="1.5" />
                    <line x1={PLOT_LEFT} y1={PLOT_TOP} x2={PLOT_LEFT} y2={PLOT_BOTTOM} stroke={INK_QUIET} strokeWidth="1.5" />
                    <text
                        x={(PLOT_LEFT + PLOT_RIGHT) / 2}
                        y={PLOT_BOTTOM + 44}
                        textAnchor="middle"
                        fontSize="12"
                        fill={INK}
                    >
                        speed (km/h)
                    </text>
                </g>

                {/* GHOSTS — every stop the curve has already left behind. */}
                <g {...hoverProps("ghosts")} opacity={opacity("ghosts")} style={EASE_150}>
                    <Halo active={isActive("ghosts")}>
                        {ghosts.map((ghost) => (
                            <path
                                key={`ghost-halo-${ghost}`}
                                d={curvePath(ghost)}
                                fill="none"
                                stroke={INK_STRUCTURE}
                                strokeWidth={weight("ghosts", 1.5) + 6}
                                strokeLinecap="round"
                            />
                        ))}
                    </Halo>
                    {ghosts.map((ghost) => (
                        <path
                            key={`ghost-${ghost}`}
                            d={curvePath(ghost)}
                            fill="none"
                            stroke={INK_QUIET}
                            strokeWidth={weight("ghosts", 1.5)}
                            strokeLinecap="round"
                        />
                    ))}
                </g>

                {/* THE CURRENT CURVE — the one accent, the heaviest stroke. */}
                <g {...hoverProps("current")} opacity={opacity("current")} style={EASE_150}>
                    <Halo active={isActive("current")}>
                        <path
                            d={curvePath(constant)}
                            fill="none"
                            stroke={ACCENT}
                            strokeWidth={weight("current", 3) + 6}
                            strokeLinecap="round"
                        />
                    </Halo>
                    <path
                        d={curvePath(constant)}
                        fill="none"
                        stroke={ACCENT}
                        strokeWidth={weight("current", 3)}
                        strokeLinecap="round"
                    />
                    <line
                        x1={handleX}
                        y1={PLOT_BOTTOM}
                        x2={handleX}
                        y2={handleY}
                        stroke={ACCENT}
                        strokeWidth="1.5"
                        strokeDasharray="3 4"
                        opacity={0.6}
                    />
                </g>

                {/* The draggable handle, riding the curve at 60 km/h. */}
                <g transform={`translate(${handleX} ${handleY}) scale(${handleScale})`}>
                    <circle r="9" fill={ACCENT} filter="url(#family-curves-shadow)" />
                </g>
                <circle
                    cx={handleX}
                    cy={handleY}
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
                    varName="inverseConstant"
                    label="Distance of the drive"
                    {...numberPropsFromDefinition(getVariableInfo("inverseConstant"))}
                    formatValue={formatDistance}
                />
            </div>
        </>
    );
}

function FamilyOfCurvesFigure() {
    const setVar = useSetVar();
    // The ghost trail lives in the shell so the reset control can clear it.
    const [ghosts, setGhosts] = useState<number[]>([]);
    const rememberVisited = useCallback((visited: number) => {
        setGhosts((trail) => (trail.includes(visited) ? trail : [...trail, visited].slice(-8)));
    }, []);

    return (
        <Figure
            id="family-of-curves"
            onReset={() => {
                setGhosts([]);
                setVar("inverseConstant", K_DEFAULT);
            }}
            caption="Travel time against speed for one fixed distance. Drag the teal handle up, away from the corner, and each distance it passes stays behind as a faded grey curve."
        >
            <FamilyOfCurvesDrawing ghosts={ghosts} onVisit={rememberVisited} />
            <InteractionHintSequence
                hintKey="family-of-curves-drag"
                steps={[
                    {
                        gesture: "drag-vertical",
                        label: "Drag the teal handle up, away from the corner",
                        position: { x: "48%", y: "55%" },
                        dragPath: { type: "line", startOffset: { x: 0, y: 22 }, endOffset: { x: 0, y: -22 } },
                    },
                ]}
            />
        </Figure>
    );
}

/** Derived readout: the time the drive takes at a steady 60 km/h. */
function DriveTimeAtSixty() {
    const constant = useVar<number>("inverseConstant", K_DEFAULT);
    return <span style={{ fontVariantNumeric: "tabular-nums" }}>{(constant / HANDLE_SPEED).toFixed(1)}</span>;
}

export const inverseConstantBlocks: ReactElement[] = [
    <StackLayout key="layout-constant-heading" maxWidth="xl">
        <Block id="constant-heading" padding="md">
            <EditableH2 id="h2-constant-heading" blockId="constant-heading">
                The Constant Behind y = k/x
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-constant-product" maxWidth="xl">
        <Block id="constant-product" padding="sm">
            <EditableParagraph id="para-constant-product" blockId="constant-product">
                Back to that drive. Multiply speed by time: 40 &times; 3 = 120, and 60 &times; 2 = 120.
                Whichever pair you pick, the answer is the same.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-constant-formula" maxWidth="xl">
        <Block id="constant-formula" padding="lg">
            <FormulaBlock latex="x \times y = k \qquad \Longrightarrow \qquad y = \frac{k}{x}" />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-constant-naming" maxWidth="xl">
        <Block id="constant-naming" padding="sm">
            <EditableParagraph id="para-constant-naming" blockId="constant-naming">
                That repeated number has a name: the constant, k. Rearranged, it gives y = k/x, an
                inverse relationship. Pull the teal handle up, away from the corner, and every stop
                you pass leaves a faded grey curve behind.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-constant-visual" maxWidth="xl">
        <Block id="constant-visual" padding="sm" hasVisualization>
            <FamilyOfCurvesFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-constant-different-journey" maxWidth="xl">
        <Block id="constant-different-journey" padding="sm">
            <EditableParagraph id="para-constant-different-journey" blockId="constant-different-journey">
                The shape never changed, only its distance from the corner. With the drive set at{" "}
                <InlineScrubbleNumber
                    varName="inverseConstant"
                    {...numberPropsFromDefinition(getVariableInfo("inverseConstant"))}
                />
                {" "}km, a steady 60 km/h gets you there in <DriveTimeAtSixty /> hours, and the{" "}
                <InlineLinkedHighlight
                    varName="inverseCurveHighlight"
                    highlightId="current"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("inverseCurveHighlight"))}
                >
                    curve you are holding
                </InlineLinkedHighlight>
                {" "}sits further out than every{" "}
                <InlineLinkedHighlight
                    varName="inverseCurveHighlight"
                    highlightId="ghosts"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("inverseGhostHighlight"))}
                >
                    faded curve
                </InlineLinkedHighlight>
                {" "}behind it. It never straightens, and it never quite touches either axis.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-block-1787814737319" maxWidth="xl">
        <Block id="block-1787814737319" padding="sm">
            <EditableParagraph id="para-block-1787814737319" blockId="block-1787814737319">
                A straight line keeps one steepness the whole way along. This shape does not: it
                plunges near the left, then eases off almost flat, and that changing steepness is
                what makes it a{" "}
                <InlineTooltip
                    id="tooltip-curve-definition"
                    tooltip="A graph whose steepness keeps changing, so no part of it is ever straight."
                >
                    curve
                </InlineTooltip>
                . This particular one is a{" "}
                <InlineTooltip
                    id="tooltip-hyperbola-definition"
                    tooltip="The curve you get from y = k/x. It sweeps towards both axes forever without ever touching either one."
                >
                    hyperbola
                </InlineTooltip>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StepLayout key="layout-constant-question-product" showProgress={false}>
        <Step completionVarName="answer_constant_operation" autoAdvance>
            <Block id="constant-question-operation" padding="md">
                <EditableParagraph id="para-constant-question-operation" blockId="constant-question-operation">
                    A cyclist rides at a steady 15 km/h for 4 hours. To find the constant of that
                    ride, the calculation you need is{" "}
                    <InlineFeedback
                        varName="answer_constant_operation"
                        correctValue="15 × 4"
                        position="terminal"
                        successMessage="— yes, the constant of an inverse pair is always the two values multiplied"
                        failureMessage="— not that one."
                        hint="Speed and time multiply back to the distance, they are not divided"
                    >
                        <InlineClozeChoice
                            varName="answer_constant_operation"
                            correctAnswer="15 × 4"
                            options={["15 × 4", "15 ÷ 4", "4 ÷ 15", "15 + 4"]}
                            {...choicePropsFromDefinition(getVariableInfo("answer_constant_operation"))}
                        />
                    </InlineFeedback>
                    .
                </EditableParagraph>
            </Block>
        </Step>

        <Step completionVarName="answer_constant_product" autoAdvance>
            <Block id="constant-question-product" padding="md">
                <EditableParagraph id="para-constant-question-product" blockId="constant-question-product">
                    Carry it out. The constant for that ride, the distance covered, is{" "}
                    <InlineFeedback
                        varName="answer_constant_product"
                        correctValue={["60", "60 km"]}
                        position="terminal"
                        successMessage="— exactly, 15 × 4 = 60, so every speed and time on that ride multiplies back to 60"
                        failureMessage="— not quite."
                        hint="Fifteen kilometres every hour, for four hours"
                    >
                        <InlineClozeInput
                            varName="answer_constant_product"
                            correctAnswer={["60", "60 km"]}
                            {...clozePropsFromDefinition(getVariableInfo("answer_constant_product"))}
                        />
                    </InlineFeedback>
                    {" "}km.
                </EditableParagraph>
            </Block>
        </Step>

        <Step>
            <Block id="constant-question-time" padding="md">
                <EditableParagraph id="para-constant-question-time" blockId="constant-question-time">
                    Now put that constant to work. Riding the same 60 km route at 20 km/h would take{" "}
                    <InlineFeedback
                        varName="answer_constant_time"
                        correctValue={["3", "3 h", "3 hours"]}
                        position="terminal"
                        successMessage="— right, 20 × 3 = 60, the same constant reached from the other direction"
                        failureMessage="— almost."
                        hint="You need the time that turns 20 into 60 when you multiply"
                        visualizationHint={{
                            blockId: "constant-visual",
                            hintKey: "constant-visual-find-sixty",
                            label: "Discover it yourself",
                            resetVars: { inverseConstant: 120 },
                            steps: [
                                {
                                    gesture: "drag-vertical",
                                    label: "Drag the teal handle down until the distance reads 60 km, then follow the curve left to 20 km/h",
                                    position: { x: "48%", y: "55%" },
                                    dragPath: { type: "line", startOffset: { x: 0, y: -20 }, endOffset: { x: 0, y: 20 } },
                                    completionVar: "inverseConstant",
                                    completionValue: 60,
                                    completionTolerance: 15,
                                },
                            ],
                        }}
                    >
                        <InlineClozeInput
                            varName="answer_constant_time"
                            correctAnswer={["3", "3 h", "3 hours"]}
                            {...clozePropsFromDefinition(getVariableInfo("answer_constant_time"))}
                        />
                    </InlineFeedback>
                    {" "}hours.
                </EditableParagraph>
            </Block>
        </Step>
    </StepLayout>,

];
