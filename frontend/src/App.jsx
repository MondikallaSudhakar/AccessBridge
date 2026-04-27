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
import SchoolProfile from './pages/school/SchoolProfile'
import SchoolDetail from './pages/schools/SchoolDetail'
import NotFound from './pages/NotFound'
import StartupProfile from './pages/startup/StartupProfile'
import NgoProfile from './pages/dashboard/NgoProfile'
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard'
import NgoDetail from './pages/ngo/NgoDetail'
import UserMessages from './pages/messages/UserMessages'
import SpecialAbledProfile from './pages/special/SpecialAbledProfile'
import GuardianProfile from './pages/guardian/GuardianProfile'
import { PublicOnlyRoute, RoleRoute } from './components/common/RoleRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/search" element={<Search />} />
        <Route path="/schools/:id" element={<SchoolDetail />} />
        <Route path="/ngos/:id" element={<NgoDetail />} />
        <Route path="/messages" element={<RoleRoute allowedRoles={['USER']}><UserMessages /></RoleRoute>} />
        <Route path="/volunteer/dashboard" element={<RoleRoute allowedRoles={['VOLUNTEER', 'SUPER_ADMIN']}><VolunteerDashboard /></RoleRoute>} />
        <Route path="/special/profile" element={<RoleRoute allowedRoles={['SPECIAL_ABLED_PERSON', 'SUPER_ADMIN']}><SpecialAbledProfile /></RoleRoute>} />
        <Route path="/guardian/profile" element={<RoleRoute allowedRoles={['GUARDIAN_CAREGIVER', 'SUPER_ADMIN']}><GuardianProfile /></RoleRoute>} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<RoleRoute><Dashboard /></RoleRoute>} />
        <Route path="/admin/approvals" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><AdminApproval /></RoleRoute>} />
        <Route path="/school/profile" element={<RoleRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}><SchoolProfile /></RoleRoute>} />
        <Route path="/startup/profile" element={<RoleRoute allowedRoles={['STARTUP_ADMIN', 'SUPER_ADMIN']}><StartupProfile /></RoleRoute>} />
        <Route path="/ngo/profile" element={<RoleRoute allowedRoles={['NGO_ADMIN', 'SUPER_ADMIN']}><NgoProfile /></RoleRoute>} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App

