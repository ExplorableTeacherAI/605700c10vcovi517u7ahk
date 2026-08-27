import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";
import { VisualOptionCards } from "@/components/organisms";

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
                Here is where inverse relationships catch people out. Keeping k at 120: when x is 4,
                y is 30, because 4 &times; 30 = 120. Now double x to 8, and y is not 28.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-doubling-visual" maxWidth="xl">
        <Block id="doubling-visual">
            <VisualOptionCards
                blockId="doubling-visual"
                cards={[
                    {
                        id: "place-the-ghost-dot",
                        title: "A curve with a faint dot waiting to be placed where x has doubled",
                        looks: "Imagine the curve on a grid with one solid teal dot sitting at x = 4, and a faint hollow dot that can be picked up and moved. A dashed vertical line stands at x = 8, waiting for the faint dot to be dropped somewhere along it.",
                        manipulate: "Place the faint dot on the dashed line where they think the curve will be once x has doubled",
                        reveals: "y halves rather than dropping by two, because the pair still has to multiply back to the same constant.",
                        targetsMisconception: "Students think that when x doubles, y goes down by 2 instead of halving",
                        paradigm: "prediction",
                        recommended: true,
                    },
                    {
                        id: "two-blocks-same-area",
                        title: "Two shaded blocks, one twice as wide as the other but the same size overall",
                        looks: "Imagine two rectangles standing side by side on a grid, shaded the same teal. One is narrow and tall, the other wide and low, and above each one its width, its height and their product are printed in a row.",
                        manipulate: "Stretch either rectangle sideways by its edge and watch its height shrink to keep the product unchanged",
                        reveals: "Doubling one side always halves the other, because the amount of shading is not allowed to change.",
                        targetsMisconception: "Students think that when x doubles, y goes down by 2 instead of halving",
                        paradigm: "comparison",
                    },
                    {
                        id: "chain-of-doublings",
                        title: "A chain of dots down the curve, each one twice as far right as the last",
                        looks: "Imagine the curve with four dots strung along it, each sitting at double the x of the one before. Between neighbouring dots a small bracket reports the fall in y two ways at once: as a subtraction and as a fraction.",
                        manipulate: "Drag the first dot to a new starting place and watch the whole chain of doublings rebuild itself",
                        reveals: "The subtraction is different at every step, but the fraction is always one half, wherever the chain begins.",
                        paradigm: "conventional",
                    },
                ]}
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-doubling-halving-rule" maxWidth="xl">
        <Block id="doubling-halving-rule" padding="sm">
            <EditableParagraph id="para-doubling-halving-rule" blockId="doubling-halving-rule">
                Halving, not subtracting. Since x and y must multiply back to 120, whatever you do to
                one, the other has to undo. Triple x and y drops to a third of what it was.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
