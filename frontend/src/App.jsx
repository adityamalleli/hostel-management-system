import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Page from './components/Page';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRedirect from './components/HomeRedirect';
import MessMenuEditor from './components/MessMenuEditor';
import MessMenuView from './components/MessMenuView';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import AdminOverview from './pages/admin/Overview';
import RoomsPanel from './pages/admin/RoomsPanel';
import ComplaintsPanel from './pages/admin/ComplaintsPanel';
import AdminAttendance from './pages/admin/AttendancePanel';
import QrSession from './pages/admin/QrSession';
import ParentsPanel from './pages/admin/ParentsPanel';
import StudentOverview from './pages/student/Overview';
import StudentAttendance from './pages/student/AttendancePanel';
import StudentComplaints from './pages/student/ComplaintsPanel';
import ParentDashboard from './pages/parent/ParentDashboard';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
          <Route path="/admin" element={<Page title="Dashboard" subtitle="Live overview of occupancy, complaints and attendance."><AdminOverview /></Page>} />
          <Route path="/admin/rooms" element={<Page title="Rooms" subtitle="Create rooms and allocate students."><RoomsPanel /></Page>} />
          <Route path="/admin/complaints" element={<Page title="Complaints" subtitle="Review issues and update their status. Students are notified automatically."><ComplaintsPanel /></Page>} />
          <Route path="/admin/attendance" element={<Page title="Attendance" subtitle="Review records by date and override where needed."><AdminAttendance /></Page>} />
          <Route path="/admin/qr" element={<Page title="QR attendance session" subtitle="Show this screen at the hostel entrance. The code changes every few seconds."><QrSession /></Page>} />
          <Route path="/admin/parents" element={<Page title="Parents" subtitle="Link parent accounts to their ward."><ParentsPanel /></Page>} />
          <Route path="/admin/mess" element={<Page title="Mess menu" subtitle="Edit the weekly menu."><MessMenuEditor /></Page>} />
        </Route>

        <Route element={<ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>}>
          <Route path="/student" element={<Page title="My dashboard" subtitle="Your room, attendance and today's menu at a glance."><StudentOverview /></Page>} />
          <Route path="/student/attendance" element={<Page title="Attendance" subtitle="Scan the QR code on the warden's screen to check in."><StudentAttendance /></Page>} />
          <Route path="/student/complaints" element={<Page title="Complaints" subtitle="Report an issue and track its progress."><StudentComplaints /></Page>} />
          <Route path="/student/mess" element={<Page title="Mess menu" subtitle="This week's meals."><MessMenuView /></Page>} />
        </Route>

        <Route element={<ProtectedRoute roles={['mess_staff']}><Layout /></ProtectedRoute>}>
          <Route path="/mess-staff" element={<Page title="Mess menu" subtitle="Keep the weekly menu up to date."><MessMenuEditor /></Page>} />
        </Route>

        <Route element={<ProtectedRoute roles={['parent']}><Layout /></ProtectedRoute>}>
          <Route path="/parent" element={<Page title="Ward overview" subtitle="Your child's attendance and the mess menu."><ParentDashboard /></Page>} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
