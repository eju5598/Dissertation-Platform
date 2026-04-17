import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Dashboard.css";

function SecondMarkerDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    api.get("/api/assignments/")
      .then(res => {
        setAssignments(res.data);
      })
      .catch(err => {
        console.error("Failed to load assignments", err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <h1>Second Marker Dashboard</h1>
        <p>Students assigned to you for second marking</p>
      </div>

      <div className="card">
        {assignments.length === 0 ? (
          <p>No students assigned</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Project</th>
                <th>Supervisor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(a => (
                <tr key={a.id}>
                  <td>{a.student?.name}</td>

                  <td>
                    {a.project?.title}

                    {a.project && (
                      <span
                        style={{
                          marginLeft: "8px",
                          cursor: "pointer",
                          color: "#2563eb",
                          fontWeight: "bold"
                        }}
                        onClick={() => setSelectedProject(a.project)}
                      >
                        ℹ
                      </span>
                    )}
                  </td>

                  <td>{a.supervisor_name}</td>

                  <td>{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PROJECT INFO MODAL */}
      {selectedProject && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "10px",
              width: "450px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}
          >
            <h3>{selectedProject.title}</h3>
            <p><strong>Description:</strong> {selectedProject.description}</p>
            <p><strong>Level:</strong> {selectedProject.level}</p>
            <p><strong>Rating:</strong> {selectedProject.rating}</p>
            <p><strong>Tags:</strong> {selectedProject.tags}</p>

            <button
              onClick={() => setSelectedProject(null)}
              style={{
                marginTop: "15px",
                padding: "8px 14px",
                background: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SecondMarkerDashboard;
