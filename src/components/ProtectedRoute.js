import React from 'react';
import { Navigate } from 'react-router-dom';

// TODO: Replace this with Firebase auth check later
const isAuthenticated = true;

export default function ProtectedRoute({ children }) {
  return isAuthenticated ? children : <Navigate to="/login" />;
}
