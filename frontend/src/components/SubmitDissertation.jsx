import { useState } from "react";
import api from "../api/axios";

function SubmitDissertation() {
  const [moodleLink, setMoodleLink] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      if (moodleLink) formData.append("moodle_link", moodleLink);
      if (file) formData.append("file", file);

      await api.post("/api/submissions/", formData);

      alert("Dissertation submitted successfully!");
      window.location.reload();

    } catch (error) {
      console.error("Submission failed", error);
      setError("Submission failed. Please try again.");
    }
  };

  const isDisabled = !moodleLink && !file;

  return (
    <div className="submission-form">

      <h3 className="form-title">Submit Dissertation</h3>

      {error && (
        <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
      )}

      {/* Moodle Link */}
      <div className="form-group">
        <label>Moodle Link</label>

        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Paste Moodle submission link"
            value={moodleLink}
            onChange={(e) => setMoodleLink(e.target.value)}
            style={{ width: "100%", paddingRight: "30px" }}
          />

          {moodleLink && (
            <span
              onClick={() => setMoodleLink("")}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontWeight: "bold",
                color: "#888"
              }}
            >
              ✕
            </span>
          )}
        </div>
      </div>

      {/* File Upload */}
      <div className="form-group">
        <label>Upload File</label>

        {!file ? (
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
        ) : (
          <div
            style={{
              border: "1px solid #ccc",
              borderRadius: "6px",
              padding: "8px 10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span>{file.name}</span>

            <span
              onClick={() => setFile(null)}
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                color: "#888"
              }}
            >
              ✕
            </span>
          </div>
        )}
      </div>

      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={isDisabled}
        style={{
          opacity: isDisabled ? 0.5 : 1,
          cursor: isDisabled ? "not-allowed" : "pointer"
        }}
      >
        Submit Dissertation
      </button>

    </div>
  );
}

export default SubmitDissertation;