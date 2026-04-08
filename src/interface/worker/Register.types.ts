import type { Dispatch, SetStateAction, ChangeEvent } from "react"

export interface WorkerFormData {
  name:string
  email: string
  phone: string
  password: string
  confirmPassword: string
  category: string
  experience: string
  documents: File | null
  latitude: string
  longitude: string
  zone: string
}

export interface StepProps {
  formData: WorkerFormData
  errors: Record<string, string>
  handleInputChange: (field: string, value: string) => void
  handleFileUpload?: (event: ChangeEvent<HTMLInputElement>) => void
  showPassword?: boolean
  setShowPassword?: Dispatch<SetStateAction<boolean>>
  showConfirmPassword?: boolean
  setShowConfirmPassword?: Dispatch<SetStateAction<boolean>>
}