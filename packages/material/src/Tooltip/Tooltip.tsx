import Grow from "../Grow";
import Popper from "../Popper";
import useControlled from "../utils/useControlled";
import { TooltipTypeMap } from "./TooltipProps";
import tooltipClasses, { getTooltipUtilityClass } from "./tooltipClasses";
import { resolveFirst } from "@solid-primitives/refs";
import {
  PopperPlacementType,
  TransitionProps,
} from "@suid/base/PopperUnstyled";
import createComponentFactory from "@suid/base/createComponentFactory";
import appendOwnerState from "@suid/base/utils/appendOwnerState";
import { alpha } from "@suid/system";
import styled from "@suid/system/styled";
import useTheme from "@suid/system/useTheme";
import { PropsOf } from "@suid/types";
import { useIsFocusVisible } from "@suid/utils";
import capitalize from "@suid/utils/capitalize";
import clsx from "clsx";
import {
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  mergeProps,
  Show,
} from "solid-js";
import { Dynamic } from "solid-js/web";

type RequireProperty<T, K extends keyof T> = T & Required<Pick<T, K>>;

type OwnerState = RequireProperty<PropsOf<TooltipTypeMap>, "placement"> & {
  touch: boolean;
  isRtl: boolean;
  open: boolean;
};

function round(value: number) {
  return Math.round(value * 1e5) / 1e5;
}

const $ = createComponentFactory<TooltipTypeMap, OwnerState>()({
  name: "MuiTooltip",
  selfPropNames: [],
  utilityClass: getTooltipUtilityClass,
  slotClasses: (ownerState) => ({
    root: ["root"],
    popper: [
      "popper",
      !ownerState.disableInteractive && "popperInteractive",
      ownerState.arrow && "popperArrow",
    ],
    tooltip: [
      "tooltip",
      ownerState.arrow && "tooltipArrow",
      ownerState.touch && "touch",
      `tooltipPlacement${capitalize(ownerState.placement.split("-")[0])}`,
    ],
    arrow: ["arrow"],
  }),
});

const TooltipPopper = styled(Popper, {
  name: "MuiTooltip",
  slot: "Popper",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.popper,
      !ownerState.disableInteractive && styles.popperInteractive,
      ownerState.arrow && styles.popperArrow,
      !ownerState.open && styles.popperClose,
    ];
  },
})<OwnerState>(({ theme, ownerState }) => ({
  zIndex: theme.zIndex.tooltip,
  pointerEvents: "none", // disable jss-rtl plugin
  ...(!ownerState.disableInteractive && {
    pointerEvents: "auto",
  }),
  ...(!ownerState.open && {
    pointerEvents: "none",
  }),
  ...(ownerState.arrow && {
    [`&[data-popper-placement*="bottom"] .${tooltipClasses.arrow}`]: {
      top: 0,
      marginTop: "-0.71em",
      "&::before": {
        transformOrigin: "0 100%",
      },
    },
    [`&[data-popper-placement*="top"] .${tooltipClasses.arrow}`]: {
      bottom: 0,
      marginBottom: "-0.71em",
      "&::before": {
        transformOrigin: "100% 0",
      },
    },
    [`&[data-popper-placement*="right"] .${tooltipClasses.arrow}`]: {
      ...(!ownerState.isRtl
        ? {
            left: 0,
            marginLeft: "-0.71em",
          }
        : {
            right: 0,
            marginRight: "-0.71em",
          }),
      height: "1em",
      width: "0.71em",
      "&::before": {
        transformOrigin: "100% 100%",
      },
    },
    [`&[data-popper-placement*="left"] .${tooltipClasses.arrow}`]: {
      ...(!ownerState.isRtl
        ? { right: 0, marginRight: "-0.71em" }
        : { left: 0, marginLeft: "-0.71em" }),
      height: "1em",
      width: "0.71em",
      "&::before": {
        transformOrigin: "0 0",
      },
    },
  }),
}));

