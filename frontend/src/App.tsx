import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './views/HomeView';
import { LoginRegisterView } from './views/LoginRegisterView';
import { EventDetailView } from './views/EventDetailView';
import { UserDashboardView } from './views/UserDashboardView';
import { VolunteerDashboardView } from './views/VolunteerDashboardView';
import { AdminDashboardView } from './views/AdminDashboardView';

// Route guards
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/auth" element={<LoginRegisterView />} />
            <Route path="/event/:id" element={<EventDetailView />} />
            
            {/* Student Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboardView />
              </ProtectedRoute>
            } />
            
            {/* Volunteer Dashboard */}
            <Route path="/volunteer" element={
              <ProtectedRoute allowedRoles={['ROLE_VOLUNTEER', 'ROLE_ADMIN']}>
                <VolunteerDashboardView />
              </ProtectedRoute>
            } />
            
            {/* Admin Dashboard */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <AdminDashboardView />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
