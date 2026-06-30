"use client"

import { useEffect, useState, useMemo } from "react"
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  CalendarX, 
  Clock, 
  Info, 
  CalendarDays, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format, differenceInMinutes } from "date-fns"
import { workerService } from "@/api/WorkerService"
import { cn } from "@/lib/utils"

export interface IHoliday {
  date: Date
  reason?: string
}

export interface ICustomSlot {
  date: Date
  startTime: string
  endTime: string
}

interface CalendarModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CalendarModal({
  open,
  onOpenChange,
}: CalendarModalProps) {
  const [holidays, setHolidays] = useState<IHoliday[]>([])
  const [customSlots, setCustomSlots] = useState<ICustomSlot[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [formMode, setFormMode] = useState<"holiday" | "slot" | null>(null)
  const [holidayReason, setHolidayReason] = useState("")
  const [slotStartTime, setSlotStartTime] = useState("")
  const [slotEndTime, setSlotEndTime] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Check if a date has a holiday
  const hasHoliday = (date: Date) => holidays.some((h) => format(h.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))

  // Check if a date has custom slots
  const hasCustomSlots = (date: Date) =>
    customSlots.some((s) => format(s.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))

  // Get slots for a specific date
  const getSlotsForDate = (date: Date) =>
    customSlots.filter((s) => format(s.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))

  // Get holiday for a specific date
  const getHolidayForDate = (date: Date) =>
    holidays.find((h) => format(h.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))

  // Fetch Calendar Data
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const response = await workerService.getCalenderData()
          if (response.data.success) {
            setHolidays(response.data.holidays || []);
            setCustomSlots(response.data.customSlots || []);
          } else {
            onOpenChange(false)
            ErrorToast("Failed to load calendar data");
          }
        } catch (error) {
          ErrorToast("Failed to load calendar data");
        }
      }
      fetchData()
    }
  }, [open])

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    setFormMode(null)
    setHolidayReason("")
    setSlotStartTime("")
    setSlotEndTime("")
  }

  const handleAddHoliday = () => {
    if (!selectedDate) return

    const newHoliday: IHoliday = {
      date: selectedDate,
      reason: holidayReason || undefined,
    }

    // Remove existing holiday for this date if any
    setHolidays(holidays.filter((h) => format(h.date, "yyyy-MM-dd") !== format(selectedDate, "yyyy-MM-dd")))
    setHolidays((prev) => [...prev, newHoliday])

    // Remove any custom slots for this date
    setCustomSlots(customSlots.filter((s) => format(s.date, "yyyy-MM-dd") !== format(selectedDate, "yyyy-MM-dd")))

    setFormMode(null)
    setHolidayReason("")
    SuccessToast(`Holiday marked for ${format(selectedDate, "MMM dd, yyyy")}`)
  }

  const handleAddSlot = () => {
    if (!selectedDate || !slotStartTime || !slotEndTime) {
      ErrorToast('Please fill in all fields')
      return
    }

    if (slotStartTime >= slotEndTime) {
      ErrorToast('End time must be after start time')
      return
    }

    const newSlot: ICustomSlot = {
      date: selectedDate,
      startTime: slotStartTime,
      endTime: slotEndTime,
    }

    // Remove holiday for this date if any
    setHolidays(holidays.filter((h) => format(h.date, "yyyy-MM-dd") !== format(selectedDate, "yyyy-MM-dd")))

    setCustomSlots((prev) => [...prev, newSlot])
    setFormMode(null)
    setSlotStartTime("")
    setSlotEndTime("")
    SuccessToast(`Custom slot added for ${format(selectedDate, "MMM dd, yyyy")}`)
  }

  const handleRemoveHoliday = (date: Date) => {
    setHolidays(holidays.filter((h) => format(h.date, "yyyy-MM-dd") !== format(date, "yyyy-MM-dd")))
    SuccessToast(`Holiday removed for ${format(date, "MMM dd, yyyy")}`)
  }

  const handleRemoveSlot = (date: Date, startTime: string) => {
    setCustomSlots(
      customSlots.filter(
        (s) => !(format(s.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd") && s.startTime === startTime),
      ),
    )
    SuccessToast(`Custom slot removed for ${format(date, "MMM dd, yyyy")}`)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await workerService.updateCalenderData({ holidays, customSlots })
      if (response.data.success) {
        SuccessToast("Calendar updated successfully")
      } else {
        ErrorToast("Calendar update failed")
      }
      onOpenChange(false)
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to save calendar")
    } finally {
      setIsSaving(false)
    }
  }

  // Calculate duration string (e.g. 2h 30m)
  const getSlotDuration = (start: string, end: string) => {
    try {
      const [sh, sm] = start.split(":").map(Number)
      const [eh, em] = end.split(":").map(Number)
      const diff = (eh * 60 + em) - (sh * 60 + sm)
      if (diff <= 0) return ""
      const hours = Math.floor(diff / 60)
      const minutes = diff % 60
      if (hours > 0) {
        return `${hours}h${minutes > 0 ? ` ${minutes}m` : ""}`
      }
      return `${minutes}m`
    } catch {
      return ""
    }
  }

  // Group items by date
  const dayHoliday = selectedDate ? getHolidayForDate(selectedDate) : null
  const daySlots = selectedDate ? getSlotsForDate(selectedDate) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full lg:max-w-[1050px] w-[95vw] max-h-[90vh] overflow-y-auto rounded-3xl p-5 md:p-6 bg-slate-50/50 border border-slate-100/80 shadow-2xl">
        
        {/* Header */}
        <DialogHeader className="pb-4 border-b border-slate-150/60 mb-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-100">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-slate-800 tracking-tight leading-none">
                Manage Availability Calendar
              </DialogTitle>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1.5">
                Set holidays and custom availability slots to manage your service schedule.
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-4">
          
          {/* Calendar Section (Left ~42%) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <Card className="border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-4 md:p-5 flex flex-col justify-between h-fit">
              <div className="flex justify-center items-center w-full py-1">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  className="w-auto mx-auto [--cell-size:2.2rem] sm:[--cell-size:2.4rem] md:[--cell-size:2.5rem]"
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  modifiers={{
                    holiday: (date) => hasHoliday(date),
                    customSlot: (date) => hasCustomSlots(date),
                  }}
                  modifiersClassNames={{
                    holiday: "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 hover:text-rose-700 font-extrabold rounded-xl transition-all duration-200 shadow-sm shadow-rose-50",
                    customSlot: "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 hover:text-emerald-700 font-extrabold rounded-xl transition-all duration-200 shadow-sm shadow-emerald-50",
                  }}
                  classNames={{
                    root: "w-full flex justify-center",
                    months: "w-full flex justify-center",
                    month: "w-full space-y-3",
                  }}
                />
              </div>

              {/* Legends Section */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-center text-[10px] font-bold text-slate-500">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50/40 border border-blue-100 rounded-full text-blue-750 transition-all duration-200 hover:bg-blue-50/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-sm shadow-blue-300" />
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-50/40 border border-rose-100 rounded-full text-rose-750 transition-all duration-200 hover:bg-rose-50/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shadow-sm shadow-rose-300" />
                  <span>Holiday</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/40 border border-emerald-100 rounded-full text-emerald-750 transition-all duration-200 hover:bg-emerald-50/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-300" />
                  <span>Custom Slots</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200/60 rounded-full text-slate-400 transition-all duration-200 hover:bg-slate-100/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-350" />
                  <span>Disabled</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Form & Day Actions Section (Right ~58%) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {selectedDate ? (
              <Card className="border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl p-4 md:p-5 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Selected Date Title */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50/60 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <h3 className="font-extrabold text-slate-800 text-sm">
                        {format(selectedDate, "eeee, MMM dd")}
                      </h3>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-extrabold text-slate-400 border-slate-200 px-1.5 py-0.5 rounded">
                      Config
                    </Badge>
                  </div>

                  {/* Form Modes (Holiday / Slot forms) */}
                  {formMode === "holiday" && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-rose-50/20 border border-rose-100 rounded-xl p-4">
                        <h4 className="text-[10px] font-extrabold text-rose-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          Marking as Holiday
                        </h4>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="reason" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Reason for holiday (optional)
                            </Label>
                            <Input
                              id="reason"
                              placeholder="e.g. National Holiday, Personal Leave"
                              value={holidayReason}
                              onChange={(e) => setHolidayReason(e.target.value)}
                              className="h-9 rounded-lg border-slate-200 focus-visible:ring-rose-500 focus-visible:border-rose-500 bg-white shadow-sm transition-all text-xs"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={handleAddHoliday} 
                              className="flex-1 h-9 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] cursor-pointer gap-1.5 shadow-sm transition-all duration-200"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Save Holiday
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setFormMode(null)}
                              className="h-9 px-3 rounded-lg border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer font-bold text-[11px] transition-all duration-200"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {formMode === "slot" && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-4">
                        <h4 className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          Add Custom Availability Slot
                        </h4>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="startTime" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                Start Time
                              </Label>
                              <Input
                                id="startTime"
                                type="time"
                                value={slotStartTime}
                                onChange={(e) => setSlotStartTime(e.target.value)}
                                className="h-9 rounded-lg border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 bg-white text-xs shadow-sm transition-all"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="endTime" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                End Time
                              </Label>
                              <Input
                                id="endTime"
                                type="time"
                                value={slotEndTime}
                                onChange={(e) => setSlotEndTime(e.target.value)}
                                className="h-9 rounded-lg border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 bg-white text-xs shadow-sm transition-all"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={handleAddSlot} 
                              className="flex-1 h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer gap-1.5 shadow-sm transition-all duration-200 hover:shadow-emerald-100"
                            >
                              <Save className="w-3.5 h-3.5" />
                              Add Time Slot
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => setFormMode(null)}
                              className="h-9 px-3 rounded-lg border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 cursor-pointer font-bold text-[11px] transition-all duration-200"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Render Day Details (If holiday / slots exist on this day) */}
                  {formMode === null && (
                    <div className="space-y-3.5">
                      {dayHoliday && (
                        <div className="bg-rose-50/20 border border-rose-100 rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-sm">
                          <div className="flex gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 border border-rose-200">
                              <CalendarX className="w-4 h-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-black text-rose-950">Holiday Marked</p>
                              <p className="text-[11px] text-rose-700/90 mt-0.5 leading-relaxed font-semibold break-words">
                                {dayHoliday.reason || "No reason specified."}
                              </p>
                            </div>
                          </div>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-7 w-7 text-rose-400 hover:text-rose-700 hover:bg-rose-100 rounded-lg cursor-pointer shrink-0 transition-all duration-200"
                            onClick={() => handleRemoveHoliday(selectedDate)}
                            title="Remove holiday"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}

                      {daySlots.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Custom Availability Slots
                            </p>
                            <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                              {daySlots.length} Slots
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                            {daySlots.map((slot, idx) => (
                              <div 
                                key={idx}
                                className="bg-emerald-50/15 border border-emerald-100 rounded-xl p-2.5 flex items-center justify-between gap-3 hover:bg-emerald-50/25 transition-all duration-200"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/50">
                                    <Clock className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 flex-wrap">
                                      <span>{slot.startTime}</span> 
                                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" /> 
                                      <span>{slot.endTime}</span>
                                    </p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                                      Duration: {getSlotDuration(slot.startTime, slot.endTime)}
                                    </p>
                                  </div>
                                </div>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer shrink-0 transition-all duration-200"
                                  onClick={() => handleRemoveSlot(selectedDate, slot.startTime)}
                                  title="Delete custom slot"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!dayHoliday && daySlots.length === 0 && (
                        <div className="py-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2">
                            <Sparkles className="w-4 h-4 text-blue-550 opacity-90" />
                          </div>
                          <h4 className="text-xs font-extrabold text-slate-700">Standard Schedule Active</h4>
                          <p className="text-slate-400 text-[10px] px-6 mt-1 leading-relaxed font-semibold max-w-[200px] mx-auto">
                            No custom slots or holidays set on this date.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Configuration Action Buttons */}
                {formMode === null && (
                  <div className="flex gap-2.5 mt-4 border-t border-slate-100 pt-3.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 justify-center rounded-lg bg-transparent hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 border-slate-200 font-bold text-xs cursor-pointer gap-1.5 transition-all duration-200"
                      onClick={() => setFormMode("holiday")}
                      disabled={!!dayHoliday}
                    >
                      <CalendarX className="w-3.5 h-3.5" />
                      Mark Holiday
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-9 justify-center rounded-lg bg-transparent hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border-slate-200 font-bold text-xs cursor-pointer gap-1.5 transition-all duration-200"
                      onClick={() => setFormMode("slot")}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Slot
                    </Button>
                  </div>
                )}
              </Card>
            ) : (
              // Empty State (No Date Selected)
              <Card className="border border-slate-100 bg-white shadow-sm rounded-2xl p-6 flex-1 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[180px]">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-50 to-blue-100/50 text-blue-600 border border-blue-100 flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm">Select a Date</h3>
                <p className="text-slate-400 text-[10px] max-w-[200px] mt-1.5 leading-relaxed font-semibold">
                  Click on any calendar day to configure holidays or custom slots.
                </p>
              </Card>
            )}

            {/* List Listings Stacked underneath the Date Card inside the Right Column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Timeline Holidays */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-5.5 h-5.5 rounded bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
                    <CalendarX className="w-3 h-3" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider">
                    Holidays ({holidays.length})
                  </h4>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {holidays.length === 0 ? (
                    <div className="p-4 text-center bg-white border border-slate-100 rounded-xl text-slate-400 text-[10px] font-bold italic shadow-xs">
                      No holidays marked
                    </div>
                  ) : (
                    holidays.map((holiday, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-xs hover:shadow-sm transition-all duration-205"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-rose-50/60 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                            <CalendarX className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-extrabold text-slate-800">
                              {format(new Date(holiday.date), "MMM dd, yyyy")}
                            </p>
                            {holiday.reason && (
                              <p className="text-[9px] text-slate-400 font-semibold mt-0.5 truncate max-w-[110px] sm:max-w-[150px]">
                                {holiday.reason}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-all duration-200"
                          onClick={() => handleRemoveHoliday(holiday.date)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Timeline Custom Slots */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 px-1">
                  <div className="w-5.5 h-5.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                    <Clock className="w-3 h-3" />
                  </div>
                  <h4 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wider">
                    Custom Slots ({customSlots.length})
                  </h4>
                </div>

                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {customSlots.length === 0 ? (
                    <div className="p-4 text-center bg-white border border-slate-100 rounded-xl text-slate-400 text-[10px] font-bold italic shadow-xs">
                      No custom slots
                    </div>
                  ) : (
                    customSlots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-100 shadow-xs hover:shadow-sm transition-all duration-205"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50/60 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-extrabold text-slate-800 truncate">
                              {format(new Date(slot.date), "MMM dd")}
                            </p>
                            <span className="inline-block text-[8px] font-extrabold text-emerald-700 bg-emerald-50/80 border border-emerald-100/50 px-1 py-0.5 rounded mt-0.5">
                              {slot.startTime}-{slot.endTime}
                            </span>
                          </div>
                        </div>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-all duration-200"
                          onClick={() => handleRemoveSlot(slot.date, slot.startTime)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Dialog Actions / Footer */}
        <DialogFooter className="mt-6 pt-4 border-t border-slate-150/85 gap-3 sm:gap-0 flex flex-col-reverse sm:flex-row justify-end">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="h-10 px-5 rounded-xl border-slate-200 text-slate-650 font-bold text-xs cursor-pointer hover:bg-slate-50 transition-all duration-200 shadow-sm"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-blue-100 hover:shadow-blue-200 transition-all duration-200 gap-1.5"
          >
            {isSaving ? (
              <>Saving changes...</>
            ) : (
              <>
                <ShieldCheck className="w-4.5 h-4.5" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

