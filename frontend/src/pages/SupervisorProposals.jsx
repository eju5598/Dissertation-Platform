import { useEffect, useState } from "react";
import api from "../api/axios";

const SupervisorProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProposals = async () => {
  const res = await api.get("/api/project-preferences/");
  setProposals(res.data);
};

  useEffect(() => {
    fetchProposals();
  }, []);

  const acceptProject = async (preferenceId) => {
  await api.post(`/api/project-preferences/${preferenceId}/select/`);
  fetchProposals();
};


  if (loading) return <p>Loading proposals...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Student Proposals</h1>
        <p>Accept or reject dissertation proposals</p>
      </div>

      <div className="card">
        {proposals.length === 0 ? (
          <p>No proposals assigned to you</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Project</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {proposals.map((p) => (
                <tr key={p.id}>
                  <td>{p.student_name}</td>
                  <td>{p.project_title}</td>
                  <td>{p.status}</td>
                  <td>
                    {p.status === "PENDING" && (
                      <>
                        <button onClick={() => acceptProject(p.id)}>
                          Accept
                        </button>

                      </>
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
};

export default SupervisorProposals;
