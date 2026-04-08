"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export type TimeStatus = "available" | "break" | "booked" | "unavailable"

export interface TimeRange {
  start: string // "HH:mm"
  end: string // "HH:mm"
  status: TimeStatus
}

export interface ChooseDateTimeProps {
  availableTimes: TimeRange[]
  onTimeSelect: (startTime: string) => void
  onDateChange?: (date: Date) => void
  initialDate?: Date
  className?: string
}

const MINUTES_IN_DAY = 24 * 60
const STEP_MINUTES = 5 // ticks every 5 minutes
const PX_PER_MIN = 2 // width scale: 24*60*2 = 2880px

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

function clampMinutes(mins: number) {
  return Math.max(0, Math.min(MINUTES_IN_DAY - 1, mins))
}

function minutesToTimeString(mins: number): string {
  const mm = clampMinutes(Math.round(mins))
  const h = Math.floor(mm / 60)
  const m = mm % 60
  const hh = String(h).padStart(2, "0")
  const mmStr = String(m).padStart(2, "0")
  return `${hh}:${mmStr}`
}

function hourLabel(hour: number) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12
  const suffix = hour < 12 ? "AM" : "PM"
  return `${h12} ${suffix}`
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function dayShort(date: Date) {
  return date.toLocaleString(undefined, { weekday: "short" })
}

function monthDay(date: Date) {
  return date.toLocaleString(undefined, { day: "2-digit" })
}

type DateStripProps = {
  selectedDate: Date
  onSelect: (d: Date) => void
}

function DateStrip({ selectedDate, onSelect }: DateStripProps) {
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i))

  return (
    <div className="flex items-center gap-3 overflow-x-auto py-2">
      {days.map((d) => {
        const selected = isSameDay(d, selectedDate)
        return (
          <button
            key={d.toDateString()}
            type="button"
            onClick={() => onSelect(d)}
            className={cn(
              "min-w-[110px] -h[120px] select-none  rounded-lg px-4 py-6 text-center shadow-sm transition-colors",
              " text-foreground bg-gray-300",
              selected && "bg-grey-400 text-amber-400 shadow-md border-2   border-amber-400",
            )}
            aria-pressed={selected}
          >
            <div className="text-lg font-light">{dayShort(d)}</div>
            <div className="text-4xl font-extrabold">{monthDay(d)}</div>
          </button>
        )
      })}
    </div>
  )
}

