import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = ComponentPropsWithoutRef<"div"> & {
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  children: React.ReactNode;
  vertical?: boolean;
};

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex overflow-hidden p-2 [--duration:40s] [--gap:3rem] gap-(--gap)",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {[0, 1].map((i) => (
        <div
          key={i}
          className={cn(
            "flex shrink-0 justify-around gap-(--gap) animate-marquee",
            {
              "animate-marquee-vertical": vertical,
              "group-hover:paused": pauseOnHover,
              "animation-reverse": reverse,  // Tailwind'in built-in reverse'ı
            }
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}