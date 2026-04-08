"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Edit3, Plus, Home, Building, X } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"

import AddAddressModal from "./AddAddress"
import { userService } from "@/api/UserService"
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster"


export type AddressLabel = "Home" | "Work" | "Shop";

export interface Address {
  _id: string;
  
  label: AddressLabel;
  buildingName: string;
  street: string;
  area: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  isPrimary: boolean;
  icon?: typeof Home; // optional, frontend-only icon mapping
}


export function AddressesSection() {
  const [addresses,setAddresses] = useState<Address[]>([])
  const [open, setOpen] = useState(false) 
  useEffect(()=>{
    fetchAddresses()
  },[])
  async function fetchAddresses() {
      try {
        const res = await userService.getUserAddress()
        console.log(res)
        if(!res.data.addresses){
          setOpen(true)
          return 
        }
        const withIcons = (res.data.addresses as Address[]).map(addr=> ({
          ...addr,
          icon: addr.label === "Home" ? Home : Building
        }));
        
        setAddresses(withIcons);
        
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      }
    }
    const handleSetDefault=async(addressId:string)=>{
      try {
    if (!addressId) {
      ErrorToast("Address ID missing")
      return
    }

    const response = await userService.setPrimaryAddress(addressId)

    if (response.data.success) {
      SuccessToast("Default address updated successfully")
    
      fetchAddresses() 
    } else {
      ErrorToast(response.data.message || "Failed to update default address")
    }
  } catch (error) {
    console.error("Error setting default address:", error)
    ErrorToast("Something went wrong while setting default address")
  }
    }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Addresses</h1>
          <p className="text-muted-foreground">Manage your saved addresses for service bookings.</p>
        </div>
        

        {/* Modal Trigger */}
        <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Address
        </Button>
      </div>
      

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => {
          const IconComponent =address.icon || Home;
          return (
            <Card key={address._id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-md">
                    <IconComponent className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-lg">{address.label}</CardTitle>
                </div>
                {address.isPrimary && <Badge variant="secondary">Default</Badge>}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-foreground font-medium">{address.buildingName}</p>
                    <p className="text-muted-foreground">
                      {address.city}, {address.state} {address.pinCode}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                    <Edit3 className="h-3 w-3" />
                    Edit
                  </Button>
                  {!address.isPrimary && (
                    <Button variant="outline" size="sm" onClick={()=>handleSetDefault(address._id)}>
                      Set as Default
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              Add New Address
              <DialogClose asChild>
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </DialogTitle>
          </DialogHeader>

          {/* Your form goes here */}
          <AddAddressModal open={open} onClose={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
