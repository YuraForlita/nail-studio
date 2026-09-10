import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Bookings from './pages/Bookings'
import Clients from './pages/Clients'
import Services from './pages/Services'
import Expenses from './pages/Expenses'
import Reports from './pages/Reports'

export default function App() {
  return (
    <AuthProvider>
      {/* HashRouter — щоб посилання коректно працювали на GitHub Pages без серверних роутів */}
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Bookings />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/services" element={<Services />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
