"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { generateBookingCode } from "@/utils/booking-convert"
export interface Booking {
  id: string
  userId: string
  userName: string
  serviceName: string
  date:string,
  time:string
  address: string
  status:
    | "pending"
    | "confirmed"
    | "in-progress"
    | "awaiting-final-payment"
    | "completed"
    | "cancelled"
  workerResponse:'accepted'| 'rejected'| 'pending'
}
interface BookingsTableProps {
  bookings: Booking[]
  onViewDetails: (bookingId: string) => void
  isLoading?: boolean
}
const WORKER_RESPONSE_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
}
const STATUS_COLORS: Record<Booking["status"], { badge: string; text: string }> = {
  pending: { badge: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", text: "Pending" },
  confirmed: { badge: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200", text: "Confirmed" },
  "in-progress": {
    badge: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    text: "In Progress",
  },
  "awaiting-final-payment": {
    badge: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    text: "Awaiting Payment",
  },
  completed: { badge: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", text: "Completed" },
  cancelled: { badge: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", text: "Cancelled" },
}

export function BookingsTable({ bookings, onViewDetails, isLoading }: BookingsTableProps) {
  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Booking ID</TableHead>
            <TableHead>User Name</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Scheduled Date & Time</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Worker Response</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-28 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-28 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell>
                <div className="h-6 w-20 bg-muted animate-pulse rounded" />
              </TableCell>
              <TableCell className="text-right">
                <div className="h-8 w-20 bg-muted animate-pulse rounded ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Booking ID</TableHead>
            <TableHead className="whitespace-nowrap">User Name</TableHead>
            <TableHead className="whitespace-nowrap">Service</TableHead>
            <TableHead className="whitespace-nowrap">Scheduled Date & Time</TableHead>
            <TableHead className="whitespace-nowrap">Address</TableHead>
             <TableHead className="whitespace-nowrap">Worker Response</TableHead>
            <TableHead className="whitespace-nowrap">Status</TableHead>
            <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking) => {
            const statusConfig = STATUS_COLORS[booking.status]
            return (
              <TableRow key={booking.id} className="hover:bg-muted/50">
                <TableCell className="font-mono text-sm font-medium">{ generateBookingCode(booking.id)}</TableCell>
                <TableCell>{booking.userName}</TableCell>
                <TableCell>{booking.serviceName}</TableCell>
                <TableCell className="text-sm">{booking.date} at {booking.time}</TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground" title={booking.address}>
                  {booking.address}
                </TableCell>
                <TableCell>
                  <Badge className={WORKER_RESPONSE_COLORS[booking.workerResponse]}>
                    {booking.workerResponse}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={cn("whitespace-nowrap", statusConfig.badge)}>{statusConfig.text}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => onViewDetails(booking.id)} className="gap-1">
                    <span className="hidden sm:inline">View Details</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
