export interface WalletTransactionQuery {
  page: number
  limit: number
  type?: string
  status?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  startDate?: string
  endDate?: string
}

export interface WalletTransactionResponse {
  transactions: WalletTransaction[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    total: number
  }
}

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