"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import Sidebar from "@/components/admin/Sidebar"
import Navbar from "@/components/admin/Navbar"
import Footer from "@/components/user/shared/Footer"
import html2canvas from "html2canvas"
import { Pagination } from "@/components/ui/Pagination"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Download, Filter, Phone, Mail, Briefcase } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { adminManagement } from "@/api/AdminManagement"
import { SuccessToast, ErrorToast } from "@/components/shared/Toaster"
import { Switch } from "@/components/ui/switch"
import { DataTable, type TableColumn } from "@/components/shared/DataTable"
import { useDebounce } from "@/hook/useDebounce"


interface Worker {
  _id: string
  name: string
  email: string
  phone?: string
  isBlocked: boolean
  isVerified: boolean
  category: string
  experience: number
  profileImage?: string
  createdAt: string
}

const WorkerManagement: React.FC = () => {
  const navigate = useNavigate()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [total, setTotal] = useState(0)
  useEffect(() => {
  fetchWorkers(currentPage, pageSize, sortBy, sortOrder, debouncedSearch)
}, [currentPage, pageSize, sortBy, sortOrder, searchTerm])




const fetchWorkers = async (page = 1, limit = 10, sortBy = "", sortOrder: "asc" | "desc" = "asc", search = "") => {
  setLoading(true)
  try {
    const response = await adminManagement.getAllWorkers( page, limit, sortBy, sortOrder, search )
    if (response.status === 200) {
      console.log(response)
      setWorkers(response.data.users)
      setTotal(response.data.totalItems)
      setCurrentPage(response.data.currentPage)
    } else {
      ErrorToast("Failed to fetch workers.")
    }
  } catch (err) {
    ErrorToast("Something went wrong.")
  } finally {
    setLoading(false)
  }
}

  const handleToggleWorkerStatus = async (id: string, currentStatus: boolean) => {
    setUpdateLoading(id)
    try {
      const response = await adminManagement.updateWorkerStatus(id, !currentStatus)
      if (response.status === 200) {
        setWorkers(prev =>
          prev.map(w =>
            w._id === id ? { ...w, isBlocked: !currentStatus } : w
          )
        )
        SuccessToast(`Worker ${!currentStatus ? 'blocked' : 'unblocked'} successfully`)
      } else {
        ErrorToast("Failed to update status")
      }
    } catch (err) {
      ErrorToast("Error updating status")
    } finally {
      setUpdateLoading(null)
    }
  }


  const filteredAndSorted = useMemo(() => {
    console.log("workers"+workers)
    const filtered = workers.filter(w =>
      w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.phone && w.phone.includes(searchTerm))
    )

    if (sortBy) {
      filtered.sort((a, b) => {
        const aVal = sortBy in a ? a[sortBy as keyof Worker] : undefined
        const bVal = sortBy in b ? b[sortBy as keyof Worker] : undefined

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }
        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal
        }
        return 0
      })
    }

    return filtered
  }, [workers, searchTerm, sortBy, sortOrder])

  
  const columns: TableColumn<Worker>[] = [
    {
      key: "name",
      title: "Worker",
      
      sortable: true,
      render: (_val, record) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-gray-200">
            <AvatarImage src={record.profileImage || "/placeholder.svg"} />
            <AvatarFallback>{record.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{record.name}</p>
            <p className="text-sm text-gray-500">{record.category}</p>
          </div>
        </div>
      )
    },
    {
      key: "contact",
      title: "Contact",
      
      render: (_v, r) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2"><Mail className="w-4 h-4" /> {r.email}</div>
          {r.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> {r.phone}</div>}
        </div>
      )
    },
    {
      key: "status",
      title: "Status",
      
      render: (_v, r) => (
        <Badge className={r.isBlocked ?"bg-red-100 text-red-700" :"bg-green-100 text-green-700" }>
          {r.isBlocked ? "Blocked": "Active"}
        </Badge>
      )
    },
    {
      key: "experience",
      title: "Experience",
      
      sortable: true,
      render: val => <span>{val as number} yrs</span>
    },
    {
      key: "createdAt",
      title: "Joined",
      
      sortable: true,
      render: val => <span>{new Date(val as string).toLocaleDateString()}</span>
    },
    {
      key: "toggle",
      title: "Toggle",
      
      align: "center",
      render: (_val, record) => (
        <Switch
          
          checked={record.isBlocked}
          onCheckedChange={() => handleToggleWorkerStatus(record._id, record.isBlocked)}
          disabled={updateLoading === record._id}
        />
      )
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <Sidebar activeItem="WorkerManagement" onItemClick={() => {}} onLogout={() => {
        localStorage.removeItem("adminToken")
        sessionStorage.clear()
        navigate("/admin/login")
      }} />
      <Navbar userName="Admin" onSearch={setSearchTerm} />
      <main className="lg:ml-64 pt-24 p-4 sm:p-6 lg:p-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Worker Management</h1>
              <p className="text-slate-500 text-sm mt-0.5">Manage and verify worker details and accounts</p>
            </div>
            {/* <Button
              variant="outline"
              onClick={() => console.log("export")}
              className="rounded-xl border-slate-200 hover:bg-slate-50 font-semibold cursor-pointer h-10 text-slate-700 w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2 text-blue-600" /> Export
            </Button> */}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white p-6">
              <CardContent className="p-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
                <p className="text-2xl font-extrabold text-slate-800 mt-1">{workers.length}</p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white p-6">
              <CardContent className="p-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active</span>
                <p className="text-2xl font-extrabold text-green-600 mt-1">{workers.filter(w => !w.isBlocked).length}</p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white p-6">
              <CardContent className="p-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Blocked</span>
                <p className="text-2xl font-extrabold text-rose-655 mt-1">{workers.filter(w => w.isBlocked).length}</p>
              </CardContent>
            </Card>
            <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white p-6">
              <CardContent className="p-0">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified</span>
                <p className="text-2xl font-extrabold text-blue-600 mt-1">{workers.filter(w => w.isVerified).length}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Search worker..."
                    className="w-full pl-9 pr-4 h-11 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all outline-none text-slate-700"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => console.log("Filter clicked")}
                  className="rounded-xl border-slate-200 hover:bg-slate-50 font-semibold cursor-pointer h-11 text-slate-700 w-full sm:w-auto shrink-0"
                >
                  <Filter className="w-4 h-4 mr-2 text-blue-600" /> Filter
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-3xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredAndSorted}
              loading={loading}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(key, order) => {
                setSortBy(key)
                setSortOrder(order)
              }}
            />
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <Pagination
              current={currentPage}
              total={total}
              pageSize={pageSize}
              onChange={(page, newSize) => {
                setCurrentPage(page)
                if (newSize) setPageSize(newSize)
              }}
              showSizeChanger
              showQuickJumper
              showTotal={(t, range) => (
                <span className="text-xs font-semibold text-slate-500">
                  Showing {range[0]} to {range[1]} of {t} workers
                </span>
              )}
            />
          </div>
        </div>
      </main>
      <div className="lg:ml-64 p-6">
        <Footer />
      </div>
    </div>
  )
}

export default WorkerManagement
