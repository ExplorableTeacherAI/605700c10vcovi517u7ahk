import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH2, EditableParagraph } from "@/components/atoms";

export const wrappingUpBlocks: ReactElement[] = [
    <StackLayout key="layout-wrapup-heading" maxWidth="xl">
        <Block id="wrapup-heading" padding="md">
            <EditableH2 id="h2-wrapup-heading" blockId="wrapup-heading">
                Wrapping Up
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-one-test" maxWidth="xl">
        <Block id="wrapup-one-test" padding="sm">
            <EditableParagraph id="para-wrapup-one-test" blockId="wrapup-one-test">
                So telling the two apart was never really about which way the graph goes. In a direct
                relationship, y divided by x is the constant. In an inverse one, x multiplied by y is
                the constant, and that is why one quantity rises as the other falls.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-where-next" maxWidth="xl">
        <Block id="wrapup-where-next" padding="sm">
            <EditableParagraph id="para-wrapup-where-next" blockId="wrapup-where-next">
                Back on that 120 km drive, no matter how fast you go, speed times time is always 120,
                and the journey can never take no time at all. One fixed number is doing all the work.
                You will meet it again in the pressure and volume of a gas, in current and resistance,
                and anywhere two quantities trade off while their product holds still.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
