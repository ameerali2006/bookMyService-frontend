"use client"

import { useEffect, useState } from "react"

import { Calendar, Plus, Trash2, Save, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { workerService } from "@/api/WorkerService"



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

  useEffect(()=>{
    console.log("hllo")
    if(open){
      const fetchData=async ()=>{
        try {
          const response= await workerService.getCalenderData()
          console.log(response)
          if(response.data.success){
            setHolidays(response.data.holidays || []);
            setCustomSlots(response.data.customSlots || []);
          }else{
            onOpenChange(false)
            ErrorToast("Failed to load calendar data");
          }
        } catch (error) {
          ErrorToast("Failed to load calendar data");
        }
      }
      fetchData()
    }
  },[open])

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
    SuccessToast( `Holiday removed for ${format(date, "MMM dd, yyyy")}`)
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
      const response=await workerService.updateCalenderData({holidays,customSlots})
      if(response.data.success){
        SuccessToast("Calendar updated successfully")
      }else{
        ErrorToast("Calendar updatetion failed")
      }
      
      onOpenChange(false)
    } catch (error) {
      ErrorToast(error instanceof Error ? error.message : "Failed to save calendar")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Manage Calendar
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="border rounded-lg p-4 bg-card">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                className="w-full"
                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              />

              {/* Date Indicators */}
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Custom Slots</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Section */}
          <div className="space-y-4">
            {selectedDate && (
              <Card className="p-4">
                <h3 className="font-semibold mb-3">{format(selectedDate, "MMM dd, yyyy")}</h3>

                {formMode === null && (
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-transparent"
                      onClick={() => setFormMode("holiday")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Holiday
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start bg-transparent"
                      onClick={() => setFormMode("slot")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Slot
                    </Button>
                  </div>
                )}

                {formMode === "holiday" && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="reason" className="text-xs">
                        Reason (optional)
                      </Label>
                      <Input
                        id="reason"
                        placeholder="e.g., National Holiday"
                        value={holidayReason}
                        onChange={(e) => setHolidayReason(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddHoliday} className="flex-1">
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setFormMode(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {formMode === "slot" && (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="startTime" className="text-xs">
                        Start Time
                      </Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={slotStartTime}
                        onChange={(e) => setSlotStartTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime" className="text-xs">
                        End Time
                      </Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={slotEndTime}
                        onChange={(e) => setSlotEndTime(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleAddSlot} className="flex-1">
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setFormMode(null)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-4 border-t">
          {/* Holidays */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Holidays ({holidays.length})</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {holidays.length === 0 ? (
                <p className="text-sm text-muted-foreground">No holidays added</p>
              ) : (
                holidays.map((holiday, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-950 rounded border border-red-200 dark:border-red-800"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{format(holiday.date, "MMM dd, yyyy")}</p>
                      {holiday.reason && <p className="text-xs text-muted-foreground">{holiday.reason}</p>}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveHoliday(holiday.date)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Custom Slots */}
          <div>
            <h4 className="font-semibold text-sm mb-3">Custom Slots ({customSlots.length})</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {customSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No custom slots added</p>
              ) : (
                customSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded border border-green-200 dark:border-green-800"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{format(slot.date, "MMM dd, yyyy")}</p>
                      <p className="text-xs text-muted-foreground">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleRemoveSlot(slot.date, slot.startTime)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
