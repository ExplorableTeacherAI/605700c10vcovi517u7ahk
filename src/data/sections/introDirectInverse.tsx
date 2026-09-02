import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH1,
    EditableParagraph,
    InlineSpotColor,
    InlineTooltip,
} from "@/components/atoms";
import { getVariableInfo, spotColorPropsFromDefinition } from "../variables";

// Colour identities used from here to the end of the lesson:
// indigo = x (speed), violet = y (time), teal = k (the distance that never moves).
const xProps = spotColorPropsFromDefinition(getVariableInfo("quantityX"));
const yProps = spotColorPropsFromDefinition(getVariableInfo("quantityY"));
const kProps = spotColorPropsFromDefinition(getVariableInfo("quantityConstant"));

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
                Imagine driving{" "}
                <InlineSpotColor varName="quantityConstant" {...kProps}>120 km</InlineSpotColor>
                {" "}to a friend&rsquo;s house. At{" "}
                <InlineSpotColor varName="quantityX" {...xProps}>40 km/h</InlineSpotColor>
                {" "}the trip takes{" "}
                <InlineSpotColor varName="quantityY" {...yProps}>3 hours</InlineSpotColor>
                ; at{" "}
                <InlineSpotColor varName="quantityX" {...xProps}>60 km/h</InlineSpotColor>
                {" "}it takes{" "}
                <InlineSpotColor varName="quantityY" {...yProps}>2</InlineSpotColor>
                . Speed went up, time came down, and the{" "}
                <InlineSpotColor varName="quantityConstant" {...kProps}>120 km</InlineSpotColor>
                {" "}never moved.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-promise" maxWidth="xl">
        <Block id="intro-promise" padding="sm">
            <EditableParagraph id="para-intro-promise" blockId="intro-promise">
                That fixed 120 is the quiet part of the story, and it is what makes speed and time
                behave as they do. Other pairs of{" "}
                <InlineTooltip
                    id="tooltip-quantity-definition"
                    tooltip="Anything you can measure with a number, such as a speed, a time, a distance or a price."
                >
                    quantities
                </InlineTooltip>
                {" "}do the opposite: one goes up and the other climbs right along with it. By the end
                you will be able to tell the two patterns apart, using nothing more than a formula you
                can put numbers into.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
