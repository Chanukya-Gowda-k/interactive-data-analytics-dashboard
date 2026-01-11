import { useState } from "react";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";

function UploadPage() {
  const [previewData, setPreviewData] = useState([]);
  const [fullData, setFullData] = useState([]);
  const [columns, setColumns] = useState([]);
  const navigate = useNavigate();

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setColumns(Object.keys(results.data[0]));
        setFullData(results.data);              // FULL DATA
        setPreviewData(results.data.slice(0, 5)); // FIRST 5 ROWS
      },
    });
  };

  return (
    <div className="container mt-5">
      <h2>Upload Your Data</h2>

      <input
        type="file"
        className="form-control mt-3"
        accept=".csv"
        onChange={handleFileUpload}
      />

      {/* PREVIEW TABLE */}
      {previewData.length > 0 && (
        <>
          <h4 className="mt-4">Preview (First 5 Rows)</h4>

          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                {columns.map((col, i) => (
                  <th key={i}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, i) => (
                <tr key={i}>
                  {columns.map((col, j) => (
                    <td key={j}>{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* ACTION BUTTONS */}
          <div className="text-center mt-4">
            <button
              className="btn btn-primary me-3"
              onClick={() =>
                navigate("/visualize", {
                  state: { fullData, columns },
                })
              }
            >
              📊 Visualize Data
            </button>

            <button
                className="btn btn-warning me-3"
                onClick={() =>
                    navigate("/analyze", {
                    state: { fullData, columns },
                    })
                }
                >
                📈 Analyze Data
            </button>

            <button className="btn btn-success">
              🤖 Predict Data
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default UploadPage;
