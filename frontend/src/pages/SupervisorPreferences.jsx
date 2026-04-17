import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Dashboard.css";

function SupervisorPreferences() {
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPreferences = () => {
    setLoading(true);
    api
      .get("/api/project-preferences/")
      .then((res) => setPreferences(res.data))
      .catch(() => setError("Failed to load preferences"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const selectProject = async (id) => {
    if (!window.confirm("Select this project for the student?")) return;

    try {
      await api.post(`/api/project-preferences/${id}/select/`);
      fetchPreferences(); // refresh after select
    } catch {
      alert("Failed to select project");
    }
  };

  if (loading) return <p>Loading project preferences...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Student Project Preferences</h1>
        <p>Select one project for each student</p>
      </div>

      <div className="card">
        {preferences.length === 0 ? (
          <p>No project preferences yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Project</th>
                <th>Rank</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {preferences.map((p) => (
                <tr key={p.id}>
                  <td>{p.student_name || p.student}</td>
                  <td>{p.project_title || p.project}</td>
                  <td>{p.rank}</td>
                  <td>{p.status}</td>
                  <td>
                    {p.status === "PENDING" ? (
                      <button
                        onClick={() => selectProject(p.id)}
                        style={{
                          padding: "6px 10px",
                          background: "#22c55e",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Select
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SupervisorPreferences;
