"use client";

import React, { useState } from "react";

export interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  accentColor: "pink" | "cyan" | "purple";
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  accentColor,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const accentColors = {
    pink: {
      border: "border-pixel-neon-pink",
      bg: "bg-pixel-neon-pink/10",
      glow: "rgba(255, 45, 149, 0.3)",
    },
    cyan: {
      border: "border-pixel-neon-cyan",
      bg: "bg-pixel-neon-cyan/10",
      glow: "rgba(0, 245, 255, 0.3)",
    },
    purple: {
      border: "border-pixel-neon-purple",
      bg: "bg-pixel-neon-purple/10",
      glow: "rgba(191, 95, 255, 0.3)",
    },
  };

  const colors = accentColors[accentColor];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/5 p-xl backdrop-blur-sm transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_20px_60px_-10px_var(--accent-glow)]"
      style={
        {
          "--accent-glow": colors.glow,
          "--mouse-x": `${mousePosition.x}%`,
          "--mouse-y": `${mousePosition.y}%`,
        } as React.CSSProperties
      }
      onMouseMove={handleMouseMove}
    >
      {/* Mouse tracking gradient */}
      <div
        className="absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl ${colors.bg} border ${colors.border} mb-lg relative overflow-hidden group`}
        >
          <span>{icon}</span>
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/10 -translate-x-full rotate-45 transition-transform duration-600 group-hover:translate-x-full" />
        </div>

        <h3 className="font-display text-2xl mb-sm tracking-wide">{title}</h3>
        <p className="text-pixel-text-secondary leading-relaxed font-light">
          {description}
        </p>
      </div>
    </div>
  );
};
