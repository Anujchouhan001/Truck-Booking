import React from 'react';
import { useAuth } from '../auth/AuthContext';
import LandingPage from './LandingPage';
import CustomerDashboard from './CustomerDashboard';
import AdminDashboard from './AdminDashboard';
import LoadBoardPage from './LoadBoardPage';

export default function HomePage() {
  const { user } = useAuth();

  // Show different views based on authentication and role
  // Not logged in -> Landing Page
  if (!user) {
    return <LandingPage />;
  }

  // Admin or SuperAdmin -> Admin Dashboard
  if (user.role === 'admin' || user.role === 'superadmin') {
    return <AdminDashboard />;
  }

  // Driver -> Load Board (to find and quote on loads)
  if (user.role === 'driver') {
    return <LoadBoardPage />;
  }

  // Customer -> Customer Dashboard
  return <CustomerDashboard />;
}

/*
 * DEFAULT PAGES BY USER ROLE:
 * ============================
 * 
 * 1. NOT LOGGED IN (Guest):
 *    - Default: LandingPage (/)
 *    - Can access: Login, Register, Contact
 * 
 * 2. CUSTOMER:
 *    - Default: CustomerDashboard (/)
 *    - Shows: My Posted Loads, Quick Actions (Post Load, My Loads, Find Trucks)
 *    - Can access: Post Load, Load Board (own loads only), Truck Board, Profile, Load Details (own)
 *    - Cannot access: Admin pages, Available Loads from others
 * 
 * 3. DRIVER:
 *    - Default: LoadBoardPage (/) - Find available loads and submit quotes
 *    - Shows: All available loads, filter options, quick quote submission
 *    - Can access: All customer pages + View all loads + Submit quotes + Update load status
 *    - Cannot access: Admin management pages
 * 
 * 4. ADMIN:
 *    - Default: AdminDashboard (/)
 *    - Shows: Stats, Manage Loads, Manage Trucks, Manage Users
 *    - Can access: All pages except Social Media management
 *    - Can: Manage loads, trucks, users (promote to admin requires superadmin)
 * 
 * 5. SUPERADMIN:
 *    - Default: AdminDashboard (/)
 *    - Shows: All Admin features + Social Media management
 *    - Can access: All pages without restrictions
 *    - Can: Create/delete admins, manage social media links
 */
