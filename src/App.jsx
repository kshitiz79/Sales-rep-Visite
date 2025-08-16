import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Auth from './pages/Auth/Auth'
import AdminDashboard from './dashboard/AdminDashboard'
import Overview from './pages/AdminDashboard/Overview'
import Settings from './pages/AdminDashboard/Settings'
import UserDashboard from './dashboard/UserDashboard'

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="px-4 py-6">
          <Routes>
            {/* Home = Auth */}
            <Route path="/" element={<Auth />} />
            
            {/* Admin dashboard (nested) - Protected for admin roles */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={[
                  'Super Admin', 
                  'Admin', 
                  'Opps Team', 
                  'State Head'
                ]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            >
              <Route index element={<Overview />} />
              <Route path="settings" element={<Settings />} />
              {/* catch unknown under /admin */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>

            {/* User dashboard (nested) - Protected for all authenticated users */}
            <Route 
              path="/user" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* 404 - Redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  )
}