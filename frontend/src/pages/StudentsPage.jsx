import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Dashboard.css";

function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showModal, setShowModal] = useState(false);

  const [newStudent, setNewStudent] = useState({
    matric_id: "",
    name: "",
    email: "",
    programme: "",
    school: ""
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = localStorage.getItem("role");

  const fetchStudents = () => {
    api.get("/api/students/")
      .then(res => setStudents(res.data))
      .catch(() => setError("Failed to load students"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // =========================
  // CREATE STUDENT
  // =========================
  const createStudent = async () => {
    try {
      await api.post("/api/students/", newStudent);
      setShowModal(false);
      setNewStudent({
        matric_id: "",
        name: "",
        email: "",
        programme: "",
        school: ""
      });
      fetchStudents();
    } catch {
      alert("Failed to create student");
    }
  };

  // =========================
  // EDIT
  // =========================
  const startEdit = (student) => {
    setEditingId(student.id);
    setEditData({ ...student });
  };

  const handleChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const saveChanges = async (studentId) => {
    try {
      await api.patch(`/api/students/${studentId}/`, editData);
      setStudents(prev =>
        prev.map(s =>
          s.id === studentId ? { ...s, ...editData } : s
        )
      );
      setEditingId(null);
    } catch {
      alert("Failed to update student");
    }
  };

  const deleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    try {
      await api.delete(`/api/students/${studentId}/`);
      setStudents(prev => prev.filter(s => s.id !== studentId));
    } catch {
      alert("Failed to delete student");
    }
  };

  if (loading) return <p>Loading students...</p>;
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
          <h1>Students</h1>
          <p>All registered students</p>
        </div>

        {role === "MODULE_LEADER" && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "10px 16px",
              background: "#16a34a",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            ➕ Create Student
          </button>
        )}
      </div>

      {/* TABLE */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Matric ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Programme</th>
              <th>School</th>
              {role === "MODULE_LEADER" && <th>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td>
                  {editingId === s.id ? (
                    <input
                      value={editData.matric_id}
                      onChange={(e) =>
                        handleChange("matric_id", e.target.value)
                      }
                    />
                  ) : s.matric_id}
                </td>

                <td>
                  {editingId === s.id ? (
                    <input
                      value={editData.name}
                      onChange={(e) =>
                        handleChange("name", e.target.value)
                      }
                    />
                  ) : s.name}
                </td>

                <td>
                  {editingId === s.id ? (
                    <input
                      value={editData.email}
                      onChange={(e) =>
                        handleChange("email", e.target.value)
                      }
                    />
                  ) : s.email}
                </td>

                <td>
                  {editingId === s.id ? (
                    <input
                      value={editData.programme}
                      onChange={(e) =>
                        handleChange("programme", e.target.value)
                      }
                    />
                  ) : s.programme}
                </td>

                <td>
                  {editingId === s.id ? (
                    <input
                      value={editData.school}
                      onChange={(e) =>
                        handleChange("school", e.target.value)
                      }
                    />
                  ) : s.school}
                </td>

                {role === "MODULE_LEADER" && (
                  <td>
                    {editingId === s.id ? (
                      <>
                        <button
                          onClick={() => saveChanges(s.id)}
                          style={{ marginRight: "6px", background: "#22c55e", color: "white" }}
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{ background: "#ef4444", color: "white" }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(s)}
                          style={{ marginRight: "6px", background: "#2563eb", color: "white" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteStudent(s.id)}
                          style={{ background: "#dc2626", color: "white" }}
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

      {/* MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">

            <div className="modal-header">
              <h3>Create New Student</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ✖
              </button>
            </div>

            <div className="modal-body">
              <input
                placeholder="Matric ID"
                value={newStudent.matric_id}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, matric_id: e.target.value })
                }
              />
              <input
                placeholder="Name"
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, name: e.target.value })
                }
              />
              <input
                placeholder="Email"
                value={newStudent.email}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, email: e.target.value })
                }
              />
              <input
                placeholder="Programme"
                value={newStudent.programme}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, programme: e.target.value })
                }
              />
              <input
                placeholder="School"
                value={newStudent.school}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, school: e.target.value })
                }
              />
            </div>

            <div className="modal-footer">
              <button className="save-btn" onClick={createStudent}>
                Save Student
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default StudentsPage;
