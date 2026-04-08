
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AdminBooking } from "@/interface/admin/booking"
import { useNavigate } from "react-router-dom"

interface AdminBookingCardProps {
  booking: AdminBooking
}

const statusVariants = {
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "in-progress": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-400",
}

export function AdminBookingCard({ booking }: AdminBookingCardProps) {
  const navigate=useNavigate()
  const formattedDate = new Date(booking.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const formattedCreatedAt = new Date(booking.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card className="p-4 transition-shadow hover:shadow-md" onClick={()=>navigate(`/admin/bookings/${booking.id}`)}>
      {/* Mobile Layout */}
      <div className="flex flex-col gap-3 sm:hidden">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Booking ID</p>
            <p className="font-mono text-sm font-medium">{booking.id}</p>
          </div>
          <Badge className={statusVariants[booking.status]}>{booking.status.replace("-", " ")}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Customer</p>
            <p className="text-sm font-medium">{booking.customerName}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Worker</p>
            <p className="text-sm font-medium">{booking.workerName}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Service</p>
          <p className="text-sm font-medium">{booking.serviceName}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Date</p>
            <p className="text-sm">{formattedDate}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="text-sm">
              {booking.startTime} – {booking.endTime}
            </p>
          </div>
        </div>
        <div className="border-t pt-2">
          <p className="text-xs text-muted-foreground">Created {formattedCreatedAt}</p>
        </div>
      </div>

      {/* Desktop Table-like Layout */}
      <div className="hidden items-center gap-4 sm:grid sm:grid-cols-[auto_1fr_1fr_1fr_auto_auto_auto_auto] sm:gap-6">
        <div>
          <p className="text-xs text-muted-foreground">ID</p>
          <p className="font-mono text-sm font-medium">{booking.id}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Customer</p>
          <p className="text-sm font-medium">{booking.customerName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Worker</p>
          <p className="text-sm font-medium">{booking.workerName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Service</p>
          <p className="text-sm">{booking.serviceName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Date</p>
          <p className="text-sm">{formattedDate}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Time</p>
          <p className="text-sm whitespace-nowrap">
            {booking.startTime} – {booking.endTime}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Status</p>
          <Badge className={statusVariants[booking.status]}>{booking.status.replace("-", " ")}</Badge>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Created</p>
          <p className="text-xs text-muted-foreground">{formattedCreatedAt}</p>
        </div>
      </div>
    </Card>
  )
}
