import { WalletPage, type Wallet } from "@/components/shared/Wallet/WalletPage"
import { WorkerLayout } from "@/components/worker/Dashboard/WorkerLayout"
import { Navbar } from "@/components/worker/Dashboard/WorkerNavbar"
import { workerService } from "@/api/WorkerService"
import type {
  WalletTransactionQuery,
  WalletTransactionResponse,
} from "@/interface/shared/wallet"
import { useEffect, useState } from "react"

export default function WorkerWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await workerService.workerWalletData()
        setWallet(res.data.data)
      } catch (err) {
        console.error("Failed to load worker wallet", err)
      } finally {
        setLoading(false)
      }
    }

    fetchWallet()
  }, [])

  const fetchWorkerTransactions = async (
    query: WalletTransactionQuery
  ): Promise<WalletTransactionResponse> => {
    const res = await workerService.getWorkerTransactions(query)
    return res.data.data
  }

  if (loading || !wallet) {
    return <div className="p-8">Loading wallet...</div>
  }

  return (
    <WorkerLayout>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">
              Wallet Management
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your funds and view your transaction history
            </p>
          </div>

          <WalletPage
            role="Worker"
            wallet={wallet}
            fetchTransactions={fetchWorkerTransactions}
          />
        </div>
      </main>
    </WorkerLayout>
  )
}
