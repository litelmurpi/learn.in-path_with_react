import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import StudyLogs from "./pages/StudyLogs";
import StudyLogForm from "./pages/StudyLogForm";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/study-logs"
            element={
              <PrivateRoute>
                <StudyLogs />
              </PrivateRoute>
            }
          />
          <Route
            path="/study-logs/new"
            element={
              <PrivateRoute>
                <StudyLogForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/study-logs/:id/edit"
            element={
              <PrivateRoute>
                <StudyLogForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <Analytics />
              </PrivateRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
