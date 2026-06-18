import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Pages
import { Home } from '../pages/events/Home';
import { EventDetails } from '../pages/events/EventDetails';
import { LoginRegister } from '../pages/auth/LoginRegister';
import { UserDashboard } from '../pages/dashboard/UserDashboard';
import { VolunteerDashboard } from '../pages/dashboard/VolunteerDashboard';
import { OrganizerDashboard } from '../pages/dashboard/OrganizerDashboard';
import { AdminDashboard } from '../pages/dashboard/AdminDashboard';
import { NotFound } from '../pages/errors/NotFound';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<LoginRegister />} />
      <Route path="/event/:id" element={<EventDetails />} />
      
      {/* User Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      } />
      
      {/* Volunteer Routes */}
      <Route path="/volunteer" element={
        <ProtectedRoute allowedRoles={['ROLE_VOLUNTEER', 'ROLE_ADMIN']}>
          <VolunteerDashboard />
        </ProtectedRoute>
      } />
      
      {/* Organizer Routes */}
      <Route path="/organizer" element={
        <ProtectedRoute allowedRoles={['ROLE_ORGANIZER', 'ROLE_ADMIN']}>
          <OrganizerDashboard />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
