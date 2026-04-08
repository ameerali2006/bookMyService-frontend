"use client"

import { useEffect, useState } from "react"
import { WalletSummary } from "./WalletSummery"
import { WalletActions } from "./WalletAction"
import { WalletTransactionsTable } from "./WalletTransaction"
import { WalletModal } from "./WalletModal"
import type { WalletTransactionQuery, WalletTransactionResponse } from "@/interface/shared/wallet"


type Role = "User" | "Worker" | "Admin"
type ModalType = "topup" | "withdraw" | "commission" | "adjust" | null

export interface Wallet {
  balance: number
  isFrozen: boolean
  lastActivityAt: Date
  role: Role
}

export interface WalletTransaction {
  id: string
  type: "TOPUP" | "HOLD" | "RELEASE" | "PAYOUT" | "REFUND" | "COMMISSION" | "ADJUSTMENT" | "BONUS" | "PENALTY"
  direction: "CREDIT" | "DEBIT"
  amount: number
  balanceBefore: number
  balanceAfter: number
  status: "SUCCESS" | "PENDING" | "FAILED"
  createdAt: Date
  description?: string
}

interface WalletPageProps {
  role: Role
  wallet: Wallet
  fetchTransactions: (
    query: WalletTransactionQuery
  ) => Promise<WalletTransactionResponse>
}

export function WalletPage({ role, wallet, fetchTransactions }: WalletPageProps) {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [openModal, setOpenModal] = useState<ModalType>(null)
  const loadTransactions = async (query: Partial<WalletTransactionQuery> = {}) => {
    setLoading(true)
    try {
      const res = await fetchTransactions({
        page,
        limit: 10,
        ...query,
      })
      console.log("fdkf",res)

      setTransactions(res.transactions)
      setTotalPages(res.pagination.totalPages)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [page])
  
 

  const handleOpenModal = (modalType: ModalType) => {
    setOpenModal(modalType)
  }

  const handleCloseModal = () => {
    setOpenModal(null)
  }

 

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3 md:gap-4">
        <div className="md:col-span-3">
          <WalletSummary wallet={wallet} />
        </div>
      </div>

      <WalletActions role={role} isFrozen={wallet.isFrozen} onOpenModal={handleOpenModal} />

      <WalletTransactionsTable
        transactions={transactions}
        page={page}
        totalPages={totalPages}
        loading={loading}
        setPage={setPage}
        onFilterChange={loadTransactions}
      />

      <WalletModal
        isOpen={openModal !== null}
        modalType={openModal}
        onClose={handleCloseModal}
        isFrozen={wallet.isFrozen}
      />
    </div>
  )
}
