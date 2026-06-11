import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ClientDashboard from './pages/ClientDashboard'
import AdminDashboard from './pages/AdminDashboard'
import StaffDashboard from './pages/StaffDashboard'
import StaffManagement from './pages/StaffManagement'
import NewOrder from './pages/NewOrder'
import OrderList from './pages/OrderList'
import OrderDetail from './pages/OrderDetail'
import QuoteOrder from './pages/QuoteOrder'
import Layout from './components/Layout'

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirect = user.role === 'admin' ? '/admin' : 
                     user.role === 'goods_handler' || user.role === 'logistics_handler' ? '/staff' : '/client'
    return <Navigate to={redirect} replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/client" element={
            <ProtectedRoute allowedRoles={['client']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<ClientDashboard />} />
            <Route path="new-order" element={<NewOrder />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/:id" element={<OrderDetail />} />
          </Route>
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="orders/:id/quote" element={<QuoteOrder />} />
            <Route path="staff" element={<StaffManagement />} />
          </Route>
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['goods_handler', 'logistics_handler']}>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<StaffDashboard />} />
            <Route path="orders" element={<OrderList />} />
            <Route path="orders/:id" element={<OrderDetail />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
