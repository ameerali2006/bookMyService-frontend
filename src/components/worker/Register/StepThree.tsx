"use client"

import { MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import React from "react"
import type { WorkerRegistrationData } from "@/protected/validation/worker/registerZod"


type Props = {
  formData: WorkerRegistrationData
  errors: Record<string, string>
  handleInputChange: (field: string, value: string) => void
  handleLocation: () => void
  setFormData: React.Dispatch<React.SetStateAction<WorkerRegistrationData>>
}

export default function Step3({
  formData,
  errors,
  handleInputChange,
  handleLocation,
  setFormData,
}: Props) {
  function LocationSelector({ setFormData }: { setFormData: React.Dispatch<React.SetStateAction<WorkerRegistrationData>> }) {

      useMapEvents({
        click(e) {
          const { lat, lng } = e.latlng;
  
          setFormData((prev) => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
          }));
  
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`)
            .then((res) => res.json())
            .then((data) => {
              const city = data?.address?.city || data?.address?.town || data?.address?.village || "";
              setFormData((prev) => ({
                ...prev,
                zone: city,
              }));
            })
            .catch((err) => console.error("Reverse geocoding error:", err));
        },
      });
  
      return null;
    }
  
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input id="latitude" value={formData.latitude} readOnly className="rounded-xl bg-gray-50" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input id="longitude" value={formData.longitude} readOnly className="rounded-xl bg-gray-50" />
                    </div>
                  </div>
      
                  <div className="space-y-2">
                    <Label htmlFor="zone">Service Zone</Label>
                    <Input
                      id="zone"
                      placeholder="Enter your service zone (e.g., Downtown, North Side)"
                      value={formData.zone}
                      onChange={(e) => handleInputChange("zone", e.target.value)}
                      className={`rounded-xl ${errors.zone ? "border-red-500" : ""}`}
                    />
                    {errors.zone && <p className="text-red-500 text-sm">{errors.zone}</p>}
                  </div>
      
                  <Card className="rounded-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="w-5 h-5 text-[#051F54]" />
                        <span className="font-medium">Current Location</span>
                      </div>
                      <MapContainer
                        center={[Number(formData.latitude), Number(formData.longitude)]}
                        zoom={13}
                        style={{ height: "200px", borderRadius: "0.75rem" }}
                      >
                        <TileLayer
                          attribution='&copy; OpenStreetMap contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationSelector setFormData={setFormData} />
                        <Marker position={[Number(formData.latitude), Number(formData.longitude)]} />
                      </MapContainer>
                    </CardContent>
                  </Card>
      
                  <Button
                    variant="outline"
                    className="w-full rounded-xl border-blue-200 text-[#051F54] hover:bg-blue-50 bg-transparent"
                    onClick={() => handleLocation()}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Get Current Location
                  </Button>
    </div>
  )
}
