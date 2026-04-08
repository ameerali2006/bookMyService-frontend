"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import CropImageModal from "@/components/shared/ImageCropModal.";

interface Props {
  open: boolean;
  setOpen: (v: boolean) => void;
  onCreate: (data: any) => void;
}

export default function CreateServiceModal({ open, setOpen, onCreate }: Props) {
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    price: "",          // <-- now string
    priceUnit: "per job",
    duration: "",        // <-- now string
    image: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [cropOpen, setCropOpen] = useState(false);

  const handleCropComplete = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  // -----------------------------
  // VALIDATION
  // -----------------------------
  const validate = () => {
    const newErrors: any = {};

    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";

    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = "Valid price is required";

    if (!formData.duration || Number(formData.duration) <= 0)
      newErrors.duration = "Valid duration is required";

    if (!formData.image)
      newErrors.image = "Service image is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // -----------------------------
  // SUBMIT
  // -----------------------------
  const handleSubmit = () => {
    if (!validate()) return;

    const finalData = {
      ...formData,
      price: Number(formData.price),
      duration: Number(formData.duration),
    };

    onCreate(finalData);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Service</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">

            {/* Category */}
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input
                placeholder="Category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
              {errors.category && (
                <p className="text-xs text-red-500">{errors.category}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
              {errors.description && (
                <p className="text-xs text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Price + Unit */}
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Price"
                  value={formData.price}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, ""); // only numbers
                    setFormData({ ...formData, price: digits });
                  }}
                />
                {errors.price && (
                  <p className="text-xs text-red-500">{errors.price}</p>
                )}
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium">Price Unit</label>
                <Select
                  value={formData.priceUnit}
                  onValueChange={(v) =>
                    setFormData({ ...formData, priceUnit: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per hour">Per Hour</SelectItem>
                    <SelectItem value="per job">Per Job</SelectItem>
                    <SelectItem value="per item">Per Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="text-sm font-medium">Duration (minutes)</label>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="Duration"
                value={formData.duration}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "");
                  setFormData({ ...formData, duration: digits });
                }}
              />
              {errors.duration && (
                <p className="text-xs text-red-500">{errors.duration}</p>
              )}
            </div>

            {/* Image */}
            <div>
              <label className="text-sm font-medium">Service Image</label>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setCropOpen(true)}
              >
                Upload & Crop
              </Button>

              {formData.image && (
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-24 h-24 rounded-md border mt-3"
                />
              )}

              {errors.image && (
                <p className="text-xs text-red-500">{errors.image}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CropImageModal
        open={cropOpen}
        onClose={() => setCropOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </>
  );
}
