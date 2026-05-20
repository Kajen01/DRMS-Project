import { Navigate, Route, Routes } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { useAuthState } from "../hooks/useAuth";
import AppLayout from "../components/AppLayout";
import AuthGuard from "../components/AuthGuard";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import OverviewPage from "../pages/OverviewPage";
import SheltersPage from "../pages/SheltersPage";
import InventoryPage from "../pages/InventoryPage";
import SharingPage from "../pages/SharingPage";
import TransparencyPage from "../pages/TransparencyPage";
import UsersPage from "../pages/UsersPage";
import SystemHealthPage from "../pages/SystemHealthPage";
import RoleGuard from "../components/RoleGuard";

export default function App() {
  const authState = useAuthState();

  return (
    <AuthContext.Provider value={authState}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route index element={<OverviewPage />} />
          <Route path="shelters" element={<SheltersPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="sharing" element={<SharingPage />} />
          <Route path="transparency" element={<TransparencyPage />} />
          <Route
            path="users"
            element={
              <RoleGuard roles={["ADMIN"]}>
                <UsersPage />
              </RoleGuard>
            }
          />
          <Route
            path="system-health"
            element={
              <RoleGuard roles={["ADMIN"]}>
                <SystemHealthPage />
              </RoleGuard>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to={authState.auth ? "/" : "/login"} replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}
