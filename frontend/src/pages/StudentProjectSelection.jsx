import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Dashboard.css";

function StudentProjectSelection() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/api/projects/"),
      api.get("/api/assignments/"),
      api.get("/api/project-preferences/")
    ])
      .then(([projectRes, assignmentRes, prefRes]) => {
        setProjects(projectRes.data);

        if (assignmentRes.data.length > 0) {
          setAssignment(assignmentRes.data[0]);
        }

        if (prefRes.data.length > 0) {
          const existing = prefRes.data
            .sort((a, b) => a.rank - b.rank)
            .map(p => ({
              project: projectRes.data.find(pr => pr.id === p.project),
              rank: p.rank,
              status: p.status
            }));

          setSelected(existing);
        }
      })
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  const submittedPrefs = selected.filter(p => p.status);
  const newSelections = selected.filter(p => !p.status);

  const allRejected =
    submittedPrefs.length > 0 &&
    submittedPrefs.every(p => p.status === "REJECTED");

  const hasActiveSubmission =
    submittedPrefs.length > 0 && !allRejected;

  const toggleProject = (project) => {

    // Block editing if under review or accepted
    if (hasActiveSubmission) return;

    // Block selecting previously rejected
    const wasRejected = submittedPrefs.find(
      p => p.project.id === project.id &&
      p.status === "REJECTED"
    );

    if (wasRejected) return;

    const exists = newSelections.find(
      p => p.project.id === project.id
    );

    if (exists) {
      setSelected(selected.filter(p => p.project.id !== project.id));
    } else {
      if (newSelections.length >= 3) {
        alert("You can select only 3 new projects");
        return;
      }

      setSelected([
        ...selected,
        {
          project,
          rank: newSelections.length + 1
        }
      ]);
    }
  };

  const submitPreferences = async () => {

    if (newSelections.length !== 3) {
      alert("Please select exactly 3 new projects");
      return;
    }

    const payload = newSelections.map((p, index) => ({
      student: assignment.student.id,
      project: p.project.id,
      supervisor: assignment.supervisor_id,
      rank: index + 1
    }));

    try {
      await api.post("/api/project-preferences/", payload);
      alert("Project preferences submitted successfully");
      window.location.reload();
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to submit preferences");
    }
  };

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Select Project Preferences</h1>
        <p>Select exactly 3 projects</p>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>Project</th>
              <th>Level</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {

              const savedPref = submittedPrefs.find(
                s => s.project.id === p.id
              );

              const localPref = newSelections.find(
                s => s.project.id === p.id
              );

              return (
                <tr key={p.id}>
                  <td>
                    {savedPref ? (

                      savedPref.status === "SELECTED" ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>
                          ✔ Accepted
                        </span>
                      ) : savedPref.status === "REJECTED" ? (
                        <span style={{ color: "red", fontWeight: "bold" }}>
                          ✖ Rejected
                        </span>
                      ) : (
                        <span style={{ color: "#f59e0b", fontWeight: "bold" }}>
                          ⏳ Under Review
                        </span>
                      )

                    ) : (
                      <input
                        type="checkbox"
                        checked={!!localPref}
                        onChange={() => toggleProject(p)}
                      />
                    )}
                  </td>

                  <td>{p.title}</td>
                  <td>{p.level}</td>
                  <td>{p.rating}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!hasActiveSubmission && (
        <div style={{ marginTop: "16px" }}>
          <button
            onClick={submitPreferences}
            style={{
              padding: "10px 18px",
              background: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Submit Preferences
          </button>
        </div>
      )}
    </div>
  );
}

export default StudentProjectSelection;
