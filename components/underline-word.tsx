import type { ReactNode } from "react";

type UnderlineWordProps = {
  children: ReactNode;
  className?: string;
};

export function UnderlineWord({ children, className = "" }: UnderlineWordProps) {
  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      {children}
      <svg
        aria-hidden="true"
        className="underline-word-mark pointer-events-none"
        width="100%"
        viewBox="0 0 220 16"
        preserveAspectRatio="none"
      >
        <path
          d="M2 8.5C46 5.5 106 6 218 10"
          fill="none"
          strokeLinecap="round"
          strokeWidth="var(--underline-word-stroke-width)"
        />
        <path
          d="M10 12C68 10.5 128 11 210 12.8"
          fill="none"
          opacity="0.55"
          strokeLinecap="round"
          strokeWidth="var(--underline-word-stroke-width)"
        />
      </svg>
    </span>
  );
}
