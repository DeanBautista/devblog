import React, { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Login from "./pages/admin/Login"
import Dashboard from "./pages/admin/Dashboard"
import PostEditor from "./pages/admin/PostEditor"
import Posts from "./pages/admin/Posts"

import ProtectedRoute from "./routes/ProtectedRoute"
import useAuthStore from "./stores/authStore"
import PublicRoute from "./routes/PublicRoute"
import { Navigate } from "react-router-dom";
import SideBar from "./components/SideBar"

function App() {

  const { init, loading } = useAuthStore();

  useEffect(() => {
    init();
  }, []);

  if (loading) return null;

  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
          } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <SideBar page="dashboard">
              <Dashboard />
            </SideBar>
          </ProtectedRoute>
        } />

        <Route path="/posts" element={
          <ProtectedRoute>
            <SideBar page="posts">
              <Posts />
            </SideBar>
          </ProtectedRoute>
        } />

        <Route path="/newposts" element={
          <ProtectedRoute>
            <SideBar page="newposts">
              <PostEditor />
            </SideBar>
          </ProtectedRoute>
        } />

        {/* Catch-all: redirect unknown URLs to /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
