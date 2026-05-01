import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Pages
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Marketplace from './pages/marketplace/Marketplace'
import Cart from './pages/marketplace/Cart'
import Orders from './pages/marketplace/Orders'
import UserProfile from './pages/profile/UserProfile'
import Search from './pages/search/Search'
import AdminApproval from './pages/dashboard/AdminApproval'
import SchoolProfile from './pages/school/SchoolProfile'
import SchoolDetail from './pages/schools/SchoolDetail'
import NotFound from './pages/NotFound'
import StartupProfile from './pages/startup/StartupProfile'
import StartupOrders from './pages/startup/StartupOrders'
import NgoProfile from './pages/dashboard/NgoProfile'
import NgoWorkspaceLayout from './pages/ngo/NgoWorkspaceLayout'
import NgoWorkspaceHome from './pages/ngo/NgoWorkspaceHome'
import NgoWorkspaceFeaturePage from './pages/ngo/NgoWorkspaceFeaturePage'
import VolunteerLayout from './pages/volunteer/VolunteerLayout'
import VolunteerHome from './pages/volunteer/VolunteerHome'
import VolunteerFeaturePage from './pages/volunteer/VolunteerFeaturePage'
import NgoDetail from './pages/ngo/NgoDetail'
import UserMessages from './pages/messages/UserMessages'
import SpecialLayout from './pages/special/SpecialLayout'
import SpecialHome from './pages/special/SpecialHome'
import SpecialProfilePage from './pages/special/SpecialProfilePage'
import SpecialJobsPage from './pages/special/SpecialJobsPage'
import SpecialFeaturePage from './pages/special/SpecialFeaturePage'
import SpecialHelpPage from './pages/special/SpecialHelpPage'
import SpecialSavedPage from './pages/special/SpecialSavedPage'
import SpecialRequestsHistoryPage from './pages/special/SpecialRequestsHistoryPage'
import GuardianLayout from './pages/guardian/GuardianLayout'
import GuardianHome from './pages/guardian/GuardianHome'
import GuardianProfilePage from './pages/guardian/GuardianProfilePage'
import GuardianJobsPage from './pages/guardian/GuardianJobsPage'
import GuardianFeaturePage from './pages/guardian/GuardianFeaturePage'
import GuardianHelpPage from './pages/guardian/GuardianHelpPage'
import GuardianSavedPage from './pages/guardian/GuardianSavedPage'
import GuardianProgressPage from './pages/guardian/GuardianProgressPage'
import GuardianRequestsHistoryPage from './pages/guardian/GuardianRequestsHistoryPage'
import SchoolWorkspaceLayout from './pages/school-workspace/SchoolWorkspaceLayout'
import SchoolWorkspaceHome from './pages/school-workspace/SchoolWorkspaceHome'
import SchoolWorkspaceFeaturePage from './pages/school-workspace/SchoolWorkspaceFeaturePage'
import { PublicOnlyRoute, RoleRoute } from './components/common/RoleRoute'
import GeneralUserLayout from './layouts/GeneralUserLayout'

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicOnlyRoute><Home /></PublicOnlyRoute>} />
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route element={<RoleRoute><GeneralUserLayout /></RoleRoute>}>
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/dashboard/profile" element={<UserProfile />} />
        </Route>
        <Route path="/search" element={<Search />} />
        <Route path="/schools/:id" element={<SchoolDetail />} />
        <Route path="/ngos/:id" element={<NgoDetail />} />
        <Route path="/messages" element={<RoleRoute allowedRoles={['USER', 'SPECIAL_ABLED_PERSON', 'GUARDIAN_CAREGIVER']}><UserMessages /></RoleRoute>} />
        <Route path="/volunteer/dashboard" element={<RoleRoute allowedRoles={['VOLUNTEER', 'SUPER_ADMIN']}><Navigate to="/volunteer" replace /></RoleRoute>} />
        <Route path="/volunteer" element={<RoleRoute allowedRoles={['VOLUNTEER', 'SUPER_ADMIN']}><VolunteerLayout /></RoleRoute>}>
          <Route index element={<VolunteerHome />} />
          <Route path="opportunities" element={<VolunteerFeaturePage type="opportunities" />} />
          <Route path="ngo-needs" element={<VolunteerFeaturePage type="ngo-needs" />} />
          <Route path="events" element={<VolunteerFeaturePage type="events" />} />
          <Route path="schools" element={<VolunteerFeaturePage type="schools" />} />
          <Route path="stories" element={<VolunteerFeaturePage type="stories" />} />
          <Route path="applications" element={<VolunteerFeaturePage type="applications" />} />
        </Route>
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
          <Route path="requests" element={<SpecialRequestsHistoryPage />} />
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
          <Route path="requests" element={<GuardianRequestsHistoryPage />} />
          <Route path="saved" element={<GuardianSavedPage />} />
          <Route path="progress" element={<GuardianProgressPage />} />
        </Route>
        <Route path="/ngo" element={<RoleRoute allowedRoles={['NGO_ADMIN', 'SUPER_ADMIN']}><NgoWorkspaceLayout /></RoleRoute>}>
          <Route index element={<NgoWorkspaceHome />} />
          <Route path="requirements" element={<NgoWorkspaceFeaturePage type="requirements" />} />
          <Route path="support-requests" element={<NgoWorkspaceFeaturePage type="support-requests" />} />
          <Route path="volunteers" element={<NgoWorkspaceFeaturePage type="volunteers" />} />
          <Route path="campaigns" element={<NgoWorkspaceFeaturePage type="campaigns" />} />
          <Route path="events" element={<NgoWorkspaceFeaturePage type="events" />} />
          <Route path="jobs" element={<NgoWorkspaceFeaturePage type="jobs" />} />
          <Route path="products" element={<NgoWorkspaceFeaturePage type="products" />} />
          <Route path="services" element={<NgoWorkspaceFeaturePage type="services" />} />
          <Route path="achievements" element={<NgoWorkspaceFeaturePage type="achievements" />} />
          <Route path="messages" element={<NgoWorkspaceFeaturePage type="messages" />} />
          <Route path="csr" element={<NgoWorkspaceFeaturePage type="csr" />} />
        </Route>
        <Route path="/school-workspace" element={<RoleRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}><SchoolWorkspaceLayout /></RoleRoute>}>
          <Route index element={<SchoolWorkspaceHome />} />
          <Route path="students" element={<SchoolWorkspaceFeaturePage type="students" />} />
          <Route path="programs" element={<SchoolWorkspaceFeaturePage type="programs" />} />
          <Route path="staff" element={<SchoolWorkspaceFeaturePage type="staff" />} />
          <Route path="admissions" element={<SchoolWorkspaceFeaturePage type="admissions" />} />
          <Route path="therapy" element={<SchoolWorkspaceFeaturePage type="therapy" />} />
          <Route path="events" element={<SchoolWorkspaceFeaturePage type="events" />} />
          <Route path="achievements" element={<SchoolWorkspaceFeaturePage type="achievements" />} />
          <Route path="ngo-partners" element={<SchoolWorkspaceFeaturePage type="ngo-partners" />} />
          <Route path="messages" element={<SchoolWorkspaceFeaturePage type="messages" />} />
        </Route>

        {/* Protected Routes */}
        <Route path="/dashboard" element={<RoleRoute><Dashboard /></RoleRoute>} />
        <Route path="/admin/approvals" element={<RoleRoute allowedRoles={['SUPER_ADMIN']}><AdminApproval /></RoleRoute>} />
        <Route path="/school/profile" element={<RoleRoute allowedRoles={['SCHOOL_ADMIN', 'SUPER_ADMIN']}><SchoolProfile /></RoleRoute>} />
        <Route path="/startup/profile" element={<RoleRoute allowedRoles={['STARTUP_ADMIN', 'SUPER_ADMIN']}><StartupProfile /></RoleRoute>} />
        <Route path="/startup/orders" element={<RoleRoute allowedRoles={['STARTUP_ADMIN', 'SUPER_ADMIN']}><StartupOrders /></RoleRoute>} />
        <Route path="/ngo/profile" element={<RoleRoute allowedRoles={['NGO_ADMIN', 'SUPER_ADMIN']}><NgoProfile /></RoleRoute>} />

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App

