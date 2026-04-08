"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import type { WorkerResponse } from "@/pages/worker/AllBooking";

interface BookingsFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  selectedWorkerResponses: WorkerResponse[];
  onWorkerResponseChange: (r: WorkerResponse[]) => void;
  dateRange: { from?: Date; to?: Date };
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const STATUS_OPTIONS = [
  // { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in-progress", label: "In Progress" },
  { value: "awaiting-final-payment", label: "Awaiting Payment" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];
const WORKER_RESPONSE_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

const DATE_PRESETS = {
  today: () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return { from: d, to: d };
  },
  week: () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { from: start, to: end };
  },
  month: () => {
    const now = new Date();
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  },
};

/* ---------------- Date Input ---------------- */

function DateInput({
  label,
  value,
  onChange,
  disabledBefore,
}: {
  label: string;
  value?: Date;
  onChange: (date?: Date) => void;
  disabledBefore?: Date;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[150px] justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "dd MMM yyyy") : label}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          disabled={(date) => (disabledBefore ? date < disabledBefore : false)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

/* ---------------- Main Component ---------------- */

export function BookingsFilter({
  searchQuery,
  onSearchChange,
  selectedStatuses,
  onStatusChange,
  selectedWorkerResponses,
  onWorkerResponseChange,
  dateRange,
  onDateRangeChange,
  onClearFilters,
  hasActiveFilters,
}: BookingsFilterProps) {
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(debouncedSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedSearch, onSearchChange]);
  const isWorkerResponse = (value: string): value is WorkerResponse =>
    value === "pending" || value === "accepted" || value === "rejected";
  return (
    <div className="flex flex-wrap items-center gap-3 p-4">
      {/* Search */}
      <Input
        placeholder="Search by user name..."
        value={debouncedSearch}
        onChange={(e) => setDebouncedSearch(e.target.value)}
        className="w-[260px]"
      />

      {/* Status Select */}
      <Select
        value={selectedStatuses[0] ?? ""}
        onValueChange={(value) => onStatusChange(value ? [value] : [])}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={selectedWorkerResponses[0] ?? ""}
        onValueChange={(value) => {
          
          if (isWorkerResponse(value)) {
            onWorkerResponseChange([value]);
          } else {
            onWorkerResponseChange([]);
          }
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Worker response" />
        </SelectTrigger>
        <SelectContent>
          {WORKER_RESPONSE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Presets */}
      <Select
        onValueChange={(value) => {
          if (value === "today") onDateRangeChange(DATE_PRESETS.today());
          if (value === "week") onDateRangeChange(DATE_PRESETS.week());
          if (value === "month") onDateRangeChange(DATE_PRESETS.month());
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Date preset" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
        </SelectContent>
      </Select>

      {/* From Date */}
      <DateInput
        label="From date"
        value={dateRange.from}
        onChange={(date) => onDateRangeChange({ from: date, to: dateRange.to })}
      />

      {/* To Date */}
      <DateInput
        label="To date"
        value={dateRange.to}
        disabledBefore={dateRange.from}
        onChange={(date) =>
          onDateRangeChange({ from: dateRange.from, to: date })
        }
      />

      {/* Clear */}
      {hasActiveFilters && (
        <Button variant="ghost" size="icon" onClick={onClearFilters}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
