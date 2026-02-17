
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminLayout from './components/AdminLayout';
import UserLayout from './components/UserLayout';
import { User, UserRole } from './types';

const App: React.FC = () => {
  // In a real app, we'd check localStorage/sessionStorage for existing tokens here.
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <HashRouter>
      <Routes>
        {/* Public Route: Login */}
        <Route 
          path="/login" 
          element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" replace />} 
        />

        {/* Protected Route: Dashboard */}
        <Route 
          path="/*" 
          element={
            user ? (
              user.role === UserRole.ADMIN ? (
                <AdminLayout user={user} onLogout={handleLogout} />
              ) : (
                <UserLayout user={user} onLogout={handleLogout} />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </HashRouter>
  );
};

export default App;
