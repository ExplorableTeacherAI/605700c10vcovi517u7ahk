import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import { EditableH1, EditableParagraph } from "@/components/atoms";

export const introDirectInverseBlocks: ReactElement[] = [
    <StackLayout key="layout-intro-title" maxWidth="xl">
        <Block id="intro-title" padding="md">
            <EditableH1 id="h1-intro-title" blockId="intro-title">
                Direct and Inverse Relationships
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-road-trip" maxWidth="xl">
        <Block id="intro-road-trip" padding="sm">
            <EditableParagraph id="para-intro-road-trip" blockId="intro-road-trip">
                Imagine driving 120 km to a friend&rsquo;s house. At 40 km/h the trip takes 3 hours; at
                60 km/h it takes 2. Speed went up, time came down, and the 120 km never moved.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-promise" maxWidth="xl">
        <Block id="intro-promise" padding="sm">
            <EditableParagraph id="para-intro-promise" blockId="intro-promise">
                That fixed 120 is the quiet part of the story, and it is what makes speed and time
                behave as they do. Other pairs of quantities do the opposite: one goes up and the other
                climbs right along with it. By the end you will be able to tell the two patterns apart,
                using nothing more than a formula you can put numbers into.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
