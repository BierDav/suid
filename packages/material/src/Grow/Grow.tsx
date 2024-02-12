import { GrowTypeMap } from ".";
import useTheme from "../styles/useTheme";
import { reflow, getTransitionProps } from "../transitions/utils";
import Transition, { TransitionStatus } from "@suid/base/Transition";
import createComponentFactory from "@suid/base/createComponentFactory";
import StyleProps from "@suid/system/styleProps";
import { children, onCleanup } from "solid-js";

const $ = createComponentFactory<GrowTypeMap>()({
  name: "MuiGrow",
  propDefaults: ({ set }) =>
    set({
      appear: true,
      timeout: "auto",
    }),
  selfPropNames: ["appear", "children", "easing", "in", "ref", "timeout"],
});

function getScale(value: number) {
  return `scale(${value}, ${value ** 2})`;
}

const styles: { [name in TransitionStatus]?: StyleProps } = {
  entering: {
    opacity: 1,
    transform: getScale(1),
  },
  entered: {
    opacity: 1,
    transform: "none",
  },
};

/**
 * The Grow transition is used by the [Tooltip](/components/tooltips/) and
 * [Popover](/components/popover/) components.
 * It uses [react-transition-group](https://github.com/reactjs/react-transition-group) internally.
 */
const Grow = $.component(function Grow({ props, otherProps }) {
  const autoTimeout = { current: undefined as undefined | number };
  const theme = useTheme();
  const resolved = children(
    () => props.children
  ) as unknown as () => HTMLElement;

  let timer: ReturnType<typeof globalThis.setTimeout> | undefined;
  onCleanup(() => timer && clearTimeout(timer));
  const context = useContext(TransitionContext);

  return (
    <Transition
      in={props.in ?? context?.in}
      appear={props.appear}
      timeout={props.timeout === "auto" ? undefined : props.timeout}
      {...otherProps}
      onEnter={() => {
        const node = resolved();
        reflow(node); // So the animation always start from the start.

        const {
          duration: transitionDuration,
          delay,
          easing: transitionTimingFunction,
        } = getTransitionProps(
          {
            style: otherProps.style,
            timeout: props.timeout,
            easing: props.easing,
          },
          {
            mode: "enter",
          }
        );

        let duration: string | number;
        if (props.timeout === "auto") {
          autoTimeout.current = duration =
            theme.transitions.getAutoHeightDuration(node.clientHeight);
        } else {
          duration = transitionDuration;
        }

        node.style.transition = [
          theme.transitions.create("opacity", {
            duration,
            delay,
          }),
          theme.transitions.create("transform", {
            duration: Number(duration) * 0.666,
            delay,
            easing: transitionTimingFunction,
          }),
        ].join(",");

        otherProps.onEnter?.();
        context?.onEnter?.();
      }}
      onExit={() => {
        const node = resolved();
        const {
          duration: transitionDuration,
          delay,
          easing: transitionTimingFunction,
        } = getTransitionProps(
          {
            style: otherProps.style,
            timeout: props.timeout,
            easing: props.easing,
          },
          {
            mode: "exit",
          }
        );

        let duration: string | number;
        if (props.timeout === "auto") {
          duration = theme.transitions.getAutoHeightDuration(node.clientHeight);
          autoTimeout.current = duration;
        } else {
          duration = transitionDuration;
        }

        node.style.transition = [
          theme.transitions.create("opacity", {
            duration,
            delay,
          }),
          theme.transitions.create("transform", {
            duration: Number(duration) * 0.666,
            delay: delay || Number(duration) * 0.333,
            easing: transitionTimingFunction,
          }),
        ].join(",");

        otherProps.onExit?.();
      }}
      {...(props.timeout !== "auto" && {
        addEndListener: (next) => {
          timer = setTimeout(next, autoTimeout.current || 0);
          otherProps.addEndListener?.(next);
        },
      })}
      onExited={() => {
        otherProps.onExited?.();
        context?.onExited?.();
      }}
    >
      {(state) => {
        const element = resolved();
        element.style.opacity = "0";
        element.style.transform = getScale(0.75);

        if (state === "exited" && !props.in) {
          element.style.visibility = "hidden";
        } else {
          element.style.removeProperty("visibility");
        }

        const style: StyleProps = {
          ...(styles[state] || {}),
          ...(otherProps.style || {}),
        };

        for (const name in style) {
          const value = style[name as keyof StyleProps] as any;
          if (value === undefined) {
            element.style.removeProperty(name);
          } else {
            element.style[name as any] = value;
          }
        }

        return element;
      }}
    </Transition>
  );
});

export default Grow;
