import { useState } from "react";
import api from "../api/axios";
import "./CsvUpload.css";

function CsvUpload({ title, description, uploadUrl }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const uploadFile = async () => {
    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      await api.post(uploadUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(" Upload successful");
      setFile(null);
    } catch (err) {
      alert(" Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="csv-card">
    <h3>{title}</h3>
    <p>{description}</p>

    <div className="csv-input-box">
      <div className="file-select-row">
  <label className="file-label">
    <input
      type="file"
      accept=".csv"
      onChange={(e) => setFile(e.target.files[0])}
    />
    Select CSV File
  </label>

  {file && (
    <div className="file-info">
      <span className="file-name">{file.name}</span>
      <button
        className="remove-file-btn"
        onClick={() => setFile(null)}
        title="Remove file"
      >
        ✕
      </button>
    </div>
  )}
</div>

    </div>

    <div className="upload-action">
      <button
        className="upload-btn"
        onClick={uploadFile}
        disabled={loading || !file}
      >
        {loading ? "Uploading..." : "Upload CSV"}
      </button>
    </div>
  </div>
);


}

export default CsvUpload;
