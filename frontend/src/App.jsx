import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

// Lazy load pages
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const StudyLogs = lazy(() => import("./pages/StudyLogs"));
const StudyLogForm = lazy(() => import("./pages/StudyLogForm"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Achievements = lazy(() => import("./pages/Achievements"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600 dark:border-primary-800 dark:border-t-primary-400"></div>
  </div>
);

// Create router
const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Login />
      </Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Register />
      </Suspense>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      </Suspense>
    ),
  },
  {
    path: "/study-logs",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PrivateRoute>
          <StudyLogs />
        </PrivateRoute>
      </Suspense>
    ),
  },
  {
    path: "/study-logs/new",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PrivateRoute>
          <StudyLogForm />
        </PrivateRoute>
      </Suspense>
    ),
  },
  {
    path: "/study-logs/:id/edit",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PrivateRoute>
          <StudyLogForm />
        </PrivateRoute>
      </Suspense>
    ),
  },
  {
    path: "/analytics",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PrivateRoute>
          <Analytics />
        </PrivateRoute>
      </Suspense>
    ),
  },
  {
    path: "/achievements",
    element: (
      <Suspense fallback={<PageLoader />}>
        <PrivateRoute>
          <Achievements />
        </PrivateRoute>
      </Suspense>
    ),
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
