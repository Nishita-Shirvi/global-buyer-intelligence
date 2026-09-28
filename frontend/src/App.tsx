import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import BuyerDiscovery from './pages/BuyerDiscovery'
import BuyerProfile from './pages/BuyerProfile'
import Dashboard from './pages/Dashboard'
import DataSources from './pages/DataSources'
import Markets from './pages/Markets'
import Products from './pages/Products'

export default function App() {
  return (
    <Routes>
      {/* Dashboard: full-screen, works without the backend. The globe inside it is lazy-loaded. */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route element={<MainLayout />}>
        <Route path="/buyers" element={<BuyerDiscovery />} />
        <Route path="/buyers/:id" element={<BuyerProfile />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/products" element={<Products />} />
        <Route path="/data-sources" element={<DataSources />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
