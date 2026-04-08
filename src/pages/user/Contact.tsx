"use client"

import { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import {
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react"

import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Input
} from "@/components/ui/input"
import {
  Textarea
} from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster"
import Header from "@/components/user/shared/Header"

// ================= SCHEMA =================
const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email(),
  phone: z.string().min(10, "Valid phone required"),
  subject: z.string().min(1, "Select subject"),
  message: z.string().min(10, "Message too short"),
})

type ContactFormData = z.infer<typeof contactSchema>

// ================= COMPONENT =================
export default function ContactPage() {
  
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    try {
      setLoading(true)

      await new Promise((res) => setTimeout(res, 1500)) // mock API

      SuccessToast("We will contact you shortly.")
    } catch {
      ErrorToast("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
        <Header/>

      {/* ================= HERO ================= */}
      <section className="bg-gradient-to-r from-blue-600 to-green-500 text-white py-16 text-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="text-4xl font-bold">Contact Us</h1>
          <p className="mt-3 text-lg">
            We’re here to help you with your service needs
          </p>
        </motion.div>
      </section>

      {/* ================= CONTACT CARDS ================= */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-6">
        {[
          { icon: Phone, label: "Phone", value: "+91 98765 43210" },
          { icon: Mail, label: "Email", value: "support@yourapp.com" },
          { icon: MapPin, label: "Location", value: "Kerala, India" },
          { icon: Clock, label: "Working Hours", value: "9 AM – 8 PM" },
        ].map((item, i) => (
          <Card key={i} className="text-center shadow-md rounded-2xl">
            <CardContent className="p-6 flex flex-col items-center gap-3">
              <item.icon className="w-8 h-8 text-blue-600" />
              <h3 className="font-semibold">{item.label}</h3>
              <p className="text-gray-500 text-sm">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ================= FORM + MAP ================= */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10">

        {/* FORM */}
        <Card className="shadow-lg rounded-2xl">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Send a Message</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input placeholder="Full Name" {...register("name")} />
              <p className="text-red-500 text-sm">{errors.name?.message}</p>

              <Input placeholder="Email" {...register("email")} />
              <p className="text-red-500 text-sm">{errors.email?.message}</p>

              <Input placeholder="Phone Number" {...register("phone")} />
              <p className="text-red-500 text-sm">{errors.phone?.message}</p>

              <Select onValueChange={(val) => setValue("subject", val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="booking">Booking</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="complaint">Complaint</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-red-500 text-sm">{errors.subject?.message}</p>

              <Textarea placeholder="Message" {...register("message")} />
              <p className="text-red-500 text-sm">{errors.message?.message}</p>

              <Button className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Submit"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* MAP */}
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <iframe
            src="https://maps.google.com/maps?q=kerala&t=&z=7&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full min-h-[400px]"
            loading="lazy"
          />
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible>
          <AccordionItem value="1">
            <AccordionTrigger>How do I book a service?</AccordionTrigger>
            <AccordionContent>
              Select a service, choose time slot, and confirm booking.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="2">
            <AccordionTrigger>How can I cancel a booking?</AccordionTrigger>
            <AccordionContent>
              Go to your bookings and click cancel.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="3">
            <AccordionTrigger>How do payments work?</AccordionTrigger>
            <AccordionContent>
              You can pay online or after service completion.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-blue-600 text-white text-center py-10">
        <h2 className="text-xl font-semibold mb-3">
          Need urgent help?
        </h2>
        <Button variant="secondary">
          Call Now
        </Button>
      </section>

    </div>
  )
}