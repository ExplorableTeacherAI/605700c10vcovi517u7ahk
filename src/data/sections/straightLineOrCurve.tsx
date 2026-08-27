import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

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
                Now set the two rules against each other with the same constant. Direct means
                y = kx, so doubling x doubles y as well. Inverse means y = k/x, so doubling x halves
                it instead.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-contrast-visual" maxWidth="xl">
        <Block id="contrast-visual">
            <VisualOptionCards
                blockId="contrast-visual"
                cards={[
                    {
                        id: "line-and-curve-with-table",
                        title: "A rising straight line and a falling curve on one grid, sharing a constant",
                        looks: "Imagine one grid holding both graphs at once: a straight teal line climbing from the corner and an indigo curve dropping away from it. Beside the grid sits a short table that fills in as the graphs are used, with one column for x times y and one for y divided by x.",
                        manipulate: "Drag a dot along each graph and watch the two table columns fill in underneath",
                        reveals: "Only one column ever repeats the same number, and which column it is tells you which relationship you are looking at.",
                        targetsMisconception: "Students call any downward line or curve an inverse relationship",
                        paradigm: "comparison",
                        secondView: {
                            shows: "A table of x times y and y divided by x for whichever point is currently being dragged",
                            role: "constructing",
                            syncedBy: "the shared x position of the dragged dots, plus a hover highlight linking each table column to its graph",
                        },
                        recommended: true,
                    },
                    {
                        id: "three-falling-graphs",
                        title: "Three graphs that all head downwards, only one of them inverse",
                        looks: "Imagine three small grids in a row, each with a teal graph sloping down and a tick box beneath it. The first falls in a dead straight slant, the second bends away from the corner, and the third bends the opposite way.",
                        manipulate: "Tick the grid they believe holds the inverse relationship, then drag a dot along it to test the products",
                        reveals: "Heading downwards is not enough on its own; the test is whether x times y stays put.",
                        targetsMisconception: "Students call any downward line or curve an inverse relationship",
                        paradigm: "prediction",
                    },
                    {
                        id: "shared-crossing-point",
                        title: "A line and a curve that always cross in the same place, whatever the constant",
                        looks: "Imagine a straight line rising from the corner and a curve falling towards the axis, meeting at a single teal dot. That dot can be lifted straight up or pushed down, and both graphs stretch to follow wherever it goes.",
                        manipulate: "Lift the crossing dot up and down and watch both graphs rebuild themselves around it",
                        reveals: "However large the constant grows, the two graphs still meet at x = 1 and disagree everywhere else.",
                        paradigm: "inversion",
                    },
                ]}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-contrast-real-test" maxWidth="xl">
        <Block id="contrast-real-test" padding="sm">
            <EditableParagraph id="para-contrast-real-test" blockId="contrast-real-test">
                One climbs, one falls, and that part is easy. The trap is assuming that anything
                falling must be inverse. The honest test is arithmetic: multiply x by y, and if you
                keep landing on the same number, the relationship is inverse.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