export function ChooseDateTime({
  availableTimes,
  onTimeSelect,
  onDateChange,
  initialDate,
  className,
}: ChooseDateTimeProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(initialDate ?? new Date())
  const [selectedMinutes, setSelectedMinutes] = React.useState<number | null>(null)
  const [invalidClickAt, setInvalidClickAt] = React.useState<number | null>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  const totalWidth = MINUTES_IN_DAY * PX_PER_MIN

  // Scroll center on selection
  React.useEffect(() => {
    if (selectedMinutes == null) return
    const container = scrollRef.current
    if (!container) return
    const targetX = selectedMinutes * PX_PER_MIN - container.clientWidth / 2
    container.scrollTo({ left: Math.max(0, targetX), behavior: "smooth" })
  }, [selectedMinutes])

  const handleDateSelect = (d: Date) => {
    setSelectedDate(d)
    onDateChange?.(d)
    setSelectedMinutes(null)
  }

  // Helper: is this minute inside an "available" range?
  const getStatusAtMinute = React.useCallback(
    (mins: number): TimeStatus => {
      if (!availableTimes || availableTimes.length === 0) return "unavailable";

      // Find all overlapping ranges
      const overlapping = availableTimes.filter((range) => {
        const start = timeToMinutes(range.start);
        const end = timeToMinutes(range.end);
        return mins >= start && mins < end;
      });

      if (overlapping.length === 0) return "unavailable";

      // Pick the "strongest" status among overlaps
      const priority = ["break", "booked", "available", "unavailable"];
      overlapping.sort(
        (a, b) => priority.indexOf(a.status) - priority.indexOf(b.status)
      );

      return overlapping[0].status;
    },
    [availableTimes]
  );


  const handleClickTrack = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = scrollRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left + container.scrollLeft;
    const minsRaw = x / PX_PER_MIN;

    const snapped = Math.round(minsRaw / STEP_MINUTES) * STEP_MINUTES;
    const clamped = clampMinutes(snapped);

    const status = getStatusAtMinute(clamped);

    if (status !== "available") {
      // 🚫 not selectable: break/booked/unavailable
      setInvalidClickAt(clamped);
      window.setTimeout(() => setInvalidClickAt(null), 650);
      return;
    }

    // ✅ valid selection
    setSelectedMinutes(clamped);
    onTimeSelect(minutesToTimeString(clamped));
  };


  // Status -> Tailwind classes
  const getStatusClass = (status: TimeStatus) => {
    switch (status) {
      case "available":
        return "bg-green-200/80"
      case "break":
      case "booked":
        return "bg-red-200/70"
      case "unavailable":
      default:
        return "bg-gray-200/60 filter blur-sm"
    }
  }

  const selectedTimeLabel = selectedMinutes == null ? "--:--" : minutesToTimeString(selectedMinutes)

  return (
    <div className={cn("w-full max-w-4xl mx-auto p-6 rounded-xl  shadow-md bg-white", className)}>
      <header className="mb-4 flex flex-col items-center gap-2">
        <h1 className="text-center text-2xl font-bold text-foreground">Choose Date/Time</h1>
        <div className="text-sm text-muted-foreground">Start time: <span className="font-semibold">{selectedTimeLabel}</span></div>
      </header>

      <DateStrip selectedDate={selectedDate} onSelect={handleDateSelect} />

      <section className="mt-4">
        <div className="rounded-lg border border-border bg-popover p-4 shadow-sm">
          {/* Legend */}
          <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded bg-green-200/80" aria-hidden />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded bg-red-200/70" aria-hidden />
              <span>Break/Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded bg-gray-200/60 filter blur-sm" aria-hidden />
              <span>Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded bg-red-500" aria-hidden />
              <span>Selected (pin)</span>
            </div>
          </div>

          {/* Scrollable timeline */}
          <div
            ref={scrollRef}
            className="relative w-full overflow-x-auto touch-pan-x"
            role="region"
            aria-label="24-hour timeline"
          >
            <div className="relative h-28 min-w-full" style={{ width: `${totalWidth}px` }}>
              {/* Background base */}
              <div className="absolute inset-0 rounded-md bg-secondary" />

              {/* Availability bands (pointer-events-none so clicks fall through to track) */}
              <div className="absolute inset-0">
                {availableTimes?.map((range, idx) => {
                  const left = timeToMinutes(range.start) * PX_PER_MIN
                  const right = timeToMinutes(range.end) * PX_PER_MIN
                  const width = Math.max(0, right - left)
                  return (
                    <div
                      key={`${range.start}-${range.end}-${idx}`}
                      className={cn(
                        "absolute top-0 h-full rounded-md opacity-95 pointer-events-none",
                        getStatusClass(range.status),
                      )}
                      style={{ left, width }}
                      aria-hidden
                    />
                  )
                })}
              </div>

              {/* Ticks and labels */}
              <div ref={trackRef} className="absolute inset-0 cursor-pointer" onClick={handleClickTrack}>
                {/* Hour labels */}
                {[...Array(24)].map((_, hour) => {
                  const x = hour * 60 * PX_PER_MIN
                  return (
                    <div
                      key={`label-${hour}`}
                      className="absolute top-1 text-[10px] text-muted-foreground -translate-x-1/2"
                      style={{ left: x }}
                      aria-hidden
                    >
                      {hourLabel(hour)}
                    </div>
                  )
                })}

                {/* Tick lines */}
                {[...Array(Math.floor(MINUTES_IN_DAY / STEP_MINUTES) + 1)].map((_, i) => {
                  const minute = i * STEP_MINUTES
                  const isHour = minute % 60 === 0
                  const isHalf = minute % 30 === 0 && !isHour
                  const heightClass = isHour ? "h-8" : isHalf ? "h-6" : "h-3"
                  const top = isHour ? 24 : isHalf ? 28 : 32
                  const x = minute * PX_PER_MIN
                  return (
                    <div
                      key={`tick-${minute}`}
                      className={cn("absolute w-px bg-border", heightClass)}
                      style={{ left: x, top }}
                      aria-hidden
                    />
                  )
                })}

                {/* Selected marker (pin-like radio) */}
                {selectedMinutes !== null && (
                  <motion.div
                    className="absolute top-0 bottom-0 w-[2px] bg-red-500"
                    initial={false}
                    animate={{ left: selectedMinutes * PX_PER_MIN }}
                    style={{ left: selectedMinutes * PX_PER_MIN }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    aria-label={`Selected time ${minutesToTimeString(selectedMinutes)}`}
                  >
                    {/* Pin (circle + stem) */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full border-2 border-white bg-red-500 shadow" />
                      <div className="h-4 w-[2px] bg-red-500 mt-0.5 rounded-sm" />
                    </div>
                  </motion.div>
                )}

                {/* Invalid-click feedback marker */}
                {invalidClickAt !== null && (
                  <div
                    className="absolute -top-8 left-[0px] pointer-events-none"
                    style={{ left: invalidClickAt * PX_PER_MIN }}
                    aria-hidden
                  >
                    <div className="animate-pulse text-xs rounded px-2 py-1 bg-red-500/90 text-white">Unavailable</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <p className="mt-3 text-xs text-muted-foreground">
            Tap or click anywhere on the timeline to select a start time. Breaks/booked/unavailable areas cannot be selected.
            Scroll horizontally to explore all hours.
          </p>
        </div>
      </section>
    </div>
  )
}

export default ChooseDateTime
