import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout/layout'
import { DashboardPage } from '@/pages/dashboard'
import { AppsPage } from '@/pages/apps'
import { AgentsPage } from '@/pages/agents'
import { EscrowsPage } from '@/pages/escrows'
import { WorkersPage } from '@/pages/workers'
import { WalletPage } from '@/pages/wallet'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="apps" element={<AppsPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="escrows" element={<EscrowsPage />} />
            <Route path="workers" element={<WorkersPage />} />
            <Route path="wallet" element={<WalletPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
