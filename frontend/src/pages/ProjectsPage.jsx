import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Dashboard.css";

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    level: "",
    rating: "",
    tags: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = localStorage.getItem("role");

  const fetchProjects = () => {
    api.get("/api/projects/")
      .then(res => setProjects(res.data))
      .catch(() => setError("Failed to load projects"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const createProject = async () => {
    try {
      await api.post("/api/projects/", newProject);
      setShowCreate(false);
      setNewProject({
        title: "",
        description: "",
        level: "",
        rating: "",
        tags: ""
      });
      fetchProjects();
    } catch {
      alert("Failed to create project");
    }
  };

  const startEdit = (project) => {
    setEditingId(project.id);
    setEditData({ ...project });
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveChanges = async (projectId) => {
    try {
      await api.patch(`/api/projects/${projectId}/`, editData);
      setProjects(prev =>
        prev.map(p =>
          p.id === projectId ? { ...p, ...editData } : p
        )
      );
      setEditingId(null);
    } catch {
      alert("Failed to update project");
    }
  };

  const deleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;

    try {
      await api.delete(`/api/projects/${projectId}/`);
      setProjects(prev => prev.filter(p => p.id !== projectId));
    } catch {
      alert("Failed to delete project");
    }
  };

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div
        className="dashboard-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <h1>Projects</h1>
          <p>All dissertation projects</p>
        </div>

        {role === "MODULE_LEADER" && (
          <button
            onClick={() => setShowCreate(true)}
            style={{
              padding: "10px 16px",
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            ➕ Create Project
          </button>
        )}
      </div>

      {/* =========================
          CREATE PROJECT MODAL
         ========================= */}
      {showCreate && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div
            className="card"
            style={{
              width: "600px",
              padding: "25px",
              borderRadius: "10px",
              background: "white"
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>Create New Project</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px"
              }}
            >
              <input
                placeholder="Title"
                value={newProject.title}
                onChange={(e) =>
                  setNewProject({ ...newProject, title: e.target.value })
                }
              />

              <input
                placeholder="Level"
                value={newProject.level}
                onChange={(e) =>
                  setNewProject({ ...newProject, level: e.target.value })
                }
              />

              <input
                type="number"
                placeholder="Rating"
                value={newProject.rating}
                onChange={(e) =>
                  setNewProject({ ...newProject, rating: e.target.value })
                }
              />

              <input
                placeholder="Tags"
                value={newProject.tags}
                onChange={(e) =>
                  setNewProject({ ...newProject, tags: e.target.value })
                }
              />
            </div>

            <textarea
              placeholder="Description"
              style={{
                width: "100%",
                marginTop: "15px",
                height: "90px"
              }}
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
            />

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px"
              }}
            >
              <button
                onClick={createProject}
                style={{
                  background: "#2563eb",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px"
                }}
              >
                Save
              </button>

              <button
                onClick={() => setShowCreate(false)}
                style={{
                  background: "#ef4444",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================
              PROJECT TABLE
         ========================= */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Level</th>
              <th>Rating</th>
              <th>Description</th>
              <th>Tags</th>
              {role === "MODULE_LEADER" && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {projects.map(p => (
              <tr key={p.id}>
                <td>
                  {editingId === p.id ? (
                    <input
                      value={editData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                    />
                  ) : (
                    p.title
                  )}
                </td>

                <td>
                  {editingId === p.id ? (
                    <input
                      value={editData.level}
                      onChange={(e) => handleChange("level", e.target.value)}
                    />
                  ) : (
                    p.level
                  )}
                </td>

                <td>
                  {editingId === p.id ? (
                    <input
                      type="number"
                      value={editData.rating}
                      onChange={(e) => handleChange("rating", e.target.value)}
                      style={{ width: "60px" }}
                    />
                  ) : (
                    <span style={{ color: "#f59e0b", fontWeight: "bold" }}>
                      ⭐ {p.rating}
                    </span>
                  )}
                </td>

                <td>
                  {editingId === p.id ? (
                    <input
                      value={editData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                    />
                  ) : (
                    p.description
                  )}
                </td>

                <td>
                  {editingId === p.id ? (
                    <input
                      value={editData.tags}
                      onChange={(e) => handleChange("tags", e.target.value)}
                    />
                  ) : (
                    p.tags
                  )}
                </td>

                {role === "MODULE_LEADER" && (
                  <td>
                    {editingId === p.id ? (
                      <>
                        <button
                          onClick={() => saveChanges(p.id)}
                          style={{
                            marginRight: "6px",
                            background: "#22c55e",
                            color: "white"
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            background: "#ef4444",
                            color: "white"
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(p)}
                          style={{
                            marginRight: "6px",
                            background: "#2563eb",
                            color: "white"
                          }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteProject(p.id)}
                          style={{
                            background: "#dc2626",
                            color: "white"
                          }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default ProjectsPage;
