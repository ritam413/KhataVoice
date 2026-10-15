"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 transition-all duration-300 ease-out",
  {
    variants: {
      variant: {
        default: "bg-primary shadow-sm shadow-saffron-500/20",
        saffron: "bg-primary shadow-sm shadow-saffron-500/20",
        emerald: "bg-emerald shadow-sm shadow-emerald-500/20",
        destructive: "bg-destructive shadow-sm shadow-destructive/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressIndicatorVariants> {}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, variant = "default", ...props }, ref) => {
  const safeValue = Math.min(100, Math.max(0, value || 0));

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-3 w-full overflow-hidden rounded-full bg-secondary/80",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(progressIndicatorVariants({ variant }))}
        style={{ transform: `translateX(-${100 - safeValue}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress, progressIndicatorVariants };
