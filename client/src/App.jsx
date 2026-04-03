import React, { useEffect } from "react"
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Route,
  RouterProvider,
} from "react-router-dom"

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
import SideBar from "./components/SideBar"
import PublicLayout from "./components/public/PublicLayout"

function AuthAwareRedirect() {
  const { user } = useAuthStore();

  return <Navigate to={user ? "/admin/dashboard" : "/"} replace />;
}

const appRouter = createBrowserRouter(
  createRoutesFromElements(
    <>
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

      <Route path="/admin/newposts/id/:postId" element={
        <ProtectedRoute>
          <SideBar page="newposts">
            <PostEditor />
          </SideBar>
        </ProtectedRoute>
      } />

      <Route path="/admin/newposts/:slug" element={
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

      <Route path="/admin/*" element={<AuthAwareRedirect />} />
      <Route path="*" element={<AuthAwareRedirect />} />
    </>
  )
);

function App() {
  const { init, loading } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  if (loading) return null;

  return (
    <RouterProvider router={appRouter} />
  )
}

export default App
