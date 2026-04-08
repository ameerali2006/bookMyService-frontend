"use client"

import { Upload, Check } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import React from "react"
import type { WorkerRegistrationData } from "@/protected/validation/worker/registerZod"

type Category = {
  value: string
  label: string
  icon: React.ElementType
  color: string
}

type Props = {
  formData: WorkerRegistrationData
  errors: Record<string, string>
  handleInputChange: (field: string, value: string) => void
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  workCategories: Category[]
}

export default function Step2({
  formData,
  errors,
  handleInputChange,
  handleFileUpload,
  workCategories,
}: Props) { 
  return (
    <div className="space-y-6">
      <div className="space-y-2">
                    <Label htmlFor="category">Work Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger className={`rounded-xl ${errors.category ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select your work category" />
                      </SelectTrigger>
                      <SelectContent>
                        {workCategories.map((category) => {
                          const IconComponent = category.icon
                          return (
                            <SelectItem key={category.value} value={category.value}>
                              <div className="flex items-center gap-2">
                                <IconComponent className={`w-4 h-4 ${category.color}`} />
                                <span>{category.label}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
                  </div>
      
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
                      <SelectTrigger className={`rounded-xl ${errors.experience ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Select your experience level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1">0-1 years</SelectItem>
                        <SelectItem value="2-5">2-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.experience && <p className="text-red-500 text-sm">{errors.experience}</p>}
                  </div>
      
                  <div className="space-y-2">
                    <Label>Upload Documents</Label>
                    <Card className="border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors">
                      <CardContent className="p-6">
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              Drag and drop your documents here, or{" "}
                              <label
                                htmlFor="file-upload"
                                className="text-[#051F54] hover:text-blue-500 cursor-pointer font-medium"
                              >
                                click to browse
                              </label>
                            </p>
                            <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                          </div>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                          />
                        </div>
                        {formData.documents && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-green-800">{formData.documents.name}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
    </div>
  )
}
