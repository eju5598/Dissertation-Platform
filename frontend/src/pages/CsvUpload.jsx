import { useState } from "react";
import api from "../api/axios";

function CsvUpload() {
  const [file, setFile] = useState(null);

  const upload = async () => {
    const formData = new FormData();
    formData.append("file", file);
    await api.post("/api/upload/csv/", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});
    alert("CSV uploaded");
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={upload}>Upload</button>
    </div>
  );
}

export default CsvUpload;
