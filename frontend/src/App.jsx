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
import SpecialLayout from './pages/special/SpecialLayout'
import SpecialHome from './pages/special/SpecialHome'
import SpecialProfilePage from './pages/special/SpecialProfilePage'
import SpecialJobsPage from './pages/special/SpecialJobsPage'
import SpecialFeaturePage from './pages/special/SpecialFeaturePage'
import SpecialHelpPage from './pages/special/SpecialHelpPage'
import SpecialSavedPage from './pages/special/SpecialSavedPage'
import GuardianLayout from './pages/guardian/GuardianLayout'
import GuardianHome from './pages/guardian/GuardianHome'
import GuardianProfilePage from './pages/guardian/GuardianProfilePage'
import GuardianJobsPage from './pages/guardian/GuardianJobsPage'
import GuardianFeaturePage from './pages/guardian/GuardianFeaturePage'
import GuardianHelpPage from './pages/guardian/GuardianHelpPage'
import GuardianSavedPage from './pages/guardian/GuardianSavedPage'
import GuardianProgressPage from './pages/guardian/GuardianProgressPage'
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
        <Route path="/messages" element={<RoleRoute allowedRoles={['USER', 'SPECIAL_ABLED_PERSON', 'GUARDIAN_CAREGIVER']}><UserMessages /></RoleRoute>} />
        <Route path="/volunteer/dashboard" element={<RoleRoute allowedRoles={['VOLUNTEER', 'SUPER_ADMIN']}><VolunteerDashboard /></RoleRoute>} />
        <Route path="/special" element={<RoleRoute allowedRoles={['SPECIAL_ABLED_PERSON', 'SUPER_ADMIN']}><SpecialLayout /></RoleRoute>}>
          <Route index element={<SpecialHome />} />
          <Route path="profile" element={<SpecialProfilePage />} />
          <Route path="jobs" element={<SpecialJobsPage />} />
          <Route path="marketplace" element={<SpecialFeaturePage type="marketplace" />} />
          <Route path="ngos" element={<SpecialFeaturePage type="ngos" />} />
          <Route path="training" element={<SpecialFeaturePage type="training" />} />
          <Route path="events" element={<SpecialFeaturePage type="events" />} />
          <Route path="campaigns" element={<SpecialFeaturePage type="campaigns" />} />
          <Route path="schemes" element={<SpecialFeaturePage type="schemes" />} />
          <Route path="help" element={<SpecialHelpPage />} />
          <Route path="saved" element={<SpecialSavedPage />} />
        </Route>
        <Route path="/guardian" element={<RoleRoute allowedRoles={['GUARDIAN_CAREGIVER', 'SUPER_ADMIN']}><GuardianLayout /></RoleRoute>}>
          <Route index element={<GuardianHome />} />
          <Route path="profile" element={<GuardianProfilePage />} />
          <Route path="jobs" element={<GuardianJobsPage />} />
          <Route path="schools" element={<GuardianFeaturePage type="schools" />} />
          <Route path="ngos" element={<GuardianFeaturePage type="ngos" />} />
          <Route path="learning" element={<GuardianFeaturePage type="learning" />} />
          <Route path="events" element={<GuardianFeaturePage type="events" />} />
          <Route path="therapy" element={<GuardianFeaturePage type="therapy" />} />
          <Route path="help" element={<GuardianHelpPage />} />
          <Route path="saved" element={<GuardianSavedPage />} />
          <Route path="progress" element={<GuardianProgressPage />} />
        </Route>

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

