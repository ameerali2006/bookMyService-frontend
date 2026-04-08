"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Label } from "@/components/ui/label"
import { MapPin, Phone, Clock, Calendar, Trash2, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import RejectionConfirmationModal from "./RejectModal"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { workerService } from "@/api/WorkerService"
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster"
// import WorkerCustomerRoute from "./WorkerCustomerRoute"

interface ServiceRequest {
  id: string
  serviceName: string
  userName: string
  date: string
  time: string
  availableTime:string
  location: string
  status: "pending" | "approved" | "rejected"
  userLocation: { lat: number; lng: number }
  notes: string
  phone: string
}
interface AdditionalItem {
  name: string;
 price: number;
}

interface ApprovalData {
  bookingId: string;
  serviceName: string;
  durationHours:number
  distance:number
  additionalItems?: AdditionalItem[];
  additionalNotes?: string;
}

interface RequiredItem {
  id: string
  name: string
  price: string
  description: string
}

interface RequestDetailsModalProps {
  request: ServiceRequest
  onClose: () => void
}

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Number((R * c).toFixed(2))
}

const calculateEstimatedArrival = (distanceKm: number): string => {
  const avgSpeedKmh = 30 // Average speed in km/h
  const timeMinutes = Math.round((distanceKm / avgSpeedKmh) * 60)
  return `${timeMinutes} min`
}

