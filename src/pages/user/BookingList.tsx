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

  return (<>
    <Header/>
    <div className="min-h-screen bg-background p-4  md:p-8 mt-14">
      <div className="mx-auto max-w-6xl space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">View and manage all your service bookings</p>
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
          </CardHeader>

          <CardContent>
            
            {/* 🔍 Search Bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by service, worker, date..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1) // Reset to page 1 for new search
                  }}
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No bookings found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking) => (
                      <TableRow
                        key={booking.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(booking.id)}
                      >
                        <TableCell className="font-medium">{booking.serviceName}</TableCell>
                        <TableCell>{booking.workerName}</TableCell>
                        <TableCell>{formatDate( booking.date)}</TableCell>
                        <TableCell>{booking.time}</TableCell>

                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRowClick(booking.id)
                            }}
                          >
                            <Eye className="h-4 w-4" /> View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between border-t pt-4">
              <p className="text-sm text-muted-foreground">
                Page <b>{page}</b> of <b>{totalPages}</b> ({total} total bookings)
              </p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft /> Previous
                </Button>

                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight />
                </Button>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
}
