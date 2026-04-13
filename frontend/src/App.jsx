import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Marketplace from './pages/marketplace/Marketplace'
import Search from './pages/search/Search'
import AdminApproval from './pages/dashboard/AdminApproval'
import SchoolProfile from './pages/dashboard/SchoolProfile'
import SchoolDetail from './pages/schools/SchoolDetail'
import NotFound from './pages/NotFound'
import StartupProfile from './pages/startup/StartupProfile'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/search" element={<Search />} />
        <Route path="/schools/:id" element={<SchoolDetail />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/approvals" element={<AdminApproval />} />
        <Route path="/school/profile" element={<SchoolProfile />} />
        <Route path="/startup/profile" element={<StartupProfile />} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App

