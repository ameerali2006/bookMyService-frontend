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
        const aVal = (a as any)[sortBy]
        const bVal = (b as any)[sortBy]

        if (typeof aVal === "string") {
          return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
        }
        if (typeof aVal === "number") {
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
      render: val => <span>{val} yrs</span>
    },
    {
      key: "createdAt",
      title: "Joined",
      
      sortable: true,
      render: val => <span>{new Date(val).toLocaleDateString()}</span>
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
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem="WorkerManagement" onItemClick={() => {}} onLogout={() => {
        localStorage.removeItem("adminToken")
        sessionStorage.clear()
        navigate("/admin/login")
      }} />
      <Navbar userName="Admin" onSearch={setSearchTerm} />
      <main className="ml-64 pt-16 p-6">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Worker Management</h1>
            <Button variant="outline" onClick={() =>console.log("expoort")}>
              <Download className="w-4 h-4 mr-2" /> Export
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card><CardContent className="p-4">Total: {workers.length}</CardContent></Card>
            <Card><CardContent className="p-4">Active: {workers.filter(w => w.isBlocked).length}</CardContent></Card>
            <Card><CardContent className="p-4">Blocked: {workers.filter(w => !w.isBlocked).length}</CardContent></Card>
            <Card><CardContent className="p-4">Verified: {workers.filter(w => w.isVerified).length}</CardContent></Card>
          </div>

          <Card><CardContent className="p-4 flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search worker..."
                className="w-full pl-10 pr-4 py-2 border rounded"
              />
            </div>
            <Button variant="outline" onClick={() => console.log("Filter clicked")}>
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </CardContent></Card>

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
              <span>Showing {range[0]} to {range[1]} of {t} workers</span>
            )}
          />
        </div>
      </main>
      <div className="ml-64">
        <Footer />
      </div>
    </div>
  )
}

export default WorkerManagement
