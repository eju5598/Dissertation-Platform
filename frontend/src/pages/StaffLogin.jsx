import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function StaffLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const res = await api.post("/api/token/", {
      username,
      password,
    });

    // save tokens
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);

    // decode JWT
    const decoded = JSON.parse(
      atob(res.data.access.split(".")[1])
    );

    localStorage.setItem("role", decoded.role);
  
    if (decoded.role === "MODULE_LEADER") {
      navigate("/module-leader");
    } else if (decoded.role === "SUPERVISOR") {
      navigate("/supervisor");
    } 
    else if (decoded.role === "SECOND_MARKER") {
      navigate("/second-marker");
    }
    else if (decoded.role === "STUDENT") {
      navigate("/student");
    } 
    else {
      navigate("/");
    }

  } catch (err) {
    setError("Invalid username or password");
  }
};


  return (
  <div className="login-container">
    <div className="login-card">
      <h2>Dissertation Management System</h2>
      <p className="subtitle">Sign in to continue</p>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-btn">
          Login
        </button>
      </form>
    </div>
  </div>
);

}

export default StaffLogin;
