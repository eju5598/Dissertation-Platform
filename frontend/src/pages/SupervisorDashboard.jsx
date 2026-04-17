import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Dashboard.css";
import MarkingAccess from "../components/MarkingAccess";

function SupervisorDashboard() {
  const [preferences, setPreferences] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchData = async () => {
    try {
      const [prefRes, assignRes] = await Promise.all([
        api.get("/api/project-preferences/"),
        api.get("/api/assignments/"),
      ]);

      setPreferences(prefRes.data.filter(p => p.status === "PENDING"));
      setAssignments(assignRes.data);
    } catch (error) {
      console.error("Dashboard loading failed", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const acceptPreference = async (id) => {
    try {
      await api.post(`/api/project-preferences/${id}/select/`);
      setPreferences(prev => prev.filter(p => p.id !== id));
      fetchData();
    } catch (error) {
      console.error("Accept failed", error);
    }
  };

  const rejectPreference = async (id) => {
    try {
      await api.post(`/api/project-preferences/${id}/reject/`);
      setPreferences(prev => prev.filter(p => p.id !== id));
      fetchData();
    } catch (error) {
      console.error("Reject failed", error);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard-container">
      <h1>Supervisor Dashboard</h1>

      {/* SUMMARY */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div className="card">
          <h3>Pending Requests</h3>
          <p style={{ fontSize: "24px" }}>{preferences.length}</p>
        </div>

        <div className="card">
          <h3>Assigned Students</h3>
          <p style={{ fontSize: "24px" }}>{assignments.length}</p>
        </div>
      </div>

      {/* PENDING REQUESTS */}
      <div className="card">
        <h2>Pending Student Requests</h2>

        {preferences.length === 0 ? (
          <p>No pending requests</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Project</th>
                <th>Rank</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {preferences.map(p => (
                <tr key={p.id}>
                  <td>{p.student_name}</td>
                  <td>{p.project_title}</td>
                  <td>{p.rank}</td>
                  <td>
                    <button
                      onClick={() => acceptPreference(p.id)}
                      style={{
                        marginRight: "8px",
                        background: "#22c55e",
                        color: "white"
                      }}
                    >
                      Accept
                    </button>

                    <button
                      onClick={() => rejectPreference(p.id)}
                      style={{
                        background: "#ef4444",
                        color: "white"
                      }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ASSIGNED STUDENTS */}
      <div className="card">
        <h2>My Assigned Students</h2>

        {assignments.length === 0 ? (
          <p>No students assigned yet</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Project</th>
                <th>Status</th>
                <th>Submission</th>
                <th>Marks</th>
                <th>Start Marking</th>
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

                  <td>{a.status}</td>

                  {/* SUBMISSION */}
                  <td>
                    {a.submission ? (
                      <div>

                        <p style={{ fontSize: "12px", marginBottom: "4px" }}>
                          {new Date(a.submission.submitted_at).toLocaleString()}
                        </p>

                        <button
                          onClick={() =>
                            window.open(
                              a.submission.moodle_link.startsWith("http")
                                ? a.submission.moodle_link
                                : `https://${a.submission.moodle_link}`,
                              "_blank"
                            )
                          }
                          style={{
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "5px",
                            cursor: "pointer"
                          }}
                        >
                          View Dissertation
                        </button>

                      </div>
                    ) : (
                      <span style={{ color: "gray" }}>
                        Waiting for submission
                      </span>
                    )}
                  </td>

                  {/* MARKS */}
                  <td style={{ fontWeight: "bold" }}>
                    {a.marking
                      ? `${a.marking.total_marks} / 100`
                      : <span style={{ color: "orange" }}>Not Marked</span>}
                  </td>

                  {/* START MARKING */}
                  <td>
                    {a.submission ? (
                      <MarkingAccess assignmentId={a.id} />
                    ) : (
                      <span style={{ color: "gray" }}>
                        Waiting for submission
                      </span>
                    )}
                  </td>

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

export default SupervisorDashboard;