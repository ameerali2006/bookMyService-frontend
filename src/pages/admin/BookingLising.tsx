"use client"

import { useEffect, useState } from "react"








import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Search } from "lucide-react"
import { adminManagement } from "@/api/AdminManagement"
import type { AdminBooking } from "@/interface/admin/booking"
import type { BookingStatus } from "../worker/ApprovedServiceDetails"
import Sidebar from "@/components/admin/Sidebar"
import Navbar from "@/components/admin/Navbar"
import { useNavigate } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { AdminBookingCard } from "@/components/admin/Bookings/BookingCard"
import { useDebounce } from "@/hook/useDebounce"

export default function AdminBookingsPage() {
    const navigate=useNavigate()
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)

  // Backend-driven state
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)
  const [status, setStatus] = useState<BookingStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [limit] = useState(5)

  const [total, setTotal] = useState(0)

  const totalPages = Math.ceil(total / limit)

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await adminManagement.getBookings({
        search:debouncedSearch,
        status:status === "all" ? undefined : status,
        page,
        limit,
      })
      console.log(res)
      setBookings(res.data.bookings)
      setTotal(res.data.total)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [search, status, page])
    function LoadingSkeleton() {
    return (<>
        <Sidebar activeItem="WorkerManagement" onItemClick={() => {}} onLogout={() => {
        localStorage.removeItem("adminToken")
        sessionStorage.clear()
        navigate("/admin/login")
      }} />
      <Navbar userName="Admin" onSearch={setSearch} />
        <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-4">
            <div className="flex flex-col gap-3 sm:hidden">
                <div className="flex items-start justify-between">
                <div className="h-10 w-24 animate-pulse rounded bg-muted" />
                <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                <div className="h-10 animate-pulse rounded bg-muted" />
                <div className="h-10 animate-pulse rounded bg-muted" />
                </div>
            </div>
            <div className="hidden animate-pulse gap-6 sm:grid sm:grid-cols-8">
                <div className="h-10 rounded bg-muted" />
                <div className="h-10 rounded bg-muted" />
                <div className="h-10 rounded bg-muted" />
                <div className="h-10 rounded bg-muted" />
                <div className="h-10 rounded bg-muted" />
                <div className="h-10 rounded bg-muted" />
                <div className="h-10 rounded bg-muted" />
                <div className="h-10 rounded bg-muted" />
            </div>
            </Card>
        ))}
        </div>
    </>)
    }
    interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
}

 function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
    </div>
  )
}

  return (<>
   
      <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem="WorkerManagement" onItemClick={() => {}} onLogout={() => {
        localStorage.removeItem("adminToken")
        sessionStorage.clear()
        navigate("/admin/login")
      }} />
      <Navbar userName="Admin" onSearch={setSearch} />
      <main className="ml-64 pt-16 p-6">
        {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold">All Bookings</h2>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customer or worker"
              value={search}
              onChange={(e) => {
                setPage(1)
                setSearch(e.target.value)
              }}
              className="pl-8 w-full sm:w-64"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={status}
            onValueChange={(value) => {
              setPage(1)
              setStatus(value as BookingStatus | "all")
            }}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description="Try adjusting your filters or search terms."
        />
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <AdminBookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
   
      </main>
      </div>
    </>
  )
}
