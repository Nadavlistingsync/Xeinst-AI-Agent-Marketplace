'use client';

import * as React from "react";
import { cn } from "../../../lib/utils";
import { LiquidGlassButton } from "./LiquidGlassButton";

interface LiquidGlassHeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  className?: string;
}

const LiquidGlassHero: React.FC<LiquidGlassHeroProps> = ({
  title,
  subtitle,
  ctaText,
  ctaHref,
  className
}) => {
  return (
    <section className={cn("liquid-hero", className)}>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      <LiquidGlassButton 
        variant="primary" 
        size="xl" 
        asChild
      >
        <a href={ctaHref}>{ctaText}</a>
      </LiquidGlassButton>
    </section>
  );
};

export { LiquidGlassHero };