export default function RequestDetailsModal({ request, onClose }: RequestDetailsModalProps) {
  const [durationHours, setDurationHours] = useState("")
  const [itemsRequired, setItemsRequired] = useState<RequiredItem[]>([])
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const workerLocation=useSelector((state:RootState)=>state.workerTokenSlice.worker?.location)
  if(!workerLocation){
    return(<></>)
  }
  const distance = calculateDistance(
    workerLocation.lat,
    workerLocation.lng,
    request.userLocation.lat,
    request.userLocation.lng,
  )
  console.log(distance)
  const estimatedArrival = calculateEstimatedArrival(distance)
  const customerLocation={
    lat:request.userLocation.lat,
    lng:request.userLocation.lng,
  }

  const addItem = () => {
    setItemsRequired([
      ...itemsRequired,
      {
        id: Date.now().toString(),
        name: "",
        price: "",
        description: "",
      },
    ])
  }

  const removeItem = (id: string) => {
    setItemsRequired(itemsRequired.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof RequiredItem, value: string) => {
    setItemsRequired(itemsRequired.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleApprove = async () => {
     const additionalItems: AdditionalItem[] = itemsRequired.map((item) => ({
        name: item.name,
        price: Number(item.price),
      }))

    const approvalData:ApprovalData = {
      bookingId: request.id,
      serviceName: request.serviceName,
      durationHours: Number(durationHours),
      distance,
      additionalItems,
      additionalNotes,
    }
    

    console.log("Service Approved:", approvalData)

    try {
      
      const response =await workerService.serviceApprove(approvalData)
      console.log(response)

      if(response.data.success){
        SuccessToast(response.data.message)
      }else{
        ErrorToast(response.data.message)
      }
    } catch (error) {
      console.error("Error submitting approval:", error)
    }

    onClose()
  }

  const handleRejectClick = () => {
    setShowRejectionModal(true)
  }

  const handleConfirmRejection = async (reason: string) => {
    const rejectionData = {
      bookingId: request.id,
      description:reason,
     
    }

    console.log("Service Rejected:", rejectionData)

    try {
      const response = await workerService.serviceReject(rejectionData)
      if (response.data.success) {
        console.log("Rejection submitted successfully")
      }
    } catch (error) {
      console.error("Error submitting rejection:", error)
    }

    setShowRejectionModal(false)
    onClose()
  }
  const convertToHours = (time?: string): number => {
    if (!time) return 0

    // Case 1: HH:MM format
    if (time.includes(":")) {
      const [hrs, mins] = time.split(":").map(Number)
      if (isNaN(hrs) || isNaN(mins)) return 0
      return hrs + mins / 60
    }

    // Case 2: "3.45" or "3.45 hours"
    const numeric = parseFloat(time)
    if (!isNaN(numeric)) {
      return numeric
    }

    return 0
  }

  const maxAvailableHours = convertToHours(request.availableTime)
  console.log(maxAvailableHours)

  const getProgressValue = () => {
    switch (request.status) {
      case "pending":
        return 33
      case "approved":
        return 66
      default:
        return 100
    }
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">{request.serviceName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-foreground">Service Status</p>
                <span className="text-xs text-muted-foreground">
                  {request.status === "pending" ? "Pending" : request.status === "approved" ? "Approved" : "Completed"}
                </span>
              </div>
              <Progress value={getProgressValue()} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Pending</span>
                <span>Approved</span>
                <span>Completed</span>
              </div>
            </div>

            <div className="w-full h-56 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border border-border flex items-center justify-center relative overflow-hidden">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300">
                {/* Worker location marker */}
                <circle cx="50" cy="150" r="8" fill="#3b82f6" />
                <circle cx="50" cy="150" r="12" fill="#3b82f6" opacity="0.2" />

                {/* Customer location marker */}
                <circle cx="350" cy="150" r="8" fill="#ef4444" />
                <circle cx="350" cy="150" r="12" fill="#ef4444" opacity="0.2" />

                {/* Connection line */}
                <line x1="50" y1="150" x2="350" y2="150" stroke="#6b7280" strokeWidth="2" strokeDasharray="5,5" />

                {/* Labels */}
                <text x="50" y="180" textAnchor="middle" fontSize="12" fill="#374151">
                  You
                </text>
                <text x="350" y="180" textAnchor="middle" fontSize="12" fill="#374151">
                  Customer
                </text>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <p className="text-sm font-semibold text-foreground">Distance: {distance.toFixed(2)} km</p>
                <p className="text-xs text-muted-foreground">Est. Arrival: {estimatedArrival}</p>
              </div>
            </div>

            {/* Request details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-card p-4 rounded-lg border border-border">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Customer Name</p>
                <p className="font-semibold text-foreground">{request.userName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Phone className="w-4 h-4" /> Phone
                </p>
                <p className="font-semibold text-foreground">{request.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Date
                </p>
                <p className="font-semibold text-foreground">{request.date}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Clock className="w-4 h-4" /> Time
                </p>
                <p className="font-semibold text-foreground">{request.time}</p>
              </div>
              <div className="md:col-span-2 flex items-center gap-2 mt-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Available Time
              </span>

              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                {request.availableTime} hrs
              </span>
            </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Location
                </p>
                <p className="font-semibold text-foreground">{request.location}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground mb-1">Service Notes</p>
                <p className="text-foreground">{request.notes}</p>
              </div>
            </div>

            {/* Service completion details */}
            <div className="space-y-4 bg-card p-4 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground">Service Completion Details</h3>

              <div>
                <Label htmlFor="duration-hours" className="text-sm font-medium">
                  Estimated Work Duration (Hours)
                </Label>
                <Input
                  id="duration-hours"
                  type="number"
                  step="0.25"
                  min="0.5"
                  max={maxAvailableHours}
                  placeholder={`Max ${request.availableTime} hrs`}
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Items Required</Label>
                  <Button type="button" onClick={addItem} size="sm" variant="outline" className="gap-1 bg-transparent">
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                </div>

                {itemsRequired.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No items added yet</p>
                ) : (
                  <div className="space-y-3">
                    {itemsRequired.map((item) => (
                      <div key={item.id} className="p-3 bg-background rounded-lg border border-border space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <Input
                            placeholder="Item name"
                            value={item.name}
                            onChange={(e) => updateItem(item.id, "name", e.target.value)}
                            className="text-sm"
                          />
                          <Input
                            placeholder="Price"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, "price", e.target.value)}
                            className="text-sm"
                          />
                          <Button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Item description"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, "description", e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="additional-notes" className="text-sm font-medium">
                  Additional Remarks
                </Label>
                <textarea
                  id="additional-notes"
                  placeholder="Add any additional notes or remarks about the service..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="mt-1 min-h-20 w-100 bg-white "
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleApprove} className="flex-1 bg-green-800 hover:bg-green-900 text-white">
                 Approve Service
              </Button>
              <Button onClick={handleRejectClick} className="flex-1 bg-red-800 hover:bg-red-900 text-white">
                 Reject Service
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showRejectionModal && (
        <RejectionConfirmationModal onConfirm={handleConfirmRejection} onCancel={() => setShowRejectionModal(false)} />
      )}
    </>
  )
}
