import React, { useEffect, useState } from "react";
import {
  Clock,
  Copy,
  Save,
  Plus,
  Trash2,
  Calendar,
  Settings,
  AlertTriangle,
  Coffee,
  Utensils,
  Moon,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/worker/Dashboard/WorkerNavbar";
import { WorkerLayout } from "@/components/worker/Dashboard/WorkerLayout";
import { workerService } from "@/api/WorkerService";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { CalendarModal } from "@/components/worker/SlotManagement/SlotCalender-modal";
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster";

// ---------- Types ----------

export interface BreakItemType {
  id: string; // frontend id
  label: string;
  breakStart: string; // full ISO string
  breakEnd: string; // full ISO string
}

export interface DaySchedule {
  id: string;
  name: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  date:Date;
  breaks: BreakItemType[];
}

export interface BackendBreak {
  label: string;
  breakStart: string; // full ISO string
  breakEnd: string;
}

export interface BackendDay {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
  breaks: BackendBreak[];
}

export interface BackendData {
  days: BackendDay[];
}
// ---------- Component ----------
const WorkManagementPage: React.FC = () => {
  const worker = useSelector(
    (state: RootState) => state.workerTokenSlice.worker
  );
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, []);
  const fetchSchedule = async () => {
    try {
      setLoading(true);
      console.log("Fetching schedule for:", worker?.email);

      const response = await workerService.getWorkingDetails(
        String(worker?.email)
      );
      const backendData = response.data.data;

      console.log("before transformation", backendData.days);

      const transformedDays = transformedData(backendData);

      setSchedule(transformedDays);

      console.log(" Transformed Schedule:", transformedDays);
    } catch (error) {
      console.error(" Failed to fetch schedule:", error);
    } finally {
      setLoading(false);
    }
  };
  const transformedData = (backendData: BackendData) => {
    return backendData.days.map((dayObj: any, index: number) => {
      // ✅ Use a safe reference date
      const baseDate = new Date();

      const toIso = (time: string) => {
        if (!time) return new Date().toISOString(); // fallback
        const [hours, minutes] = time.split(":").map(Number);
        const d = new Date(baseDate);
        d.setHours(hours || 0, minutes || 0, 0, 0);
        return d.toISOString();
      };

      return {
        id: `${index}-${dayObj.day}`,
        name: dayObj.day,
        enabled: dayObj.enabled,
        startTime: toIso(dayObj.startTime),
        endTime: toIso(dayObj.endTime),
        date:dayObj.date,
        breaks: (dayObj.breaks || []).map((b: any, idx: number) => ({
          id: `break-${index}-${idx}`,
          label: b.label || `Break ${idx + 1}`,
          breakStart: toIso(b.breakStart),
          breakEnd: toIso(b.breakEnd),
        })),
      };
    });
  };

  const generateBreakId = (): string =>
    `break_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const updateDay = (
    dayId: string,
    field: keyof DaySchedule,
    value: string | boolean
  ) => {
    setSchedule((prev) =>
      prev.map((day) => (day.id === dayId ? { ...day, [field]: value } : day))
    );
  };

  const addBreak = (dayId: string) => {
    setSchedule((prev) =>
      prev.map((day) => {
        if (day.id !== dayId) return day;

        const baseDate = new Date(day.startTime); // full ISO with date

        const breakStart = new Date(baseDate);
        breakStart.setHours(12, 0, 0, 0);

        const breakEnd = new Date(baseDate);
        breakEnd.setHours(13, 0, 0, 0);

        const newBreak: BreakItemType = {
          id: generateBreakId(),
          label: "New Break",
          breakStart: breakStart.toISOString(),
          breakEnd: breakEnd.toISOString(),
        };

        return { ...day, breaks: [...day.breaks, newBreak] };
      })
    );
  };

  const removeBreak = (dayId: string, breakId: string) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? { ...day, breaks: day.breaks.filter((b) => b.id !== breakId) }
          : day
      )
    );
  };

  const updateBreak = (
    dayId: string,
    breakId: string,
    field: keyof BreakItemType,
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.id === dayId
          ? {
              ...day,
              breaks: day.breaks.map((b) =>
                b.id === breakId ? { ...b, [field]: value } : b
              ),
            }
          : day
      )
    );
  };

  const copyFirstDayToAll = () => {
    const firstActiveDay = schedule.find((day) => day.enabled);
    if (!firstActiveDay) return;

    setSchedule((prev) =>
      prev.map((day) =>
        day.enabled && day.id !== firstActiveDay.id
          ? {
              ...day,
              startTime: firstActiveDay.startTime,
              endTime: firstActiveDay.endTime,
              breaks: firstActiveDay.breaks.map((b) => ({
                ...b,
                id: generateBreakId(),
              })),
            }
          : day
      )
    );
  };

  const calculateWorkingHours = (
    startTime: string,
    endTime: string,
    breaks: BreakItemType[]
  ) => {
    const start = new Date(startTime);
    let end = new Date(endTime);

    if (end < start) {
      end = new Date(endTime);
    }

    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);

    const totalBreakMinutes = breaks.reduce((total, breakItem) => {
      const breakStart = new Date(breakItem.breakStart);
      const breakEnd = new Date(breakItem.breakEnd);
      const breakMinutes =
        (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
      return total + (breakMinutes > 0 ? breakMinutes : 0);
    }, 0);

    const workingMinutes = Math.max(0, totalMinutes - totalBreakMinutes);
    const hours = Math.floor(workingMinutes / 60);
    const minutes = workingMinutes % 60;

    return { hours, minutes, totalMinutes: workingMinutes };
  };

  const validateBreakTime = (startIso: string, endIso: string) => {
    const start = new Date(startIso);
    const end = new Date(endIso);
    return start < end;
  };

  const getBreakIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("lunch")) return Utensils;
    if (lowerLabel.includes("dinner")) return Utensils;
    if (lowerLabel.includes("tea") || lowerLabel.includes("coffee"))
      return Coffee;
    if (lowerLabel.includes("night")) return Moon;
    return Coffee;
  };
  const isoToHHMM = (iso: string) => {
    if (!iso) return "00:00";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const saveSchedule = async () => {
    try {
      // 🔄 Convert schedule back to backend format
      const payload = {
        days: schedule.map((day) => ({
          day: day.name,
          enabled: day.enabled,
          date:day.date,
          startTime: isoToHHMM(day.startTime), // convert ISO → HH:mm
          endTime: isoToHHMM(day.endTime), // convert ISO → HH:mm
          breaks: day.breaks.map((b) => ({
            label: b.label,
            breakStart: isoToHHMM(b.breakStart), // keep full ISO for breaks
            breakEnd: isoToHHMM(b.breakEnd),
          })),
        })),
      };

      console.log("📤 Sending payload to backend:", payload);

      const response = await workerService.updateWorkingDetails(
        String(worker?.email),
        payload
      );

      // Update frontend state with returned backend data
      const transformedDays = transformedData(response.data.data);
      setSchedule(transformedDays);

      console.log("Schedule updated:", response.data);
      SuccessToast(" Schedule saved successfully!");
    } catch (error) {
      console.error("❌ Failed to save schedule:", error);
      ErrorToast("❌ Failed to save schedule. Please try again.");
    }
  };
  const toTimeValue = (iso: string) => {
    if (!iso) return "00:00";
    const d = new Date(iso);
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(d);
  };
  const updateTime = (oldIso: string, newTime: string) => {
    const d = new Date(oldIso || new Date());
    const [hours, minutes] = newTime.split(":").map(Number);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString(); // always full ISO
  };

  const activeDaysCount = schedule.filter((day) => day.enabled).length;
  const totalWeeklyHours = schedule
    .filter((day) => day.enabled)
    .reduce((total, day) => {
      const { totalMinutes } = calculateWorkingHours(
        day.startTime,
        day.endTime,
        day.breaks
      );
      return total + totalMinutes / 60;
    }, 0);

  // ---------- Sub-components ----------
  if (loading) {
    return (
      <WorkerLayout>
        <Navbar />
        <div className="flex justify-center items-center h-screen">
          <span className="text-gray-600">Loading schedule...</span>
        </div>
      </WorkerLayout>
    );
  }
  const TimeInput: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
    error?: boolean;
  }> = ({ label, value, onChange, disabled = false, error = false }) => (
    <div className="space-y-1.5">
      <Label
        className={`text-xs font-medium ${
          error ? "text-red-600" : "text-gray-600"
        }`}
      >
        {label}
      </Label>
      <Input
        type="time"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`text-sm h-9 ${
          error ? "border-red-300 focus:border-red-500" : ""
        }`}
      />
    </div>
  );

  const BreakItem: React.FC<{
    dayId: string;
    breakItem: BreakItemType;
    dayEnabled: boolean;
  }> = ({ dayId, breakItem, dayEnabled }) => {
    const BreakIcon = getBreakIcon(breakItem.label);
    const isValidTime = validateBreakTime(
      breakItem.breakStart,
      breakItem.breakEnd
    );

    return (
      <div
        className={`p-3 rounded-lg border transition-all ${
          !isValidTime
            ? "border-red-200 bg-red-50"
            : "border-gray-200 bg-gray-50"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <BreakIcon size={16} className="text-gray-500 flex-shrink-0" />
            <Input
              value={breakItem.label}
              onChange={(e) =>
                updateBreak(dayId, breakItem.id, "label", e.target.value)
              }
              disabled={!dayEnabled}
              className="font-medium text-sm border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
              placeholder="Break name"
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => removeBreak(dayId, breakItem.id)}
            disabled={!dayEnabled}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
          >
            <Trash2 size={12} />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <TimeInput
            label="Start"
            value={toTimeValue(breakItem.breakStart)}
            onChange={(e) =>
              updateBreak(
                dayId,
                breakItem.id,
                "breakStart",
                updateTime(breakItem.breakStart, e.target.value)
              )
            }
            disabled={!dayEnabled}
            error={!isValidTime}
          />
          <TimeInput
            label="End"
            value={toTimeValue(breakItem.breakEnd)}
            onChange={(e) =>
              updateBreak(
                dayId,
                breakItem.id,
                "breakEnd",
                updateTime(breakItem.breakEnd, e.target.value)
              )
            }
            disabled={!dayEnabled}
            error={!isValidTime}
          />
        </div>

        {!isValidTime && (
          <div className="flex items-center gap-1 mt-2 text-red-600 text-xs">
            <AlertTriangle size={12} />
            <span>Break start time must be before end time</span>
          </div>
        )}
      </div>
    );
  };

  const DayCard: React.FC<{ day: DaySchedule; index: number }> = ({
    day,
    index,
  }) => {
    const { hours, minutes } = calculateWorkingHours(
      day.startTime,
      day.endTime,
      day.breaks
    );
    const isCrossMidnight = day.startTime > day.endTime;

    return (
      <Card
        key={day.id}
        className={`transition-all duration-200 ${
          day.enabled
            ? "border-blue-200 bg-white shadow-sm"
            : "border-gray-200 bg-gray-50 opacity-75"
        }`}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={day.enabled}
                  onCheckedChange={(checked) =>
                    updateDay(day.id, "enabled", checked)
                  }
                  className="data-[state=checked]:bg-blue-600"
                />
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                  {index + 1}
                </div>
              </div>
              <Input
                value={day.name}
                onChange={(e) => updateDay(day.id, "name", e.target.value)}
                disabled={!day.enabled}
                className="font-semibold text-gray-900 border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                style={{ width: `${day.name.length * 8 + 20}px` }}
              />
            </div>
            <div className="flex items-center gap-2">
              {isCrossMidnight && day.enabled && (
                <Badge variant="secondary" className="text-xs">
                  <Moon size={10} className="mr-1" />
                  Cross-midnight
                </Badge>
              )}
              <div
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  day.enabled
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {day.enabled ? "Active" : "Inactive"}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-6">
          {/* Working Hours */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                Working Hours
              </span>
              {isCrossMidnight && day.enabled && (
                <Badge variant="outline" className="text-xs ml-auto">
                  Next day shift
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <TimeInput
                label="Start Time"
                value={toTimeValue(day.startTime)}
                onChange={(e) =>
                  updateDay(
                    day.id,
                    "startTime",
                    updateTime(day.startTime, e.target.value)
                  )
                }
                disabled={!day.enabled}
              />
              <TimeInput
                label="End Time"
                value={toTimeValue(day.endTime)}
                onChange={(e) =>
                  updateDay(
                    day.id,
                    "endTime",
                    updateTime(day.endTime, e.target.value)
                  )
                }
                disabled={!day.enabled}
              />
            </div>
          </div>

          {/* Breaks Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coffee size={16} className="text-orange-600" />
                <span className="text-sm font-medium text-gray-700">
                  Breaks
                </span>
                <Badge variant="outline" className="text-xs">
                  {day.breaks.length}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => addBreak(day.id)}
                disabled={!day.enabled}
                className="h-7 text-xs"
              >
                <Plus size={12} className="mr-1" />
                Add Break
              </Button>
            </div>

            <div className="space-y-3">
              {day.breaks.map((breakItem) => (
                <BreakItem
                  key={breakItem.id}
                  dayId={day.id}
                  breakItem={breakItem}
                  dayEnabled={day.enabled}
                />
              ))}

              {day.breaks.length === 0 && (
                <div className="text-center py-4 text-gray-500 text-sm border border-dashed border-gray-200 rounded-lg">
                  No breaks configured
                </div>
              )}
            </div>
          </div>

          {/* Working Hours Summary */}
          {day.enabled && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-sm text-blue-800">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Net working hours:</span>
                  <span className="font-bold">
                    {hours}h {minutes > 0 ? `${minutes}m` : ""}
                  </span>
                </div>
                {day.breaks.length > 0 && (
                  <div className="text-xs text-blue-600 mt-1">
                    {day.breaks.length} break{day.breaks.length > 1 ? "s" : ""}{" "}
                    scheduled
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <WorkerLayout>
      <Navbar />

      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Work Schedule Management
                </h1>
                
                <p className="text-gray-600 text-sm sm:text-base">
                  Configure your weekly working hours with custom breaks and
                  shift patterns
                </p>
              </div>
            </div>
            <Button
                  variant="outline"
                  onClick={() => setCalendarModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Calendar className="h-5 w-5" />
                  Manage Calendar
                </Button>

            {/* Summary Stats */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                <span className="text-sm text-gray-600">Active Days: </span>
                <span className="font-semibold text-blue-600">
                  {activeDaysCount}/7
                </span>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                <span className="text-sm text-gray-600">Weekly Hours: </span>
                <span className="font-semibold text-green-600">
                  {Math.floor(totalWeeklyHours)}h{" "}
                  {Math.round((totalWeeklyHours % 1) * 60)}m
                </span>
              </div>
              <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                <span className="text-sm text-gray-600">Total Breaks: </span>
                <span className="font-semibold text-orange-600">
                  {schedule
                    .filter((d) => d.enabled)
                    .reduce((sum, d) => sum + d.breaks.length, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Settings className="text-blue-600" size={20} />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Quick Actions
                    </h3>
                    <p className="text-sm text-gray-600">
                      Apply schedule and breaks to all active days
                    </p>
                  </div>
                </div>
                <Button
                  onClick={copyFirstDayToAll}
                  disabled={activeDaysCount < 2}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <Copy size={16} />
                  Copy First Active Day to All
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Days Schedule */}
          <div className="space-y-4 mb-8">
            {schedule.map((day, index) => (
              <DayCard key={day.id} day={day} index={index} />
            ))}
          </div>

          {/* Save Button */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Ready to save your schedule?
                  </h3>
                  <p className="text-sm text-gray-600">
                    Your changes will be applied immediately after saving.
                  </p>
                </div>
                <Button
                  onClick={saveSchedule}
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8"
                >
                  <Save className="mr-2" size={16} />
                  Save Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
          <CalendarModal
          open={calendarModalOpen}
          onOpenChange={setCalendarModalOpen}
         
        />
        </div>
      </div>
    </WorkerLayout>
  );
};

export default WorkManagementPage;
