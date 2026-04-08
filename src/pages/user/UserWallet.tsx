import { userService } from "@/api/UserService"
import { WalletPage, type Wallet, } from "@/components/shared/Wallet/WalletPage"

import type { WalletTransactionQuery, WalletTransactionResponse } from "@/interface/shared/wallet"
import { useEffect, useState } from "react"





export const metadata = {
  title: "Wallet - Service Booking App",
  description: "Manage your wallet and view transaction history",
}

 export default function UserWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)
    useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await userService.userWalletData()
        console.log(res.data)
        setWallet(res.data.data)
      } catch (err) {
        console.error("Failed to load wallet", err)
      } finally {
        setLoading(false)
      }
    }

    fetchWallet()
  }, [])

  const fetchUserTransactions = async (
    query: WalletTransactionQuery
  ): Promise<WalletTransactionResponse> => {
    const res = await userService.getUserTransactions(query)
    console.log(res.data.data)
    return res.data.data
  }

  if (loading || !wallet) {
    return <div className="p-8">Loading wallet...</div>
  }
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">    
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Wallet Management</h1>
          <p className="mt-2 text-muted-foreground">Manage your funds and view your transaction history</p>
        </div>      
        <WalletPage role={"User"} wallet={wallet} fetchTransactions={fetchUserTransactions} />
      </div>
    </main>
  )
}