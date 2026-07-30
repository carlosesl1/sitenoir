import type { AnchorHTMLAttributes, ButtonHTMLAttributes, JSX, ReactNode } from "react";

import styles from "./primitives.module.css";

type CommonControlProps = {
  readonly children: ReactNode;
  readonly meta?: string;
  readonly variant?: "primary" | "quiet" | "link";
};

type ButtonControlProps = CommonControlProps &
  Readonly<Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">> & {
    readonly kind: "button";
  };

type LinkControlProps = CommonControlProps &
  Readonly<Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className">> & {
    readonly href: string;
    readonly kind: "link";
  };

export type NoirControlProps = ButtonControlProps | LinkControlProps;

function assertNever(value: never): never {
  throw new TypeError(`Unexpected NoirControl variant: ${String(value)}`);
}

export function NoirControl(props: NoirControlProps): JSX.Element {
  const variant = props.variant ?? "primary";
  const className = [styles["control"], styles[variant]].join(" ");
  const content = (
    <>
      <span>{props.children}</span>
      {props.meta === undefined ? null : (
        <span className={styles["controlMeta"]} aria-hidden="true">
          {props.meta}
        </span>
      )}
    </>
  );
  const face = (
    <span className={styles["controlFace"]} data-part="control-face">
      {content}
    </span>
  );

  switch (props.kind) {
    case "link": {
      const {
        children: _children,
        kind: _kind,
        meta: _meta,
        variant: _variant,
        ...anchorProps
      } = props;
      return (
        <a {...anchorProps} className={className}>
          {face}
        </a>
      );
    }
    case "button": {
      const {
        children: _children,
        kind: _kind,
        meta: _meta,
        variant: _variant,
        ...buttonProps
      } = props;
      return (
        <button {...buttonProps} className={className} type={buttonProps.type ?? "button"}>
          {face}
        </button>
      );
    }
    default:
      return assertNever(props);
  }
}
