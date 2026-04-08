"use client"

import { userService } from "@/api/UserService"
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster"
import type { RootState } from "@/redux/store"
import React from "react"
import { useSelector } from "react-redux"


type LabelOption = "Home" | "Work" | "Shop" | ""

type AddressForm = {
  label: LabelOption
  buildingName: string
  street: string
  area: string
  city: string
  state: string
  country: string
  phone: string
  pinCode: string
  landmark: string
  latitude: string
  longitude: string
}

type Props = {
  open: boolean
  onClose: () => void
  initialData?: Partial<AddressForm>
}

const emptyForm: AddressForm = {
  label: "",
  buildingName: "",
  street: "",
  area: "",
  city: "",
  state: "",
  country: "",
  phone: "",
  pinCode: "",
  landmark: "",
  latitude: "",
  longitude: "",
}

export default function  AddAddressModal({ open, onClose, initialData }: Props) {
  const { lat: savedLat, lng: savedLng } = useSelector(
    (state: RootState) => state.userTokenSlice.location as {lat:number,lng:number}
  )

  const [form, setForm] = React.useState<AddressForm>({
    ...emptyForm,
    ...(initialData || {}),
  })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [geoLoading, setGeoLoading] = React.useState(false)

  const overlayRef = React.useRef<HTMLDivElement>(null)
  const dialogRef = React.useRef<HTMLDivElement>(null)


  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`
      )
      const data = await res.json()

      if (data?.address) {
        const addr = data.address
        setForm((prev) => ({
          ...prev,
          latitude: String(lat),
          longitude: String(lng),
          area: addr.suburb || addr.neighbourhood || prev.area,
          city: addr.city || addr.town || addr.village || prev.city,
          state: addr.state || prev.state,
          country: addr.country || prev.country,
          pinCode: addr.postcode || prev.pinCode,
          street: addr.road || prev.street,
        }))
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err)
    }
  }


  React.useEffect(() => {
    if (open) {
      setErrors({})
      setForm({ ...emptyForm, ...(initialData || {}) })
      const id = setTimeout(() => dialogRef.current?.focus(), 0)
      const prev = document.body.style.overflow
      document.body.style.overflow = "hidden"

      
      if (savedLat && savedLng) {
        reverseGeocode(Number(savedLat), Number(savedLng))
      }

      return () => {
        clearTimeout(id)
        document.body.style.overflow = prev
      }
    }
  }, [open, initialData, savedLat, savedLng])

  const isRequired = (val: string) => val.trim().length > 0

  const validate = () => {
    const e: Record<string, string> = {}
    if (!isRequired(form.label)) e.label = "Required"
    if (!isRequired(form.buildingName)) e.houseName = "Required"
    if (!isRequired(form.street)) e.street = "Required"
    if (!isRequired(form.area)) e.area = "Required"
    if (!isRequired(form.city)) e.city = "Required"
    if (!isRequired(form.state)) e.state = "Required"
    if (!isRequired(form.country)) e.country = "Required"
    if (!isRequired(form.pinCode)) e.postalCode = "Required"
    if (!isRequired(form.phone)) e.phone = "Required"
    else if (!/^\d{10}$/.test(form.phone)) e.phone = "Invalid phone number"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    const latitude = form.latitude.trim() ? Number(form.latitude) : undefined
    const longitude = form.longitude.trim() ? Number(form.longitude) : undefined

    const newAddress = {
      label: form.label as Exclude<LabelOption, "">,
      buildingName: form.buildingName.trim(),
      street: form.street.trim(),
      area: form.area.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim(),
      pinCode: form.pinCode.trim(),
      landmark: form.landmark.trim(),
      phone: form.phone.trim(),
      latitude,
      longitude,
    }

    try {
      const res = await userService.addUserAddress(newAddress)

      if (res.data.success) {
        console.log("Address saved:", res.data.address)
        SuccessToast("Address saved successfully!")
        onClose()
      } else {
        ErrorToast(res.data.message || "Failed to save address")
      }
    } catch (error) {
      console.error("Error saving address:", error)
      ErrorToast("Something went wrong while saving the address.")
    }
  }

  const onOverlayClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === overlayRef.current) onClose()
  }

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === "Escape") onClose()
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({
        ...prev,
        latitude: "Geolocation not supported",
        longitude: "Geolocation not supported",
      }))
      return
    }
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        await reverseGeocode(lat, lng)
        setGeoLoading(false)
      },
      (err) => {
        setGeoLoading(false)
        setErrors((prev) => ({
          ...prev,
          latitude: err.message,
          longitude: err.message,
        }))
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const inputClass =
    "w-full rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground/80 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
  const labelClass = "text-sm text-muted-foreground"
  const errorClass = "mt-1 text-xs text-destructive"

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      onKeyDown={onKeyDown}
      tabIndex={-1}
      aria-hidden={!open}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-address-title"
        className="w-full sm:max-w-md sm:rounded-lg rounded-t-2xl bg-card text-card-foreground shadow-lg outline-none focus:outline-none"
      >
        <header className="sticky top-0 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <h2 id="add-address-title" className="text-base font-medium text-pretty">
            Add Address
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center rounded-md border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted/80"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
            >
              Save
            </button>
          </div>
        </header>

        <div className="max-h-[80vh] overflow-y-auto p-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelClass}>
                Label <span aria-hidden="true" className="pl-0.5 text-destructive">*</span>
              </label>
              <select
                value={form.label}
                onChange={(e) =>
                  setForm({ ...form, label: e.target.value as LabelOption })
                }
                className={inputClass}
                aria-invalid={!!errors.label}
                aria-describedby={errors.label ? "error-label" : undefined}
              >
                <option value="">Select</option>
                <option value="Home">Home</option>
                <option value="Work">Work</option>
                <option value="Shop">Shop</option>
              </select>
              {errors.label && (
                <p id="error-label" className={errorClass}>
                  {errors.label}
                </p>
              )}
            </div>

            <Field
              label="House Name (Building or Flat No.)"
              value={form.buildingName}
              onChange={(v) => setForm({ ...form, buildingName: v })}
              required
              error={errors.houseName}
              inputClass={inputClass}
              labelClass={labelClass}
              errorClass={errorClass}
              placeholder="e.g., A-304"
            />
            <Field
              label="Phone"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              required
              error={errors.phone}
              inputClass={inputClass}
              labelClass={labelClass}
              errorClass={errorClass}
              placeholder="Enter 10-digit phone number"
              inputMode="tel"
            />

            <Field
              label="Street"
              value={form.street}
              onChange={(v) => setForm({ ...form, street: v })}
              required
              error={errors.street}
              inputClass={inputClass}
              labelClass={labelClass}
              errorClass={errorClass}
              placeholder="Street name"
            />

            <Field
              label="Area"
              value={form.area}
              onChange={(v) => setForm({ ...form, area: v })}
              required
              error={errors.area}
              inputClass={inputClass}
              labelClass={labelClass}
              errorClass={errorClass}
              placeholder="Neighborhood / Area"
            />

            <Field
              label="City"
              value={form.city}
              onChange={(v) => setForm({ ...form, city: v })}
              required
              error={errors.city}
              inputClass={inputClass}
              labelClass={labelClass}
              errorClass={errorClass}
              placeholder="City"
            />

            <Field
              label="State"
              value={form.state}
              onChange={(v) => setForm({ ...form, state: v })}
              required
              error={errors.state}
              inputClass={inputClass}
              labelClass={labelClass}
              errorClass={errorClass}
              placeholder="State / Province"
            />

            <Field
              label="Country"
              value={form.country}
              onChange={(v) => setForm({ ...form, country: v })}
              required
              error={errors.country}
              inputClass={inputClass}
              labelClass={labelClass}
              errorClass={errorClass}
              placeholder="Country"
            />

            <Field
              label="Postal Code"
              value={form.pinCode}
              onChange={(v) => setForm({ ...form, pinCode: v })}
              required
              error={errors.postalCode}
              inputClass={inputClass}
              labelClass={labelClass}
              errorClass={errorClass}
              placeholder="ZIP / Postal Code"
            />

            <Field
              label="Landmark"
              value={form.landmark}
              onChange={(v) => setForm({ ...form, landmark: v })}
              inputClass={inputClass}
              labelClass={labelClass}
              errorClass={errorClass}
              placeholder="Nearby landmark (optional)"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Latitude (optional)"
                value={form.latitude}
                onChange={(v) => setForm({ ...form, latitude: v })}
                inputClass={inputClass}
                labelClass={labelClass}
                errorClass={errorClass}
                error={errors.latitude}
                placeholder="e.g., 28.6139"
                inputMode="decimal"
              />
              <Field
                label="Longitude (optional)"
                value={form.longitude}
                onChange={(v) => setForm({ ...form, longitude: v })}
                inputClass={inputClass}
                labelClass={labelClass}
                errorClass={errorClass}
                error={errors.longitude}
                placeholder="e.g., 77.2090"
                inputMode="decimal"
              />
            </div>

            <div>
              <button
                onClick={getCurrentLocation}
                type="button"
                className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-secondary-foreground hover:bg-secondary/80 disabled:opacity-60"
                disabled={geoLoading}
              >
                {geoLoading ? "Detecting location…" : "Get Current Location"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field(props: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
  error?: string
  placeholder?: string
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>["inputMode"]
  inputClass: string
  labelClass: string
  errorClass: string
}) {
  const { label, value, onChange, required, error, placeholder, inputMode, inputClass, labelClass, errorClass } =
    props
  const id = React.useId()
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span aria-hidden="true" className="pl-0.5 text-destructive">*</span>}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={inputClass}
      />
      {error && (
        <p id={`${id}-error`} className={errorClass}>
          {error}
        </p>
      )}
    </div>
  )
}
