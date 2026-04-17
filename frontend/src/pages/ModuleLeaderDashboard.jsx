import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import CsvUpload from "../components/CsvUpload";
import "./ModuleLeader.css";

function ModuleLeaderDashboard() {

  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {

    try {

      const res = await api.get("/api/assignments/");
      setAssignments(res.data);

    } catch (err) {

      console.error("Failed to load assignments", err);

    } finally {

      setLoading(false);

    }

  };

  // RELEASE ALL RESULTS
  const releaseResults = async () => {

    const confirmRelease = window.confirm(
      "Are you sure you want to release results to all students?"
    );

    if (!confirmRelease) return;

    try {

      await api.post("/api/release-results/");

      alert("Results released successfully!");

      loadAssignments();

    } catch (err) {

      console.error("Failed to release results", err);
      alert("Failed to release results");

    }

  };

  // RELEASE SINGLE RESULT
  const releaseSingleResult = async (assignmentId) => {

    const confirmRelease = window.confirm(
      "Release result for this student?"
    );

    if (!confirmRelease) return;

    try {

      await api.post(`/api/release-result/${assignmentId}/`);

      alert("Result released successfully!");

      loadAssignments();

    } catch (err) {

      console.error("Failed to release result", err);
      alert("Failed to release result");

    }

  };

  if (loading) return <p>Loading dashboard...</p>;

  const totalStudents = assignments.length;
  const submitted = assignments.filter(a => a.submission).length;
  const marked = assignments.filter(a => a.marking).length;

  return (
    <div className="dashboard-container">

      <header className="dashboard-header">
        <h1>Module Leader Dashboard</h1>
        <p>Manage students, projects and allocations</p>
      </header>

      {/* SUMMARY */}
      <div className="dashboard-content">

        <div className="card">
          <h3>Total Students</h3>
          <p style={{ fontSize: "24px" }}>{totalStudents}</p>
        </div>

        <div className="card">
          <h3>Submitted</h3>
          <p style={{ fontSize: "24px" }}>{submitted}</p>
        </div>

        <div className="card">
          <h3>Marked</h3>
          <p style={{ fontSize: "24px" }}>{marked}</p>
        </div>

        <div className="card">
          <h3>Release Results</h3>

          <button
            onClick={releaseResults}
            style={{
              marginTop: "10px",
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Release All Results
          </button>

        </div>

      </div>

      {/* CSV UPLOADS */}

      <div className="dashboard-content">

        <div className="card clickable-card">
          <CsvUpload
            title="Upload Students"
            description="Upload student details using a CSV file."
            uploadUrl="/api/import/students/"
          />
        </div>

        <div className="card clickable-card">
          <CsvUpload
            title="Upload Projects"
            description="Upload dissertation project details using a CSV file."
            uploadUrl="/api/import/projects/"
          />
        </div>

        <div className="card clickable-card">
          <CsvUpload
            title="Upload Allocations"
            description="Upload supervisor and marker allocations using a CSV file."
            uploadUrl="/api/import/allocations/"
          />
        </div>

      </div>

      {/* NAVIGATION */}

      <div className="dashboard-content">

        <div
          className="card clickable-card view-card"
          onClick={() => navigate("/students")}
        >
          <h3>View Students</h3>
          <p>View all registered students</p>
        </div>

        <div
          className="card clickable-card view-card"
          onClick={() => navigate("/projects")}
        >
          <h3>View Projects</h3>
          <p>View all dissertation projects</p>
        </div>

        <div
          className="card clickable-card view-card"
          onClick={() => navigate("/allocations")}
        >
          <h3>View Allocations</h3>
          <p>View supervisor and marker assignments</p>
        </div>

      </div>

      {/* PROGRESS TABLE */}

      <div className="card" style={{ marginTop: "20px" }}>

        <h2>Dissertation Progress</h2>

        <table className="data-table">

          <thead>
            <tr>
              <th>Student</th>
              <th>Project</th>
              <th>Supervisor</th>
              <th>Submission</th>
              <th>Marks</th>
              <th>Release</th>
            </tr>
          </thead>

          <tbody>

            {assignments.map(a => (

              <tr key={a.id}>

                <td>{a.student?.name}</td>

                <td>{a.project?.title}</td>

                <td>{a.supervisor_name}</td>

                <td>
                  {a.submission
                    ? <span style={{ color: "green" }}>Submitted</span>
                    : <span style={{ color: "red" }}>Pending</span>
                  }
                </td>

                <td>
                  {a.marking
                    ? `${a.marking.total_marks} / 100`
                    : <span style={{ color: "orange" }}>Not Marked</span>
                  }
                </td>

                {/* RELEASE BUTTON */}

                <td>

                  {!a.marking ? (

                    <span style={{ color: "gray" }}>-</span>

                  ) : a.marking?.is_released ? (

                    <span style={{ color: "green", fontWeight: "bold" }}>
                      Released
                    </span>

                  ) : (

                    <button
                      onClick={() => releaseSingleResult(a.id)}
                      style={{
                        background: "#22c55e",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "5px",
                        cursor: "pointer"
                      }}
                    >
                      Release
                    </button>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default ModuleLeaderDashboard;