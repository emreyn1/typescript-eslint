"use client"

import React, { RefObject, useEffect, useId, useRef, useState } from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

export interface AnimatedBeamProps {
  className?: string
  containerRef: RefObject<HTMLElement | null>
  fromRef: RefObject<HTMLElement | null>
  toRef: RefObject<HTMLElement | null>
  curvature?: number
  reverse?: boolean
  duration?: number
  delay?: number
  pathColor?: string
  pathWidth?: number
  pathOpacity?: number
  gradientStartColor?: string
  gradientStopColor?: string
  startXOffset?: number
  startYOffset?: number
  endXOffset?: number
  endYOffset?: number
}

export const AnimatedBeam: React.FC<AnimatedBeamProps> = ({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 6,
  delay = 0,
  pathColor = "gray",
  pathWidth = 2,
  pathOpacity = 0.2,
  gradientStartColor = "#ffaa40",
  gradientStopColor = "#9c40ff",
  startXOffset = 0,
  startYOffset = 0,
  endXOffset = 0,
  endYOffset = 0,
}) => {
  const id = useId()
  const [pathD, setPathD] = useState("")
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 })

  const gradientCoordinates = reverse
    ? {
        x1: ["90%", "-10%"],
        x2: ["100%", "0%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      }
    : {
        x1: ["10%", "110%"],
        x2: ["0%", "100%"],
        y1: ["0%", "0%"],
        y2: ["0%", "0%"],
      }

  useEffect(() => {
    const updatePath = () => {
      if (containerRef.current && fromRef.current && toRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect()
        const rectA = fromRef.current.getBoundingClientRect()
        const rectB = toRef.current.getBoundingClientRect()

        const svgWidth = containerRect.width
        const svgHeight = containerRect.height
        setSvgDimensions({ width: svgWidth, height: svgHeight })

        const startX = rectA.left - containerRect.left + rectA.width / 2 + startXOffset
        const startY = rectA.top - containerRect.top + rectA.height / 2 + startYOffset
        const endX = rectB.left - containerRect.left + rectB.width / 2 + endXOffset
        const endY = rectB.top - containerRect.top + rectB.height / 2 + endYOffset

        const controlY = startY - curvature
        const d = `M ${startX},${startY} Q ${(startX + endX) / 2},${controlY} ${endX},${endY}`
        setPathD(d)
      }
    }

    const resizeObserver = new ResizeObserver(updatePath)
    if (containerRef.current) resizeObserver.observe(containerRef.current)
    updatePath()

    return () => resizeObserver.disconnect()
  }, [
    containerRef,
    fromRef,
    toRef,
    curvature,
    startXOffset,
    startYOffset,
    endXOffset,
    endYOffset,
  ])

  return (
    <svg
      fill="none"
      width={svgDimensions.width}
      height={svgDimensions.height}
      xmlns="http://www.w3.org/2000/svg"
      className={cn("pointer-events-none absolute left-0 top-0", className)}
      viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
    >
      <path d={pathD} stroke={pathColor} strokeWidth={pathWidth} strokeOpacity={pathOpacity} strokeLinecap="round" />
      <path d={pathD} strokeWidth={pathWidth} stroke={`url(#${id})`} strokeOpacity="1" strokeLinecap="round" />
      <defs>
        <motion.linearGradient
          id={id}
          gradientUnits="userSpaceOnUse"
          initial={{ x1: "0%", x2: "0%", y1: "0%", y2: "0%" }}
          animate={{
            x1: gradientCoordinates.x1,
            x2: gradientCoordinates.x2,
            y1: gradientCoordinates.y1,
            y2: gradientCoordinates.y2,
          }}
          transition={{ delay, duration, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatDelay: 0 }}
        >
          <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
          <stop offset="32.5%" stopColor={gradientStartColor} stopOpacity="1" />
          <stop offset="65%" stopColor={gradientStopColor} stopOpacity="1" />
          <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
        </motion.linearGradient>
      </defs>
    </svg>
  )
}

// Multiple Output Demo (Bento Grid'de kullanılan)
const Circle = React.forwardRef<HTMLDivElement, { className?: string; children?: React.ReactNode }>(
  ({ className, children }, ref) => (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      {children}
    </div>
  )
)

Circle.displayName = "Circle"

export function AnimatedBeamMultipleOutputDemo({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const centerRef = useRef<HTMLDivElement>(null)

  const ref1 = useRef<HTMLDivElement>(null)
  const ref2 = useRef<HTMLDivElement>(null)
  const ref3 = useRef<HTMLDivElement>(null)
  const ref4 = useRef<HTMLDivElement>(null)
  const ref5 = useRef<HTMLDivElement>(null)
  const ref6 = useRef<HTMLDivElement>(null)
  const ref7 = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={containerRef}
      className={cn("relative flex h-full w-full items-center justify-center overflow-hidden bg-transparent", className)}
    >
      {/* Merkez */}
      <div ref={centerRef} className="absolute">
        <Circle>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            <path d="M12 8v8m-4-4h8" />
          </svg>
        </Circle>
      </div>

      {/* Çevre ikonlar */}
      <div ref={ref1} className="absolute left-4 top-4"><Circle className="size-10 bg-blue-500" /></div>
      <div ref={ref2} className="absolute left-8 top-20"><Circle className="size-10 bg-purple-500" /></div>
      <div ref={ref3} className="absolute right-8 top-8"><Circle className="size-10 bg-green-500" /></div>
      <div ref={ref4} className="absolute right-4 bottom-4"><Circle className="size-10 bg-orange-500" /></div>
      <div ref={ref5} className="absolute bottom-20 left-4"><Circle className="size-10 bg-cyan-500" /></div>
      <div ref={ref6} className="absolute bottom-8 right-20"><Circle className="size-10 bg-red-500" /></div>
      <div ref={ref7} className="absolute top-1/2 right-0 -translate-y-1/2"><Circle className="size-10 bg-indigo-500" /></div>

      {/* Beam'ler */}
      <AnimatedBeam containerRef={containerRef} fromRef={centerRef} toRef={ref1} />
      <AnimatedBeam containerRef={containerRef} fromRef={centerRef} toRef={ref2} delay={0.5} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={centerRef} toRef={ref3} delay={1} />
      <AnimatedBeam containerRef={containerRef} fromRef={centerRef} toRef={ref4} delay={1.5} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={centerRef} toRef={ref5} delay={2} />
      <AnimatedBeam containerRef={containerRef} fromRef={centerRef} toRef={ref6} delay={2.5} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={centerRef} toRef={ref7} delay={3} />
    </div>
  )
}