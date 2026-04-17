import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

function MarkingPage() {

  const { assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);

  const [research, setResearch] = useState("");
  const [implementation, setImplementation] = useState("");
  const [report, setReport] = useState("");
  const [presentation, setPresentation] = useState("");
  const [comments, setComments] = useState("");

  const [total, setTotal] = useState(0);

  const [existingMarking, setExistingMarking] = useState(null);

  const [error, setError] = useState("");

  // Load assignment + existing marking
  useEffect(() => {

    api.get(`/api/assignments/${assignmentId}/`)
      .then(res => setAssignment(res.data))
      .catch(err => console.error(err));

    api.get("/api/markings/")
      .then(res => {

        const marking = res.data.find(
          m => m.assignment === Number(assignmentId)
        );

        if (marking) {

          setExistingMarking(marking);

          setResearch(marking.research_quality);
          setImplementation(marking.implementation_quality);
          setReport(marking.report_quality);
          setPresentation(marking.presentation);
          setComments(marking.comments);

        }

      })
      .catch(err => console.error(err));

  }, [assignmentId]);


  // Auto calculate total
  useEffect(() => {

    const r = Number(research) || 0;
    const i = Number(implementation) || 0;
    const rep = Number(report) || 0;
    const p = Number(presentation) || 0;

    setTotal(r + i + rep + p);

  }, [research, implementation, report, presentation]);


  const handleSubmit = async () => {

    // Mandatory validation
    if (!research || !implementation || !report || !presentation) {
      setError("All marking fields are required.");
      return;
    }

    try {

      await api.post("/api/markings/", {
        assignment: assignmentId,
        research_quality: research,
        implementation_quality: implementation,
        report_quality: report,
        presentation: presentation,
        comments: comments
      });

      alert("Marks saved successfully!");

      setExistingMarking(true);

    } catch (err) {

      console.error(err);
      alert("Failed to save marks");

    }

  };


  if (!assignment) return <p>Loading...</p>;

  const isDisabled =
    !research ||
    !implementation ||
    !report ||
    !presentation ||
    existingMarking;

  return (
    <div className="dashboard-container">

      <div className="card">

        <h2>Mark Dissertation</h2>

        <p><strong>Student:</strong> {assignment.student?.name}</p>
        <p><strong>Project:</strong> {assignment.project?.title}</p>

      </div>

      <div className="card">

        <h3>Evaluation Criteria</h3>

        {error && (
          <p style={{ color: "red" }}>{error}</p>
        )}

        <div className="form-group">
          <label>Research Quality (0-20)</label>
          <input
            type="number"
            min="0"
            max="20"
            value={research}
            onChange={(e) => setResearch(e.target.value)}
            disabled={existingMarking}
          />
        </div>

        <div className="form-group">
          <label>Implementation Quality (0-30)</label>
          <input
            type="number"
            min="0"
            max="30"
            value={implementation}
            onChange={(e) => setImplementation(e.target.value)}
            disabled={existingMarking}
          />
        </div>

        <div className="form-group">
          <label>Report Quality (0-40)</label>
          <input
            type="number"
            min="0"
            max="40"
            value={report}
            onChange={(e) => setReport(e.target.value)}
            disabled={existingMarking}
          />
        </div>

        <div className="form-group">
          <label>Presentation (0-10)</label>
          <input
            type="number"
            min="0"
            max="10"
            value={presentation}
            onChange={(e) => setPresentation(e.target.value)}
            disabled={existingMarking}
          />
        </div>

        <div className="form-group">
          <label>Comments</label>
          <textarea
            rows="4"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            disabled={existingMarking}
          />
        </div>

      </div>

      <div className="card">

        <h3>Total Marks</h3>

        <p style={{ fontSize: "28px", fontWeight: "bold" }}>
          {total} / 100
        </p>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isDisabled}
          style={{
            marginTop: "10px",
            opacity: isDisabled ? 0.5 : 1,
            cursor: isDisabled ? "not-allowed" : "pointer"
          }}
        >
          {existingMarking ? "Marks Already Submitted" : "Save Marks"}
        </button>

      </div>

    </div>
  );
}

export default MarkingPage;