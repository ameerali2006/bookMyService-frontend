"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import Navbar from "@/components/admin/Navbar"
import Sidebar from "@/components/admin/Sidebar"
import Footer from "@/components/user/shared/Footer"
import { Table, } from "@/components/ui/Table"
import { Pagination } from "@/components/ui/Pagination"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Search, Filter, Download, Phone, Mail, User } from 'lucide-react'
import { useNavigate } from "react-router-dom"
import { authService} from "@/api/AuthService"
import { adminManagement } from "@/api/AdminManagement"
import { ErrorToast, SuccessToast } from "@/components/shared/Toaster"
import { DataTable, type TableColumn } from "@/components/shared/DataTable"
import { useDebounce } from "@/hook/useDebounce"


interface User {

  _id: string
  name: string
  email: string
  phone?: string
  
  isBlocked: boolean
  isGoogleUser: boolean
  role?: string
  createdAt: string
  updatedAt: string
}

interface UserStats {
  totalUsers: number
  activeUsers: number
  blockedUsers: number
  googleUsers: number
}

const UserManagement: React.FC = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearch = useDebounce(searchTerm, 500)
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [activeMenuItem, setActiveMenuItem] = useState("UserManagement")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState<string | null>(null)
  const [totalUsers, setTotalUsers] = useState(0)

  useEffect(() => {
    console.log("useEffect is workeing")
    fetchUsers()
  },[currentPage, pageSize, searchTerm, sortBy, sortOrder])

  const fetchUsers = async (): Promise<void> => {
    setLoading(true)
    try {
      console.log(currentPage, pageSize, searchTerm, sortBy, sortOrder)
      const response = await adminManagement.getAllUsers(currentPage, pageSize, debouncedSearch, sortBy, sortOrder)
      console.log(response)
      if (response.status === 200 && response.data) {
        setUsers(response.data.users)
        setTotalUsers(response.data.totalItems)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
     
  }

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean): Promise<void> => {
    console.log('helloo toggle')
    setUpdateLoading(userId)
    try {
      console.log("id",userId)
      const newStatus = !currentStatus
      const response = await adminManagement.updateUserStatus(userId, newStatus)
    
      if (response.status==200) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId
              ? { ...user, isBlocked: newStatus }
              : user
          )
        )
        SuccessToast(`User ${newStatus ? 'activated' : 'blocked'} successfully`)
        console.log(`User ${newStatus ? 'activated' : 'blocked'} successfully`)
      } else {
        ErrorToast('Failed to update user status!')
        console.error('Failed to update user status:')
      }
    } catch (error) {
      ErrorToast('Failed to update user status!')
      console.error('Error updating user status:', error)
    } finally {
      setUpdateLoading(null)
    }
  }

  const filteredAndSortedData = useMemo(() => {
    const filtered = users.filter(
      (user) =>
        user.name ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
    )

    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = (a as any)[sortBy]
        const bValue = (b as any)[sortBy]

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue
        }
        if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          return sortOrder === "asc" 
            ? (aValue === bValue ? 0 : aValue ? 1 : -1)
            : (aValue === bValue ? 0 : aValue ? -1 : 1)
        }

        return 0
      })
    }
    console.log("filter"+[...filtered])

    return filtered
  }, [users, searchTerm, sortBy, sortOrder])

  

  const handleMenuItemClick = (item: string): void => {
    setActiveMenuItem(item)
  }

  const handleLogout = async (): Promise<void> => {
    localStorage.removeItem("adminToken")
    sessionStorage.clear()
    navigate("/admin/login")
  }

  const handleSearch = (query: string): void => {
    setSearchTerm(query)
    setCurrentPage(1)
  }

  const handleSort = (key: string, order: "asc" | "desc"): void => {
    setSortBy(key)
    setSortOrder(order)
  }

  const handlePageChange = (page: number, newPageSize?: number): void => {
    
    if (newPageSize) {
      
      setPageSize(newPageSize)
      setCurrentPage(1)
    }else{
      setCurrentPage(page)
      console.log(page,currentPage)
    }
  }

  const handleExport = (): void => {
    console.log('Exporting user data...')
  }

  const handleFilter = (): void => {
    console.log('Opening filter options...')
  }

  const columns: TableColumn<User>[] = [
    {
      key: "user",
      title: "User",
      
      sortable: true,
      render: (_value, record) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-gray-200 dark:ring-gray-600">
            <AvatarImage src={ "/placeholder.svg?height=40&width=40"} />
            <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300">
              {record.name}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{record.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{record.role || 'User'}</p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Contact",
      
      render: (_value, record) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900 dark:text-gray-100">{record.email}</span>
          </div>
          {record.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900 dark:text-gray-100">{record.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      
      sortable: true,
      render: (_value, record) => (
        <Badge className={record.isBlocked ?   "bg-red-100 text-red-800":"bg-green-100 text-green-800"}>
          {record.isBlocked ? 'Blocked':'Active'}
        </Badge>
      ),
    },
    {
      key: "toggle",
      title: "Toggle",
      
      align: "center",
      render: (_value, record) => (
        <Switch
          checked={record.isBlocked}
          onCheckedChange={() => handleToggleUserStatus(record._id, record.isBlocked)}
          disabled={updateLoading === record._id}
        />
      ),
    },
    {
      key: "createdAt",
      title: "Join Date",
     
      sortable: true,
      render: value => (
        <span>{typeof value === 'string' ? new Date(value).toLocaleDateString() : 'N/A'}</span>
      ),
    },
  ]

  const stats: UserStats = useMemo(() => ({
    totalUsers: users.length,
    activeUsers: users.filter(u => !u.isBlocked).length,
    blockedUsers: users.filter(u => u.isBlocked).length,
    googleUsers: users.filter(u => u.isGoogleUser).length,
  }), [users])

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem={activeMenuItem} onItemClick={handleMenuItemClick} onLogout={handleLogout} />
      <Navbar userName="Admin" onSearch={handleSearch} />
      <main className="ml-64 pt-16 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage users, roles, and account status</p>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card><CardContent className="p-6"><p>Total Users: {stats.totalUsers}</p></CardContent></Card>
            <Card><CardContent className="p-6"><p>Active Users: {stats.activeUsers}</p></CardContent></Card>
            <Card><CardContent className="p-6"><p>Blocked Users: {stats.blockedUsers}</p></CardContent></Card>
            <Card><CardContent className="p-6"><p>Google Users: {stats.googleUsers}</p></CardContent></Card>
          </div>

          <Card><CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded border dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
              <Button variant="outline" onClick={handleFilter}><Filter className="h-4 w-4 mr-2" /> Filters</Button>
            </div>
          </CardContent></Card>

          <DataTable
            columns={columns}
            data={filteredAndSortedData}
            loading={loading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
          />

          <Pagination
            current={currentPage}
            total={totalUsers}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => (
              <span>Showing {range[0]} to {range[1]} of {total} users</span>
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

export default UserManagement
