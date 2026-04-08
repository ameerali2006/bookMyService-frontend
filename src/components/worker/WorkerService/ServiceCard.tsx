"use client"

import { Calendar, Clock, User, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getTimeBasedIndicator } from "@/utils/timeUtils"
import { useNavigate } from "react-router-dom"
import { API_ENDPOINTS } from "@/config/constant/apiEndpoint"
import { WORKER_ROUTES } from "@/config/constant/routes/workerRoutes"
import { generateBookingCode } from "@/utils/booking-convert"


type ServiceStatus = | 'confirmed'
    | 'in-progress' 
    | 'awaiting-final-payment'

interface Service {
  id: string
  customerName: string
  serviceName: string
  date: Date
  startTime: string
  endTime: string
  status: ServiceStatus
  
}


interface ServiceCardProps {
  service: Service
  isToday: boolean
}

export function ServiceCard({ service, isToday }: ServiceCardProps) {
  const navigate=useNavigate()
  const statusConfig = {
    "confirmed": {
      label: "Approved",
      className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    },
    "in-progress": {
      label: "In Progress",
      className: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    },
    'awaiting-final-payment': {
      label: "Completed",
      className: "bg-muted text-muted-foreground",
    },
  }

  const currentStatus = statusConfig[service.status]
  const timeIndicator = isToday ? getTimeBasedIndicator(service.startTime, service.status) : null

  const handleViewDetails = () => {

   navigate(`/worker/appointments/approved/${service.id}`)
    console.log(`Navigating to service detail: ${service.id}`)
  }

  return (
    <Card
      className={cn("group cursor-pointer transition-all hover:shadow-md", isToday && "border-primary/20 bg-primary/5")}
      onClick={handleViewDetails}
    >
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Section: Service Info */}
        <div className="flex-1 space-y-2">
          {/* Header Row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">{ generateBookingCode( service.id)}</span>
            {isToday && (
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                Today
              </Badge>
            )}
            <Badge variant="outline" className={currentStatus.className}>
              {currentStatus.label}
            </Badge>
            {timeIndicator && <span className="text-xs font-medium text-primary">{timeIndicator}</span>}
          </div>

          {/* Customer Name */}
          <div className="flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            <h3 className="font-semibold text-foreground">{service.customerName}</h3>
          </div>

          {/* Service Name */}
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{service.serviceName}</p>
          </div>

          {/* Date and Time */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              <span>
                {new Date(service.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4" />
              <span>
                {service.startTime} – {service.endTime}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: CTA */}
        <div className="flex sm:flex-col sm:items-end">
          <Button
            variant={isToday ? "default" : "outline"}
            size="sm"
            className={cn("w-full transition-all sm:w-auto", isToday && "shadow-sm")}
            onClick={handleViewDetails}
          >
            View Details
          </Button>
        </div>
      </div>
    </Card>
  )
}
