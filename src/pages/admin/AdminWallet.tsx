import { adminManagement } from "@/api/AdminManagement"
import Navbar from "@/components/admin/Navbar"
import Sidebar from "@/components/admin/Sidebar"
import { WalletPage, type Wallet } from "@/components/shared/Wallet/WalletPage"

import type {
  WalletTransactionQuery,
  WalletTransactionResponse,
} from "@/interface/shared/wallet"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function AdminWallet() {
  const navigate = useNavigate()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await adminManagement.adminWalletData()
        setWallet(res.data.data)
      } catch (err) {
        console.error("Failed to load admin wallet", err)
      } finally {
        setLoading(false)
      }
    }

    fetchWallet()
  }, [])

  const fetchAdminTransactions = async (
    query: WalletTransactionQuery
  ): Promise<WalletTransactionResponse> => {
    const res = await adminManagement.getAdminTransactions(query)
    return res.data.data
  }

  if (loading || !wallet) {
    return <div className="p-8">Loading wallet...</div>
  }

  return (
    <div className="flex min-h-screen bg-background pt-10">
      <Sidebar
        activeItem="Wallet"
        onItemClick={() => {}}
        onLogout={() => {
          localStorage.removeItem("adminToken")
          sessionStorage.clear()
          navigate("/admin/login")
        }}
      />

      <div className="flex-1 ml-64">
        <Navbar userName="Admin" onSearch={() => {}} />

        <main className="p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">
              Wallet Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your funds and view your transaction history
            </p>
          </div>

          <WalletPage
            role="Admin"
            wallet={wallet}
            fetchTransactions={fetchAdminTransactions}
          />
        </main>
      </div>
    </div>
  )
}
