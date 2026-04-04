import React, { useEffect, useState } from "react"
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

function AppStartupLoader() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 text-on-surface">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(42rem 24rem at 76% 12%, rgba(73, 75, 214, 0.2), transparent 68%), linear-gradient(180deg, rgba(11, 19, 38, 1) 0%, rgba(7, 15, 33, 1) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-outline-variant/35 bg-surface-container-low/80 p-6 shadow-[0_22px_45px_rgba(0,0,0,0.35)] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span
            className="inline-flex h-9 w-9 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
            aria-hidden="true"
          />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
              Loading
            </p>
            <p className="text-base font-semibold text-on-surface">Preparing your content...</p>
          </div>
        </div>

        <div className="mt-5 space-y-2" aria-hidden="true">
          <div className="h-2.5 w-full animate-pulse rounded-full bg-surface-container-high" />
          <div className="h-2.5 w-10/12 animate-pulse rounded-full bg-surface-container-high" />
        </div>

        <p className="mt-4 text-xs text-on-surface-variant" role="status" aria-live="polite">
          Please wait while we initialize the app.
        </p>
      </div>
    </div>
  );
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
  const { init } = useAuthStore();
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initializeApp() {
      try {
        await init();
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    }

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, [init]);

  if (isBootstrapping) {
    return <AppStartupLoader />;
  }

  return (
    <RouterProvider router={appRouter} />
  )
}

export default App
