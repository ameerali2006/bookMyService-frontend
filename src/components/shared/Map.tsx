"use client"

import { useEffect, useRef } from "react"
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  center: [number, number]
  onLocationSelect: (lat: number, lng: number) => void
}

export default function MapComponent({ center, onLocationSelect }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const initMap = async () => {
      try {
        // Import Leaflet CSS
        const leafletCSS = document.createElement("link")
        leafletCSS.rel = "stylesheet"
        leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(leafletCSS)

        // Import Leaflet JS
        

        // Fix default marker icons
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })

        // Initialize map
        if (!mapInstanceRef.current && mapRef.current) {
          mapInstanceRef.current = L.map(mapRef.current).setView(center, 5)

          // Add tile layer
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          }).addTo(mapInstanceRef.current)

          // Add initial marker
          markerRef.current = L.marker(center).addTo(mapInstanceRef.current)

          // Handle map clicks
          mapInstanceRef.current.on("click", (e: any) => {
            onLocationSelect(e.latlng.lat, e.latlng.lng)
          })
        }
      } catch (error) {
        console.error("Failed to load map:", error)
      }
    }

    initMap()

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current) {
      // Update map view with proper null check
      const currentZoom = mapInstanceRef.current.getZoom() || 5
      mapInstanceRef.current.setView(center, currentZoom)

      // Update marker position
      markerRef.current.setLatLng(center)
    }
  }, [center])

  return <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
}