const TooltipTooltip = styled("div", {
  name: "MuiTooltip",
  slot: "Tooltip",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.tooltip,
      ownerState.touch && styles.touch,
      ownerState.arrow && styles.tooltipArrow,
      styles[
        `tooltipPlacement${capitalize(ownerState.placement.split("-")[0])}`
      ],
    ];
  },
})<OwnerState>(({ theme, ownerState }) => ({
  backgroundColor: alpha(theme.palette.grey[700], 0.92),
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.common.white,
  fontFamily: theme.typography.fontFamily,
  padding: "4px 8px",
  fontSize: theme.typography.pxToRem(11),
  maxWidth: 300,
  margin: 2,
  wordWrap: "break-word",
  fontWeight: theme.typography.fontWeightMedium,
  ...(ownerState.arrow && {
    position: "relative",
    margin: 0,
  }),
  ...(ownerState.touch && {
    padding: "8px 16px",
    fontSize: theme.typography.pxToRem(14),
    lineHeight: `${round(16 / 14)}em`,
    fontWeight: theme.typography.fontWeightRegular,
  }),
  [`.${tooltipClasses.popper}[data-popper-placement*="left"] &`]: {
    transformOrigin: "right center",
    ...(!ownerState.isRtl
      ? {
          marginRight: "14px",
          ...(ownerState.touch && {
            marginRight: "24px",
          }),
        }
      : {
          marginLeft: "14px",
          ...(ownerState.touch && {
            marginLeft: "24px",
          }),
        }),
  },
  [`.${tooltipClasses.popper}[data-popper-placement*="right"] &`]: {
    transformOrigin: "left center",
    ...(!ownerState.isRtl
      ? {
          marginLeft: "14px",
          ...(ownerState.touch && {
            marginLeft: "24px",
          }),
        }
      : {
          marginRight: "14px",
          ...(ownerState.touch && {
            marginRight: "24px",
          }),
        }),
  },
  [`.${tooltipClasses.popper}[data-popper-placement*="top"] &`]: {
    transformOrigin: "center bottom",
    marginBottom: "14px",
    ...(ownerState.touch && {
      marginBottom: "24px",
    }),
  },
  [`.${tooltipClasses.popper}[data-popper-placement*="bottom"] &`]: {
    transformOrigin: "center top",
    marginTop: "14px",
    ...(ownerState.touch && {
      marginTop: "24px",
    }),
  },
}));

const TooltipArrow = styled("span", {
  name: "MuiTooltip",
  slot: "Arrow",
  overridesResolver: (props, styles) => styles.arrow,
})(({ theme }) => ({
  overflow: "hidden",
  position: "absolute",
  width: "1em",
  height: "0.71em" /* = width / sqrt(2) = (length of the hypotenuse) */,
  boxSizing: "border-box",
  color: alpha(theme.palette.grey[700], 0.9),
  "&::before": {
    content: '""',
    margin: "auto",
    display: "block",
    width: "100%",
    height: "100%",
    backgroundColor: "currentColor",
    transform: "rotate(45deg)",
  },
}));

let hystersisOpen = false;
let hystersisTimer: NodeJS.Timeout | undefined;

