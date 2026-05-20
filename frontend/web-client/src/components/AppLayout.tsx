import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../app/AuthContext";

export default function AppLayout() {
  const { auth, setAuth } = useAuth();
  const location = useLocation();

  const navItems = auth?.role === "ADMIN"
    ? [
        { to: "/", label: "Dashboard" },
        { to: "/users", label: "Users" },
        { to: "/shelters", label: "Shelters" },
        { to: "/sharing", label: "Shortages" },
        { to: "/system-health", label: "System Health" },
        { to: "/transparency", label: "Transparency" }
      ]
    : auth?.role === "SHELTER_MANAGER"
      ? [
          { to: "/", label: "Dashboard" },
          { to: "/shelters", label: "Shelter" },
          { to: "/inventory", label: "Inventory" },
          { to: "/sharing", label: "Transfers" },
          { to: "/transparency", label: "Transparency" }
        ]
      : [
          { to: "/", label: "Dashboard" },
          { to: "/inventory", label: "Donate" },
          { to: "/sharing", label: "Shortages" },
          { to: "/transparency", label: "Transparency" }
        ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Disaster Resource Platform</p>
          <h1>DRMS Control</h1>
          <p className="muted">Distributed shelter operations and transparency console.</p>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              className={location.pathname === item.to ? "nav-link active" : "nav-link"}
              to={item.to}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="profile-card">
          <div>
            <strong>{auth?.username ?? "Guest"}</strong>
            <p className="muted">{auth?.fullName ?? "No session"}</p>
            <p className="muted">{auth?.role ?? ""}</p>
          </div>
          {auth ? (
            <button className="secondary-button" onClick={() => setAuth(null)}>
              Sign out
            </button>
          ) : null}
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
