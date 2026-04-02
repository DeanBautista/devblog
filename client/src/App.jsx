import React, { useEffect } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

import Login from "./pages/admin/Login"
import Dashboard from "./pages/admin/Dashboard"
import PostEditor from "./pages/admin/post-editor"
import Posts from "./pages/admin/posts/index"
import Tags from "./pages/admin/tags"
import Home from "./pages/public/Home"
import Article from "./pages/public/article/index"
import ArticleDetail from "./pages/public/article/detail"
import About from "./pages/public/About"

import ProtectedRoute from "./routes/ProtectedRoute"
import useAuthStore from "./stores/authStore"
import PublicRoute from "./routes/PublicRoute"
import { Navigate } from "react-router-dom";
import SideBar from "./components/SideBar"
import PublicLayout from "./components/public/PublicLayout"

function App() {

  const { init, loading, user } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  if (loading) return null;

  
  return (
    <Router>
      <Routes>
        <Route element={
          <PublicRoute>
            <PublicLayout />
          </PublicRoute>
        }>
          <Route path="/" element={<Home />} />
          <Route path="/article" element={<Article />} />
          <Route path="/article/:slug" element={<ArticleDetail />} />
          <Route path="/about" element={<About />} />
        </Route>

        <Route path="/admin/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
          } />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <SideBar page="dashboard">
              <Dashboard />
            </SideBar>
          </ProtectedRoute>
        } />

        <Route path="/admin/posts" element={
          <ProtectedRoute>
            <SideBar page="posts">
              <Posts />
            </SideBar>
          </ProtectedRoute>
        } />

        <Route path="/admin/newposts" element={
          <ProtectedRoute>
            <SideBar page="newposts">
              <PostEditor />
            </SideBar>
          </ProtectedRoute>
        } />

        <Route path="/admin/tags" element={
          <ProtectedRoute>
            <SideBar page="tags">
              <Tags />
            </SideBar>
          </ProtectedRoute>
        } />

        <Route path="/admin/*" element={<Navigate to={user ? "/admin/dashboard" : "/"} replace />} />
        <Route path="*" element={<Navigate to={user ? "/admin/dashboard" : "/"} replace />} />
      </Routes>
    </Router>
  )
}

export default App
