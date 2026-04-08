"use client"

import { useEffect, useState } from "react"
import { Search, Filter, Calendar, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

import { WorkerServicesLoading } from "@/components/worker/WorkerService/Loading"
import { EmptyState } from "@/components/worker/WorkerService/Empty-State"
import { ServiceCard } from "@/components/worker/WorkerService/ServiceCard"
import { WorkerLayout } from "@/components/worker/Dashboard/WorkerLayout"
import { Navbar } from "@/components/worker/Dashboard/WorkerNavbar"
import { workerService } from "@/api/WorkerService"
import { Pagination } from "@/components/ui/Pagination"


export interface WorkerBooking {
  id: string
  customerName: string
  serviceName: string
  date: Date
  startTime: string
  endTime: string
  status: | 'confirmed'
    | 'in-progress' 
    | 'awaiting-final-payment'
}

export function WorkerApprovedServices() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [todayServices, setTodayServices] = useState<WorkerBooking[]>([])
  const [upcomingServices, setUpcomingServices] = useState<WorkerBooking[]>([])

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)

  const [isLoading, setIsLoading] = useState(true)

  const fetchServices = async () => {
    try {
      setIsLoading(true)

      const res = await workerService.getApprovedServices({
        page,
        limit,
        search: searchQuery || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      })
      console.log(res)

      setTodayServices(res.data.today)
      setUpcomingServices(res.data.upcoming)
      setTotal(res.data.pagination.total)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [page, limit, searchQuery, statusFilter])

  if (isLoading) {
    return <WorkerLayout><Navbar /><WorkerServicesLoading /></WorkerLayout>
  }

  return (
    <WorkerLayout>
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Works</h1>
          <p className="mt-1 text-muted-foreground">
            Approved and ongoing services assigned to you
          </p>
        </header>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by customer, service, or booking ID..."
              value={searchQuery}
              onChange={(e) => {
                setPage(1)
                setSearchQuery(e.target.value)
              }}
              className="pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setPage(1)
              setStatusFilter(val)
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="mr-2 size-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Today’s Works */}
        <section className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="size-5" />
            <h2 className="text-xl font-semibold">Today&apos;s Works</h2>
            {!!todayServices.length && (
              <Badge variant="secondary" className="ml-auto">
                {todayServices.length}
              </Badge>
            )}
          </div>

          {todayServices.length === 0 ? (
            <EmptyState
              title="No work scheduled for today"
              description="You have no approved or ongoing services today."
              icon={Calendar}
            />
          ) : (
            <div className="space-y-3">
              {todayServices.map((service) => (
                <ServiceCard key={service.id} service={service} isToday />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming Works */}
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Clock className="size-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Upcoming Works</h2>
            {!!upcomingServices.length && (
              <Badge variant="outline" className="ml-auto">
                {upcomingServices.length}
              </Badge>
            )}
          </div>

          {upcomingServices.length === 0 ? (
            <EmptyState
              title="No upcoming services"
              description="You have no approved services scheduled."
              icon={Clock}
              variant="muted"
            />
          ) : (
            <div className="space-y-3">
              {upcomingServices.map((service) => (
                <ServiceCard key={service.id} service={service} isToday={false} />
              ))}
            </div>
          )}
        </section>

        {/* Pagination */}
        <Pagination
          current={page}
          total={total}
          pageSize={limit}
          onChange={(p, size) => {
            setPage(p)
            if (size) setLimit(size)
          }}
        />
      </div>
    </WorkerLayout>
  )
}
