import { type ReactElement } from "react";
import { Block } from "@/components/templates";
import { StackLayout } from "@/components/layouts";
import {
    EditableH2,
    EditableParagraph,
    InlineSpotColor,
    InlineTooltip,
} from "@/components/atoms";
import { FormulaBlock } from "@/components/molecules";
import { getVariableInfo, spotColorPropsFromDefinition } from "../variables";
import { FORMULA_COLORS } from "../lessonColors";

const xProps = spotColorPropsFromDefinition(getVariableInfo("quantityX"));
const yProps = spotColorPropsFromDefinition(getVariableInfo("quantityY"));
const kProps = spotColorPropsFromDefinition(getVariableInfo("quantityConstant"));
const directProps = spotColorPropsFromDefinition(getVariableInfo("quantityDirect"));

export const wrappingUpBlocks: ReactElement[] = [
    <StackLayout key="layout-wrapup-heading" maxWidth="xl">
        <Block id="wrapup-heading" padding="md">
            <EditableH2 id="h2-wrapup-heading" blockId="wrapup-heading">
                Summary: The Ratio and Product Tests
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-one-test" maxWidth="xl">
        <Block id="wrapup-one-test" padding="sm">
            <EditableParagraph id="para-wrapup-one-test" blockId="wrapup-one-test">
                So telling the two apart was never really about which way the graph goes. In a{" "}
                <InlineSpotColor varName="quantityDirect" {...directProps}>direct</InlineSpotColor>
                {" "}relationship,{" "}
                <InlineSpotColor varName="quantityY" {...yProps}>y</InlineSpotColor>
                {" "}divided by{" "}
                <InlineSpotColor varName="quantityX" {...xProps}>x</InlineSpotColor>
                {" "}is the{" "}
                <InlineSpotColor varName="quantityConstant" {...kProps}>constant</InlineSpotColor>
                . In an{" "}
                <InlineTooltip
                    id="tooltip-inverse-definition"
                    tooltip="A relationship where x multiplied by y always lands on the same number, so as one grows the other must shrink."
                >
                    inverse
                </InlineTooltip>
                {" "}one, x multiplied by y is the constant, and that is why one quantity rises as the
                other falls.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-two-tests" maxWidth="xl">
        <Block id="wrapup-two-tests" padding="lg">
            <FormulaBlock
                latex="\clr{direct}{\text{direct}}:\; \frac{\clr{y}{y}}{\clr{x}{x}} = \clr{k}{k} \qquad\qquad \clr{inverse}{\text{inverse}}:\; \clr{x}{x} \times \clr{y}{y} = \clr{k}{k}"
                colorMap={{
                    direct: FORMULA_COLORS.direct,
                    inverse: FORMULA_COLORS.inverse,
                    x: FORMULA_COLORS.x,
                    y: FORMULA_COLORS.y,
                    k: FORMULA_COLORS.k,
                }}
            />
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
