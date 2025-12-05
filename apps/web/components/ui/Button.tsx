"use client";

import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
  size?: "default" | "large";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "default", className = "", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center gap-2 rounded-xl font-body font-semibold text-sm transition-all duration-300 ease-out cursor-pointer border-none relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary:
        "bg-gradient-to-br from-pixel-neon-pink to-pixel-neon-purple text-white shadow-[0_4px_20px_rgba(255,45,149,0.3),0_0_40px_rgba(191,95,255,0.2)] hover:shadow-[0_6px_30px_rgba(255,45,149,0.4),0_0_50px_rgba(191,95,255,0.3)]",
      ghost:
        "bg-transparent text-pixel-text-secondary border border-transparent hover:text-pixel-text-primary hover:border-white/10 hover:bg-white/5",
    };

    const sizeStyles = {
      default: "px-6 py-3",
      large: "px-10 py-5 text-base rounded-2xl",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {variant === "primary" && (
          <span className="absolute inset-0 bg-gradient-to-br from-pixel-neon-purple to-pixel-neon-cyan opacity-0 hover:opacity-100 transition-opacity duration-300" />
        )}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
