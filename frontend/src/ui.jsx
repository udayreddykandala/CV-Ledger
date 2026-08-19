import React from "react";

/** The design system's registration marks. Every framed object wears them. */
export const Corners = () => (
  <>
    <i className="corner tl" />
    <i className="corner tr" />
    <i className="corner bl" />
    <i className="corner br" />
  </>
);

export function Blueprint({ as: Tag = "div", className = "", children, ...rest }) {
  return (
    <Tag className={`blueprint ${className}`.trim()} {...rest}>
      <Corners />
      {children}
    </Tag>
  );
}

export const Kicker = ({ children }) => (
  <div style={{ fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--color-accent-700)", marginBottom: 8 }}>
    {children}
  </div>
);

export const Muted = ({ children, style }) => (
  <span style={{ color: "var(--color-neutral-700)", ...style }}>{children}</span>
);

export const primaryBtn = {
  height: 44,
  paddingInline: 24,
  letterSpacing: ".06em",
  textTransform: "uppercase",
};

export const Field = ({ label, ...rest }) => (
  <div className="field">
    <label>{label}</label>
    <input className="input" {...rest} />
  </div>
);

export const ErrorNote = ({ children }) =>
  children ? (
    <div style={{ fontSize: 13, color: "var(--color-accent-800)", background: "var(--color-accent-100)", padding: "8px 12px" }}>
      {children}
    </div>
  ) : null;
