"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

import type { WalletTransaction } from "./WalletPage"
import type { WalletTransactionQuery } from "@/interface/shared/wallet"

interface WalletTransactionsTableProps {
  transactions: WalletTransaction[]
  page: number
  totalPages: number
  setPage: (page: number) => void
  loading: boolean
  onFilterChange: (query: Partial<WalletTransactionQuery>) => void
}

export function WalletTransactionsTable({
  transactions,
  page,
  totalPages,
  setPage,
  loading,
  onFilterChange,
}: WalletTransactionsTableProps) {
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const transactionTypes = [
    "TOPUP",
    "HOLD",
    "RELEASE",
    "PAYOUT",
    "REFUND",
    "COMMISSION",
    "ADJUSTMENT",
    "BONUS",
    "PENALTY",
  ] as const

  const handleApplyFilters = () => {
    onFilterChange({
      type: typeFilter !== "all" ? typeFilter : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })
  }

  const handleClearFilters = () => {
    setTypeFilter("all")
    setStatusFilter("all")
    setStartDate("")
    setEndDate("")
    onFilterChange({})
  }

  const getDirectionColor = (direction: "CREDIT" | "DEBIT") =>
    direction === "CREDIT"
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400"

  const getStatusBadge = (status: "SUCCESS" | "PENDING" | "FAILED") => {
    const variants = {
      SUCCESS: "default",
      PENDING: "secondary",
      FAILED: "destructive",
    } as const
    return variants[status]
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "inr",
    }).format(amount)

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {transactionTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="SUCCESS">Success</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

          <div className="flex gap-2">
            <Button size="sm" onClick={handleApplyFilters}>
              Apply
            </Button>
            <Button size="sm" variant="outline" onClick={handleClearFilters}>
              Clear
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading transactions...
          </div>
        ) : transactions.length == 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            No transactions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Direction</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance After</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Description</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{formatDate(tx.createdAt)}</TableCell>
                    <TableCell>{tx.type}</TableCell>
                    <TableCell className={getDirectionColor(tx.direction)}>
                      {tx.direction === "CREDIT" ? "+" : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(tx.balanceAfter)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(tx.status)}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {tx.description?.substring(0, 25) + "..." || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center border-t pt-4">
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page == 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page == totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
