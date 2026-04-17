import { NavLink, useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";

function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div style={styles.nav}>
      <div style={styles.links}>

        {/* Module Leader */}
        {role === "MODULE_LEADER" && (
          <>
            <NavLink
              to="/module-leader"
              style={({ isActive }) =>
                isActive ? styles.activeLink : styles.link
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/students"
              style={({ isActive }) =>
                isActive ? styles.activeLink : styles.link
              }
            >
              Students
            </NavLink>
          </>
        )}

        {/* Supervisor */}
        {role === "SUPERVISOR" && (
          <>
            <NavLink
              to="/supervisor"
              style={({ isActive }) =>
                isActive ? styles.activeLink : styles.link
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/students"
              style={({ isActive }) =>
                isActive ? styles.activeLink : styles.link
              }
            >
              Students
            </NavLink>
          </>
        )}

        {/* Student */}
        {role === "STUDENT" && (
          <NavLink
            to="/student"
            style={({ isActive }) =>
              isActive ? styles.activeLink : styles.link
            }
          >
            Dashboard
          </NavLink>
        )}

      </div>

      {/* 🔔 Right Side Section */}
      <div style={styles.rightSection}>
        <NotificationBell />
        <button onClick={logout} style={styles.btn}>
          Logout
        </button>
      </div>
    </div>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    background: "#1f2937",
    color: "white",
  },
  links: {
    display: "flex",
    gap: "15px",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  link: {
    color: "white",
    textDecoration: "none",
    fontSize: "14px",
    padding: "6px 10px",
    borderRadius: "6px",
  },
  activeLink: {
    color: "white",
    textDecoration: "none",
    fontSize: "14px",
    padding: "6px 10px",
    borderRadius: "6px",
    background: "#3b82f6",
  },
  btn: {
    background: "#ef4444",
    border: "none",
    color: "white",
    padding: "6px 10px",
    cursor: "pointer",
    borderRadius: "6px",
  },
};

export default Navbar;