// TODO v6: Remove PopperComponent, PopperProps, TransitionComponent and TransitionProps.
const Tooltip = $.defineComponent(function Tooltip(inProps) {
  const props = $.useThemeProps({ props: inProps });

  const baseProps = mergeProps(
    {
      arrow: false,
      components: {} as { [K in any]?: never },
      componentsProps: {} as { [K in any]?: never },
      describeChild: false,
      disableFocusListener: false,
      disableHoverListener: false,
      disableInteractive: false,
      disableTouchListener: false,
      enterDelay: 100,
      enterNextDelay: 0,
      enterTouchDelay: 700,
      followCursor: false,
      leaveDelay: 0,
      leaveTouchDelay: 1500,
      placement: "bottom" as PopperPlacementType,
      PopperProps: {} as { [K in any]?: never },
      TransitionComponent: Grow,
    },
    props
  );

  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  const [arrowRef, setArrowRef] = createSignal<HTMLSpanElement>();
  let ignoreNonTouchEvents = false;

  const disableInteractive = () =>
    baseProps.disableInteractive || baseProps.followCursor;

  let closeTimer: NodeJS.Timeout | undefined;
  let enterTimer: NodeJS.Timeout | undefined;
  let leaveTimer: NodeJS.Timeout | undefined;
  let touchTimer: NodeJS.Timeout | undefined;

  const childNode = resolveFirst(() => baseProps.children);
  console.log(childNode());
  const [openState, setOpenState] = useControlled({
    controlled: () => baseProps.open,
    default: () => false,
    name: "Tooltip",
    state: "open",
  });

  // Cannot perform this check in solidjs
  /*if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { current: isControlled } = createRef(openProp !== undefined);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      createEffect(() => {
        if (
          childNode &&
          childNode.disabled &&
          !isControlled &&
          title !== "" &&
          childNode.tagName.toLowerCase() === "button"
        ) {
          console.error(
            [
              "MUI: You are providing a disabled `button` child to the Tooltip component.",
              "A disabled element does not fire events.",
              "Tooltip needs to listen to the child element's events to display the title.",
              "",
              "Add a simple wrapper element, such as a `span`.",
            ].join("\n"),
          );
        }
      }, [title, childNode, isControlled]);
    } */
  const id = createMemo(() => baseProps.id ?? createUniqueId());

  let prevUserSelect: string | undefined;
  const stopTouchInteraction = () => {
    if (prevUserSelect !== undefined) {
      document.body.style.userSelect = prevUserSelect;
      prevUserSelect = undefined;
    }
    clearTimeout(touchTimer);
  };

  createEffect(() => {
    return () => {
      clearTimeout(closeTimer);
      clearTimeout(enterTimer);
      clearTimeout(leaveTimer);
      stopTouchInteraction();
    };
  }, [stopTouchInteraction]);

  const handleOpen = (event: any) => {
    clearTimeout(hystersisTimer);
    hystersisOpen = true;

    // The mouseover event will trigger for every nested element in the tooltip.
    // We can skip rerendering when the tooltip is already open.
    // We are using the mouseover event instead of the mouseenter event to fix a hide/show issue.
    setOpenState(true);

    if (!open) baseProps.onOpen?.(event);
  };

  const handleClose = (event: any) => {
    clearTimeout(hystersisTimer);
    hystersisTimer = setTimeout(() => {
      hystersisOpen = false;
    }, 800 + baseProps.leaveDelay);
    setOpenState(false);

    if (baseProps.onClose && openState()) {
      baseProps.onClose(event);
    }

    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => {
      ignoreNonTouchEvents = false;
    }, theme.transitions.duration.shortest);
  };

  const handleEnter = (event: any) => {
    if (ignoreNonTouchEvents && event.type !== "touchstart") {
      return;
    }

    // Remove the title ahead of time.
    // We don't want to wait for the next render commit.
    // We would risk displaying two tooltips at the same time (native + this one).
    // if (childNode) {
    //   childNode.removeAttribute("title");
    // }

    clearTimeout(enterTimer);
    clearTimeout(leaveTimer);
    if (baseProps.enterDelay || (hystersisOpen && baseProps.enterNextDelay)) {
      enterTimer = setTimeout(
        () => {
          handleOpen(event);
        },
        hystersisOpen ? baseProps.enterNextDelay : baseProps.enterDelay
      );
    } else {
      handleOpen(event);
    }
  };

  const handleLeave = (event: any) => {
    clearTimeout(enterTimer);
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => {
      handleClose(event);
    }, baseProps.leaveDelay);
  };

  const {
    isFocusVisibleRef,
    onBlur: handleBlurVisible,
    onFocus: handleFocusVisible,
    // ref: focusVisibleRef,
  } = useIsFocusVisible();
  // We don't necessarily care about the focusVisible state (which is safe to access via ref anyway).
  // We just need to re-render the Tooltip if the focus-visible state changes.
  const [, setChildIsFocusVisible] = createSignal(false);
  const handleBlur = (event: any) => {
    handleBlurVisible(event);
    if (!isFocusVisibleRef.current) {
      setChildIsFocusVisible(false);
      handleLeave(event);
    }
  };

  const handleFocus = (event: any) => {
    handleFocusVisible(event);
    if (isFocusVisibleRef.current) {
      setChildIsFocusVisible(true);
      handleEnter(event);
    }
  };

  const detectTouchStart = () => {
    ignoreNonTouchEvents = true;

    // const childrenProps = children.props;
    // if (childrenProps.onTouchStart) {
    //   childrenProps.onTouchStart(event);
    // }
  };

  const handleMouseOver = handleEnter;
  const handleMouseLeave = handleLeave;

  const handleTouchStart = (event: any) => {
    detectTouchStart();
    clearTimeout(leaveTimer);
    clearTimeout(closeTimer);
    stopTouchInteraction();

    prevUserSelect = document.body.style.userSelect;
    // Prevent iOS text selection on long-tap.
    document.body.style.userSelect = "none";

    touchTimer = setTimeout(() => {
      if (prevUserSelect) document.body.style.userSelect = prevUserSelect;
      handleEnter(event);
    }, baseProps.enterTouchDelay);
  };

  const handleTouchEnd = (event: any) => {
    // if (children.props.onTouchEnd) {
    //   children.props.onTouchEnd(event);
    // }

    stopTouchInteraction();
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(() => {
      handleClose(event);
    }, baseProps.leaveTouchDelay);
  };

  createEffect(() => {
    if (!openState()) {
      return undefined;
    }

    /**
     * @param {KeyboardEvent} nativeEvent
     */
    function handleKeyDown(nativeEvent: any) {
      // IE11, Edge (prior to using Bink?) use 'Esc'
      if (nativeEvent.key === "Escape" || nativeEvent.key === "Esc") {
        handleClose(nativeEvent);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  // const handleUseRef = useForkRef(setChildNode, ref);
  // const handleFocusRef = useForkRef(focusVisibleRef, handleUseRef);
  // const handleRef = useForkRef(children.ref, handleFocusRef);

  // There is no point in displaying an empty tooltip.
  createEffect(() => {
    if (openState() && baseProps.title === "") {
      setOpenState(false);
    }
  });

  const [mousePosition, setMousePosition] = createSignal({ x: 0, y: 0 });

  const handleMouseMove = (event: any) => {
    // const childrenProps = children.props;
    // if (childrenProps.onMouseMove) {
    //   childrenProps.onMouseMove(event);
    // }

    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  createEffect(() => {
    const child = childNode();
    const open = openState();
    const title = baseProps.title;
    if (!child || child instanceof HTMLElement) return;
    if (baseProps.describeChild) {
      if (!open && typeof title === "string" && !baseProps.disableHoverListener)
        child.setAttribute("title", title);
      else child.removeAttribute("title");
      if (open) child.setAttribute("aria-describedby", id());
      else child.removeAttribute("aria-describedby");
    } else {
      if (typeof title === "string") child.setAttribute("aria-label", title);
      else child.removeAttribute("aria-label");
      if (open && typeof title !== "string")
        child.setAttribute("aria-labelledby", id());
      else child.removeAttribute("aria-labelledby");
    }
  });

  // const childrenProps = {
  // ...nameOrDescProps,
  // ...other,
  // ...children.props,
  // className: clsx(other.className, children.props.className),
  // onTouchStart: detectTouchStart,
  // ref: handleRef,
  // ...(followCursor ? { onMouseMove: handleMouseMove } : {}),
  // };

  // Cannot make this check in solidjs
  // if (process.env.NODE_ENV !== "production") {
  //   childrenProps["data-mui-internal-clone-element"] = true;
  //
  //   // eslint-disable-next-line react-hooks/rules-of-hooks
  //   createEffect(() => {
  //     if (childNode && !childNode.getAttribute("data-mui-internal-clone-element")) {
  //       console.error(
  //         [
  //           "MUI: The `children` component of the Tooltip is not forwarding its props correctly.",
  //           "Please make sure that props are spread on the same element that the ref is applied to.",
  //         ].join("\n"),
  //       );
  //     }
  //   }, [childNode]);
  // }

  createEffect(() => {
    const child = childNode();
    if (!child) return;
    if (!baseProps.disableTouchListener) {
      child.addEventListener("touchstart", handleTouchStart);
      child.addEventListener("touchend", handleTouchEnd);
    } else {
      child.removeEventListener("touchstart", handleTouchStart);
      child.removeEventListener("touchend", handleTouchEnd);
    }

    if (!baseProps.disableHoverListener) {
      child.addEventListener("mouseover", handleMouseOver);
      child.addEventListener("mouseleave", handleMouseLeave);
      console.log("mouse event added");
    } else {
      child.removeEventListener("mouseover", handleMouseOver);
      child.removeEventListener("mouseleave", handleMouseLeave);
    }

    if (!baseProps.disableFocusListener) {
      child.addEventListener("onfocus", handleFocus);
      child.addEventListener("onblur", handleBlur);
    } else {
      child.removeEventListener("onfocus", handleFocus);
      child.removeEventListener("onblur", handleBlur);
    }

    if (baseProps.followCursor)
      child.addEventListener("mousemove", handleMouseMove);
    else child.removeEventListener("mousemove", handleMouseMove);
  });

  // Cannot perform this check in solidjs
  // if (process.env.NODE_ENV !== "production") {
  //   if (children.props.title) {
  //     console.error(
  //       [
  //         "MUI: You have provided a `title` prop to the child of <Tooltip />.",
  //         `Remove this title prop \`${children.props.title}\` or the Tooltip component.`,
  //       ].join("\n"),
  //     );
  //   }
  // }

  const popperOptions = createMemo(() => {
    let tooltipModifiers = [
      {
        name: "arrow",
        enabled: Boolean(arrowRef()),
        options: {
          element: arrowRef(),
          padding: 4,
        },
      },
    ];

    if (baseProps.PopperProps.popperOptions?.modifiers) {
      tooltipModifiers = tooltipModifiers.concat(
        baseProps.PopperProps.popperOptions.modifiers
      );
    }

    return {
      ...baseProps.PopperProps.popperOptions,
      modifiers: tooltipModifiers,
    };
  });

  const ownerState: OwnerState = mergeProps(
    {
      isRtl,
      arrow: baseProps.arrow,
      get disableInteractive() {
        return disableInteractive();
      },
      placement: baseProps.placement,
      touch: ignoreNonTouchEvents,
      get open() {
        return Boolean(openState());
      },
    },
    props
  );

  const classes = $.useClasses(ownerState);

  const PopperComponent = () => baseProps.components.Popper ?? TooltipPopper;
  const TransitionComponent = () =>
    baseProps.components.Transition ?? baseProps.TransitionComponent;
  const TooltipComponent = () => baseProps.components.Tooltip ?? TooltipTooltip;
  const ArrowComponent = () => baseProps.components.Arrow ?? TooltipArrow;
  //
  const popperProps = appendOwnerState(
    PopperComponent,
    () => mergeProps(baseProps.PopperProps, baseProps.componentsProps.popper),
    ownerState
  );
  const transitionProps = appendOwnerState(
    TransitionComponent,
    () =>
      mergeProps(
        baseProps.TransitionProps,
        baseProps.componentsProps.transition
      ),
    ownerState
  );
  const tooltipProps = appendOwnerState(
    TooltipComponent,
    () => mergeProps(baseProps.componentsProps.tooltip),
    ownerState
  );
  const tooltipArrowProps = appendOwnerState(
    ArrowComponent,
    () => mergeProps(baseProps.componentsProps.arrow),
    ownerState
  );
  //

  const isOpen = createMemo(() => Boolean(childNode()) && Boolean(openState()));

  return (
    <>
      {childNode()}
      <Dynamic
        placement={baseProps.placement}
        anchorEl={
          baseProps.followCursor
            ? {
                getBoundingClientRect: () => ({
                  top: mousePosition().y,
                  left: mousePosition().x,
                  right: mousePosition().x,
                  bottom: mousePosition().y,
                  width: 0,
                  height: 0,
                  x: mousePosition().x,
                  y: mousePosition().y,
                  toJSON: () => {},
                }),
              }
            : childNode()
        }
        open={isOpen()}
        transition
        id={baseProps.id}
        {...(!baseProps.disableHoverListener &&
          !disableInteractive() && {
            onMouseOver: handleMouseOver,
            onMouseLeave: handleMouseLeave,
          })}
        {...(!baseProps.disableFocusListener &&
          !disableInteractive() && {
            onFocus: handleFocus,
            onBlur: handleBlur,
          })}
        {...popperProps}
        class={clsx(
          classes.popper,
          baseProps.PopperProps?.class,
          baseProps.componentsProps.popper?.class
        )}
        popperOptions={popperOptions()}
        component={PopperComponent()}
      >
        {(innerProps: { TransitionProps?: TransitionProps }) => (
          <Dynamic
            timeout={theme.transitions.duration.shorter}
            {...innerProps.TransitionProps}
            {...transitionProps}
            component={TransitionComponent()}
          >
            <Dynamic
              {...tooltipProps}
              class={clsx(
                classes.tooltip,
                baseProps.componentsProps.tooltip?.class
              )}
              component={TooltipComponent()}
            >
              {baseProps.title}
              <Show when={baseProps.arrow}>
                <Dynamic
                  {...tooltipArrowProps}
                  class={clsx(
                    classes.arrow,
                    baseProps.componentsProps.arrow?.class
                  )}
                  ref={setArrowRef}
                  component={ArrowComponent()}
                />
              </Show>
            </Dynamic>
          </Dynamic>
        )}
      </Dynamic>
    </>
  );
});

export default Tooltip;
