import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { VisualOptionCards } from "@/components/organisms";

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
                Back to that drive. Multiply the speed by the time: 40 &times; 3 = 120, and
                60 &times; 2 = 120. Whichever pair you pick, the answer lands on the same number.
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
                That repeated number has a name: the constant, k. Rearranged, it gives
                y = k/x, an inverse relationship. So what happens to everything else when k
                itself changes?
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-constant-visual" maxWidth="xl">
        <Block id="constant-visual">
            <VisualOptionCards
                blockId="constant-visual"
                cards={[
                    {
                        id: "rectangle-under-the-curve",
                        title: "A curve whose two sides always multiply to the same number",
                        looks: "Imagine a grid with a smooth curve sweeping down from the top left and flattening out towards the right. One teal dot sits on the curve, and two thin lines drop from it to the axes, marking out a shaded rectangle underneath with its area printed inside.",
                        manipulate: "Slide the teal dot along the curve and watch the rectangle stretch tall and thin, then long and low",
                        reveals: "The rectangle keeps exactly the same area wherever the dot sits, and that area is the constant k.",
                        paradigm: "conventional",
                        recommended: true,
                    },
                    {
                        id: "build-the-curve",
                        title: "An empty grid that grows its own curve as points are placed",
                        looks: "Imagine a blank grid with the number 120 written above it and a small pile of number pairs waiting at the side. Each pair dropped onto the grid leaves a dot, and once a few dots are down, a smooth curve threads itself through the ones that belong there.",
                        manipulate: "Drag pairs of numbers onto the grid, aiming for pairs whose two values multiply to 120",
                        reveals: "Only pairs with the same product sit on one curve, so the constant is what holds the whole curve together.",
                        paradigm: "constructivist",
                    },
                    {
                        id: "family-of-curves",
                        title: "A family of curves, each one left behind as the constant grows",
                        looks: "Imagine one curve on a grid with a small handle on its shoulder. As the handle is pulled outwards the curve slides away from the corner, and every position it passed through stays behind as a faint grey ghost, so a whole fan of curves builds up.",
                        manipulate: "Pull the curve outwards by its handle, one step at a time, leaving a ghost at each stop",
                        reveals: "A bigger constant pushes the whole curve further from the corner without ever changing its swooping shape.",
                        paradigm: "temporal",
                    },
                ]}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-constant-different-journey" maxWidth="xl">
        <Block id="constant-different-journey" padding="sm">
            <EditableParagraph id="para-constant-different-journey" blockId="constant-different-journey">
                Change k and you are describing a different journey. Make it 240 and every travel
                time doubles, but speed and time still trade off against each other in exactly the
                same way.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
