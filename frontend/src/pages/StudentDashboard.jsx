import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Dashboard.css";
import { Link } from "react-router-dom";
import SubmitDissertation from "../components/SubmitDissertation";

function StudentDashboard() {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/assignments/")
      .then((res) => {
        if (res.data.length > 0) {
          setAssignment(res.data[0]);
        } else {
          setAssignment(null);
        }
      })
      .catch(() => setError("Failed to load student details"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading your dashboard...</p>;
  if (error) return <p>{error}</p>;

  const projectAssigned = assignment && assignment.project;
  const submission = assignment?.submission;
  const marking = assignment?.marking;

  const deadlinePassed =
    assignment?.submission_deadline &&
    new Date() > new Date(assignment.submission_deadline);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p>Your dissertation information</p>

        <Link
          to="/student/projects"
          style={{
            display: "inline-block",
            marginTop: "12px",
            padding: "10px 16px",
            backgroundColor: "#2563eb",
            color: "white",
            borderRadius: "6px",
            textDecoration: "none",
            fontSize: "14px",
          }}
        >
          Select Project Preferences
        </Link>
      </div>

      <div className="dashboard-content">

        {/* Student Info */}
        <div className="card">
          <h3>Student Information</h3>

          <p>
            <strong>Matric ID:</strong>{" "}
            {assignment?.student?.matric_id || "-"}
          </p>

          <p>
            <strong>Name:</strong>{" "}
            {assignment?.student?.name || "-"}
          </p>

          <p>
            <strong>Programme:</strong>{" "}
            {assignment?.student?.programme || "-"}
          </p>

          <p>
            <strong>School:</strong>{" "}
            {assignment?.student?.school || "-"}
          </p>
        </div>

        {/* Project Info */}
        <div className="card">
          <h3>Project Details</h3>

          <p>
            <strong>Project Title:</strong>{" "}
            {assignment?.project?.title || "Not assigned"}
          </p>

          <p>
            <strong>Supervisor:</strong>{" "}
            {assignment?.supervisor_name || "Not assigned"}
          </p>

          <p>
            <strong>Second Marker:</strong>{" "}
            {assignment?.second_marker_name || "Not assigned"}
          </p>

          <p>
            <strong>Submission Deadline:</strong>{" "}
            {assignment?.submission_deadline
              ? new Date(assignment.submission_deadline).toLocaleString()
              : "Not set"}
          </p>
        </div>

        {/* Proposal Status */}
        <div className="card">
          <h3>Proposal Status</h3>

          <p>
            <strong>Status:</strong>{" "}
            {assignment?.status || "NOT SUBMITTED"}
          </p>
        </div>

        {/* Submission Status */}
        <div className="card">
          <h3>Submission Status</h3>

          {!submission ? (
            <p style={{ color: "orange", fontWeight: "bold" }}>
              Not Submitted
            </p>
          ) : (
            <div>
              <p style={{ color: "green", fontWeight: "bold" }}>
                Submitted
              </p>

              <p>
                <strong>Submitted On:</strong>{" "}
                {new Date(submission.submitted_at).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Dissertation Submission</h3>

          {!projectAssigned ? (
            <p style={{ color: "gray" }}>
              You must have a project assigned before submitting your dissertation.
            </p>

          ) : submission ? (

            <div>
              <p style={{ color: "green", fontWeight: "bold" }}>
                Dissertation Submitted Successfully
              </p>

              <button
                onClick={() => {
                  const link = submission.moodle_link;
                  const safeLink = link.startsWith("http")
                    ? link
                    : `https://${link}`;

                  window.open(safeLink, "_blank");
                }}
                style={{
                  marginTop: "10px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                View Your Submission
              </button>
            </div>

          ) : deadlinePassed ? (

            <p style={{ color: "red", fontWeight: "bold" }}>
              Submission deadline has passed.
            </p>

          ) : (

            <SubmitDissertation />

          )}
        </div>
        
        <div className="card">
          <h3>Dissertation Result</h3>

          {!marking || !marking.is_released ? (
              <p style={{ color: "gray" }}>
              Results not released yet
            </p>
           ) : (
            <div>

              <p>
                <strong>Research Quality:</strong>{" "}
                {marking.research_quality}
              </p>

              <p>
                <strong>Implementation Quality:</strong>{" "}
                {marking.implementation_quality}
              </p>

              <p>
                <strong>Report Quality:</strong>{" "}
                {marking.report_quality}
              </p>

              <p>
                <strong>Presentation:</strong>{" "}
                {marking.presentation}
              </p>

              <hr />

              <p style={{ fontSize: "20px", fontWeight: "bold" }}>
                Total Marks: {marking.total_marks} / 100
              </p>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default StudentDashboard;