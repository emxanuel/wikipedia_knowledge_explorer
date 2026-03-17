'use client';

import { cn } from "@/lib/utils";
import * as React from "react";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-medium text-zinc-800 dark:text-zinc-100",
          className,
        )}
        {...props}
      />
    );
  },
);

Label.displayName = "Label";

