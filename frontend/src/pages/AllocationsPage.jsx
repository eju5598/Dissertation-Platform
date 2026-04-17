import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Dashboard.css";

function AllocationsPage() {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState({});

  useEffect(() => {
  api.get("/api/assignments/")
    .then(res => setAllocations(res.data))
    .catch(() => setError("Failed to load allocations"));

  api.get("/api/supervisors/")
    .then(res => setSupervisors(res.data))
    .catch(() => setError("Failed to load supervisors"))
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading allocations...</p>;
  if (error) return <p>{error}</p>;

  const handleAssign = (assignmentId, studentId) => {
  const supervisorId = selectedSupervisor[studentId];

  if (!supervisorId) {
    alert("Please select a supervisor first");
    return;
  }

  api
    .post(`/api/assignments/${assignmentId}/assign-supervisor/`, {
      supervisor_id: supervisorId,
    })
    .then(() => {
      alert("Supervisor assigned successfully");

      return api.get("/api/assignments/");  
    })
    .then((res) => {
      setAllocations(res.data);
    })
    .catch(() => {
      alert("Failed to assign supervisor");
    });
};

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Allocations</h1>
        <p>Student supervisor and marker allocations</p>
      </div>

      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Matric ID</th>
              <th>Project</th>
              <th>Supervisor</th>
              <th>Second Marker</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {allocations.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No allocations found
                </td>
              </tr>
            ) : (
              allocations.map((a) => (
                <tr key={a.id}>
                  <td>{a.student?.name}</td>
                  <td>{a.student?.matric_id}</td>
                  <td>{a.project?.title}</td>
                  <td>
                      <select
                          value={selectedSupervisor[a.student.id] || a.supervisor_id || ""}
                          onChange={(e) =>
                          setSelectedSupervisor({
                          ...selectedSupervisor,
                         [a.student.id]: e.target.value
               })
             }
     >
                <option value="">Select Supervisor</option>

                 {supervisors.map((s) => (
              <option key={s.id} value={s.id}>
                  {s.name}
               </option>
             ))}
            </select>
            </td>

                  <td>{a.second_marker_id ?? "-"}</td>
                  <td>
              <button
                 onClick={() => handleAssign(a.id, a.student.id)}
                disabled={!selectedSupervisor[a.student.id]}
              >
                Assign
                   </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AllocationsPage;
