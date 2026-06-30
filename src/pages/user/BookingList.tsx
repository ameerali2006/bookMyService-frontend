"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { ChevronLeft, ChevronRight, Eye, Search } from "lucide-react"
import { userService } from "@/api/UserService"
import { ErrorToast } from "@/components/shared/Toaster"
import Header from "@/components/user/shared/Header"
import { formatDate } from "@/utils/timeUtils"
import { cn } from "@/lib/utils"

interface Booking {
  id: string
  serviceName: string
  workerName: string
  date: string
  time: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
}

export default function UserBookingsPage() {
  const navigate = useNavigate()

  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [bookings, setBookings] = useState<Booking[]>([])
  const [total, setTotal] = useState(0)

 
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(handler)
  }, [search])

  
  useEffect(() => {
    fetchBookings()
  }, [page, debouncedSearch])

  const fetchBookings = async () => {
    try {
      console.log(limit,page,debouncedSearch)
      const res = await userService.getBookingList(limit, page, debouncedSearch)
      console.log(res)
      if(res.data.success){
        setBookings(res.data.data.data)
        setTotal(res.data.data.total)
      }else{
        ErrorToast(res.data.message)
        
      }
    } catch (error) {
      console.error(error)
    }
  }

  const totalPages = Math.ceil(total / limit)

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "completed":
        return "secondary"
      case "pending":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "default"
    }
  }

  const handleRowClick = (bookingId: string) => {
    navigate(`/bookings/${bookingId}`)
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-slate-50/50 pt-28 pb-20 px-4 md:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
            <p className="text-slate-500 text-sm">View and manage all your service bookings</p>
          </div>

          <Card className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-50 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800">Booking History</CardTitle>
            </CardHeader>

            <CardContent className="pt-6">
              {/* 🔍 Search Bar */}
              <div className="flex items-center gap-2 mb-6">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by service, worker, date..."
                    className="pl-9 h-11 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-blue-500 text-sm transition-all duration-350"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(1) // Reset to page 1 for new search
                    }}
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-100">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="font-bold text-slate-700">Service</TableHead>
                      <TableHead className="font-bold text-slate-700">Worker</TableHead>
                      <TableHead className="font-bold text-slate-700">Date</TableHead>
                      <TableHead className="font-bold text-slate-700">Time</TableHead>
                      <TableHead className="font-bold text-slate-700">Status</TableHead>
                      <TableHead className="text-right font-bold text-slate-700">Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {bookings.length === 0 ? (
                      <TableRow className="border-0">
                        <TableCell colSpan={6} className="text-center py-10 text-slate-400 italic">
                          No bookings found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      bookings.map((booking) => (
                        <TableRow
                          key={booking.id}
                          className="cursor-pointer hover:bg-slate-50/50 border-slate-100 transition-colors"
                          onClick={() => handleRowClick(booking.id)}
                        >
                          <TableCell className="font-bold text-slate-800">{booking.serviceName}</TableCell>
                          <TableCell className="text-slate-600 font-medium">{booking.workerName}</TableCell>
                          <TableCell className="text-slate-500 font-medium">{formatDate(booking.date)}</TableCell>
                          <TableCell className="text-slate-500 font-medium">{booking.time}</TableCell>

                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-full font-bold text-xs px-2.5 py-0.5",
                                booking.status === "confirmed"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : booking.status === "completed"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : booking.status === "pending"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              )}
                            >
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl font-semibold cursor-pointer transition"
                              onClick={() => handleRowClick(booking.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-5">
                <p className="text-xs text-slate-500 font-medium">
                  Page <b>{page}</b> of <b>{totalPages}</b> ({total} total bookings)
                </p>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl cursor-pointer hover:bg-slate-50 font-semibold h-9 text-xs"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>

                  <Button
                    variant="outline"
                    className="rounded-xl cursor-pointer hover:bg-slate-50 font-semibold h-9 text-xs"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
