import { TooltipClasses } from "./tooltipClasses";
import { PopperPlacementType } from "@suid/base/PopperUnstyled";
import { TransitionProps } from "@suid/base/Transition";
import { PopperProps } from "@suid/material/Popper";
import { Theme } from "@suid/material/styles";
import { SxProps } from "@suid/system";
import { ElementType } from "@suid/types";
import { Component, ComponentProps, JSXElement } from "solid-js";

export interface TooltipPropsVariantOverrides {}

export interface TooltipTypeMap<P = {}, D extends ElementType = "div"> {
  name: "MuiTooltip";
  defaultPropNames: "arrow";
  selfProps: {
    /**
     * If `true`, adds an arrow to the tooltip.
     * @default false
     */
    arrow?: boolean;
    /**
     * Tooltip reference element.
     */
    children: JSXElement;
    /**
     * Override or extend the styles applied to the component.
     */
    classes?: Partial<TooltipClasses>;
    /**
     * The components used for each slot inside.
     *
     * This prop is an alias for the `slots` prop.
     * It's recommended to use the `slots` prop instead.
     *
     * @default {}
     */
    components?: Partial<{
      Popper: Component<PopperProps>;
      Transition: ElementType;
      Tooltip: ElementType;
      Arrow: ElementType;
    }>;
    /**
     * The extra props for the slot components.
     * You can override the existing props or add new ones.
     *
     * This prop is an alias for the `slotProps` prop.
     * It's recommended to use the `slotProps` prop instead, as `componentsProps` will be deprecated in the future.
     *
     * @default {}
     */
    componentsProps?: Partial<{
      popper: Partial<PopperProps>;
      transition: TransitionProps;
      tooltip: ComponentProps<"div">;
      arrow: ComponentProps<"div">;
    }>;
    describeChild?: boolean;
    /**
     * Do not respond to focus-visible events.
     * @default false
     */
    disableFocusListener?: boolean;
    /**
     * Do not respond to hover events.
     * @default false
     */
    disableHoverListener?: boolean;
    /**
     * Makes a tooltip not interactive, i.e. it will close when the user
     * hovers over the tooltip before the `leaveDelay` is expired.
     * @default false
     */
    disableInteractive?: boolean;
    /**
     * Do not respond to long press touch events.
     * @default false
     */
    disableTouchListener?: boolean;
    /**
     * The number of milliseconds to wait before showing the tooltip.
     * This prop won't impact the enter touch delay (`enterTouchDelay`).
     * @default 100
     */
    enterDelay?: number;
    /**
     * The number of milliseconds to wait before showing the tooltip when one was already recently opened.
     * @default 0
     */
    enterNextDelay?: number;
    /**
     * The number of milliseconds a user must touch the element before showing the tooltip.
     * @default 700
     */
    enterTouchDelay?: number;
    /**
     * If `true`, the tooltip follow the cursor over the wrapped element.
     * @default false
     */
    followCursor?: boolean;
    /**
     * This prop is used to help implement the accessibility logic.
     * If you don't provide this prop. It falls back to a randomly generated id.
     */
    id?: string;
    /**
     * The number of milliseconds to wait before hiding the tooltip.
     * This prop won't impact the leave touch delay (`leaveTouchDelay`).
     * @default 0
     */
    leaveDelay?: number;
    /**
     * The number of milliseconds after the user stops touching an element before hiding the tooltip.
     * @default 1500
     */
    leaveTouchDelay?: number;
    /**
     * Callback fired when the component requests to be closed.
     *
     * @param {object} event The event source of the callback.
     */
    onClose?: (event: Event) => void;
    /**
     * Callback fired when the component requests to be open.
     *
     * @param {object} event The event source of the callback.
     */
    onOpen?: (event: Event) => void;
    /**
     * If `true`, the component is shown.
     */
    open?: boolean;
    /**
     * Tooltip placement.
     * @default 'bottom'
     */
    placement?: PopperPlacementType;
    /**
     * The component used for the popper.
     * @default Popper
     */
    PopperComponent?: Component<PopperProps>;
    /**
     * Props applied to the [`Popper`](/api/popper/) element.
     * @default {}
     */
    PopperProps?: Partial<PopperProps>;
    /**
     * The system prop that allows defining system overrides as well as additional CSS styles.
     */
    sx?: SxProps<Theme>;
    /**
     * Tooltip title. Zero-length titles string are never displayed.
     */
    title: JSXElement;
    /**
     * The component used for the transition.
     * [Follow this guide](/components/transitions/#transitioncomponent-prop) to learn more about the requirements for this component.
     * @default Grow
     */
    TransitionComponent?: Component<TransitionProps & { children: JSXElement }>;
    /**
     * Props applied to the transition element.
     * By default, the element is based on this [`Transition`](http://reactcommunity.org/react-transition-group/transition/) component.
     */
    TransitionProps?: TransitionProps;
  };
  props: P & TooltipTypeMap["selfProps"];
  defaultComponent: D;
}
