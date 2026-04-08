"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin } from "lucide-react"

interface ServicesProps {
  type: "taken" | "booked"
}

const mockServices = {
  taken: [
    {
      id: 1,
      name: "House Cleaning",
      provider: "CleanPro Services",
      date: "2024-01-15",
      time: "10:00 AM",
      location: "Home Address",
      status: "Completed",
      price: "$120",
    },
    {
      id: 2,
      name: "Plumbing Repair",
      provider: "Fix-It Fast",
      date: "2024-01-10",
      time: "2:00 PM",
      location: "Home Address",
      status: "Completed",
      price: "$85",
    },
    {
      id: 3,
      name: "Garden Maintenance",
      provider: "Green Thumb Co.",
      date: "2024-01-05",
      time: "9:00 AM",
      location: "Home Address",
      status: "Completed",
      price: "$150",
    },
  ],
  booked: [
    {
      id: 4,
      name: "Deep Cleaning",
      provider: "Sparkle Clean",
      date: "2024-02-01",
      time: "11:00 AM",
      location: "Home Address",
      status: "Confirmed",
      price: "$180",
    },
    {
      id: 5,
      name: "AC Maintenance",
      provider: "Cool Air Services",
      date: "2024-02-05",
      time: "3:00 PM",
      location: "Home Address",
      status: "Pending",
      price: "$95",
    },
  ],
}

export function ServicesSection({ type }: ServicesProps) {
  const services = mockServices[type]
  const title = type === "taken" ? "Services Taken" : "Booked Services"
  const description =
    type === "taken"
      ? "View your completed service history and past bookings."
      : "Manage your upcoming service appointments and bookings."

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4">
        {services.map((service) => (
          <Card key={service.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{service.name}</h3>
                  <p className="text-sm text-muted-foreground">{service.provider}</p>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(service.status)}>{service.status}</Badge>
                  <p className="text-lg font-semibold text-foreground mt-1">{service.price}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {service.date}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {service.time}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {service.location}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
