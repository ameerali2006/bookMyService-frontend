"use client"

import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React from "react"
import type { WorkerRegistrationData } from "@/protected/validation/worker/registerZod"

type Props = {
  formData: WorkerRegistrationData
  errors: Record<string, string>
  showPassword: boolean
  isGoogleUser:boolean
  showConfirmPassword: boolean
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>
  setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>
  handleInputChange: (field: string, value: string) => void
  passwordStrength: number
  getStrengthColor: (strength: number) => string
  getStrengthText: (strength: number) => string
}

export default function Step1({
  formData,
  errors,
  showPassword,
  isGoogleUser,
  showConfirmPassword,
  setShowPassword,
  setShowConfirmPassword,
  handleInputChange,
  passwordStrength,
  getStrengthColor,
  getStrengthText,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`rounded-xl ${errors.name ? "border-red-500" : ""}`}
                    readOnly={isGoogleUser}
                  />
                  {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
      
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`rounded-xl ${errors.email ? "border-red-500" : ""}`}
                      readOnly={isGoogleUser}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                  </div>
      
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={`rounded-xl ${errors.phone ? "border-red-500" : ""}`}
                    />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                  </div>
      
                  {!isGoogleUser && (
                    <>
                    <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={`rounded-xl pr-10 ${errors.password ? "border-red-500" : ""}`}
                        
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {formData.password && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${getStrengthColor(passwordStrength)}`}
                              style={{ width: `${passwordStrength}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{getStrengthText(passwordStrength)}</span>
                        </div>
                      </div>
                    )}
                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                  </div>
      
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={`rounded-xl pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                        
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                  </div>
                    </>
                  )}
    </div>
  )
}
