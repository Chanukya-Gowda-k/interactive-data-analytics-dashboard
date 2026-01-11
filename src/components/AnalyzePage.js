import { useLocation } from "react-router-dom";
import { useMemo, useState } from "react";

function AnalyzePage() {
  const location = useLocation();
  const { fullData = [], columns = [] } = location.state || {};
  const [darkMode, setDarkMode] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState("");

  /* -----------------------------
     COLUMN TYPE DETECTION
  ------------------------------*/
  const numericColumns = useMemo(() => {
    return columns.filter((col) =>
      fullData.every(
        (row) => row[col] !== "" && !isNaN(Number(row[col]))
      )
    );
  }, [columns, fullData]);

  /* -----------------------------
     BASIC HELPERS
  ------------------------------*/
  const getValues = (col) =>
    fullData.map((r) => Number(r[col])).filter((v) => !isNaN(v));

  const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;

  /* -----------------------------
     DESCRIPTIVE STATS
  ------------------------------*/
  const descriptiveStats = useMemo(() => {
    const result = {};
    numericColumns.forEach((col) => {
      const values = getValues(col);
      const sorted = [...values].sort((a, b) => a - b);
      const m = mean(values);

      result[col] = {
        min: Math.min(...values),
        max: Math.max(...values),
        mean: m.toFixed(2),
        median:
          sorted.length % 2 === 0
            ? (
                (sorted[sorted.length / 2 - 1] +
                  sorted[sorted.length / 2]) /
                2
              ).toFixed(2)
            : sorted[Math.floor(sorted.length / 2)].toFixed(2),
        std: Math.sqrt(
          values.reduce((s, v) => s + Math.pow(v - m, 2), 0) /
            values.length
        ).toFixed(2),
      };
    });
    return result;
  }, [numericColumns, fullData]);

  /* -----------------------------
     CORRELATION
  ------------------------------*/
  const correlationMatrix = useMemo(() => {
    const result = {};
    numericColumns.forEach((c1) => {
      result[c1] = {};
      numericColumns.forEach((c2) => {
        const x = getValues(c1);
        const y = getValues(c2);
        const mx = mean(x);
        const my = mean(y);
        const num = x.reduce(
          (s, xi, i) => s + (xi - mx) * (y[i] - my),
          0
        );
        const den = Math.sqrt(
          x.reduce((s, xi) => s + Math.pow(xi - mx, 2), 0) *
            y.reduce((s, yi) => s + Math.pow(yi - my, 2), 0)
        );
        result[c1][c2] = den === 0 ? 0 : (num / den).toFixed(2);
      });
    });
    return result;
  }, [numericColumns]);

  const strength = (v) =>
    Math.abs(v) > 0.7 ? "Strong" : Math.abs(v) > 0.4 ? "Moderate" : "Weak";

  /* -----------------------------
     OUTLIERS (IQR)
  ------------------------------*/
  const outliers = useMemo(() => {
    const result = {};
    numericColumns.forEach((col) => {
      const v = getValues(col).sort((a, b) => a - b);
      const q1 = v[Math.floor(v.length * 0.25)];
      const q3 = v[Math.floor(v.length * 0.75)];
      const iqr = q3 - q1;
      const lower = q1 - 1.5 * iqr;
      const upper = q3 + 1.5 * iqr;
      const count = v.filter((x) => x < lower || x > upper).length;
      result[col] = count;
    });
    return result;
  }, [numericColumns]);

  /* -----------------------------
     MISSING VALUES
  ------------------------------*/
  const missing = useMemo(() => {
    const result = {};
    columns.forEach((col) => {
      result[col] = fullData.filter(
        (r) => r[col] === "" || r[col] == null
      ).length;
    });
    return result;
  }, [columns, fullData]);

  return (
    <div
      className={`min-vh-100 ${
        darkMode ? "bg-dark text-light" : "bg-light text-dark"
      }`}
    >
      <div className="container py-5">
        {/* HEADER */}
        <div className="d-flex justify-content-between mb-4">
          <h2 className="fw-bold">Data Analysis</h2>
          <button
            className="btn btn-outline-secondary"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "🌞 Light" : "🌙 Dark"}
          </button>
        </div>

        {/* OVERVIEW */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="card p-3 shadow-sm">
              <h6>Rows</h6>
              <h3>{fullData.length}</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 shadow-sm">
              <h6>Numeric Columns</h6>
              <h3>{numericColumns.length}</h3>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 shadow-sm">
              <h6>Total Columns</h6>
              <h3>{columns.length}</h3>
            </div>
          </div>
        </div>

        {/* ANALYSIS OPTIONS */}
        <div className="row g-4 mb-5">
          {[
            ["stats", "📊 Descriptive Statistics"],
            ["corr", "🔗 Correlation Analysis"],
            ["outliers", "🚨 Outlier Detection"],
            ["missing", "❓ Missing Values"],
          ].map(([key, label]) => (
            <div className="col-md-3" key={key}>
              <div
                className={`card p-3 shadow-sm text-center ${
                  activeAnalysis === key ? "border-primary" : ""
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setActiveAnalysis(key)}
              >
                <h6>{label}</h6>
              </div>
            </div>
          ))}
        </div>

        {/* ANALYSIS OUTPUT */}
        {activeAnalysis === "stats" && (
          <div className="card p-4 shadow-lg">
            <h5>Descriptive Statistics</h5>
            <table className="table table-striped mt-3">
              <thead className="table-dark">
                <tr>
                  <th>Column</th>
                  <th>Min</th>
                  <th>Max</th>
                  <th>Mean</th>
                  <th>Median</th>
                  <th>Std</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(descriptiveStats).map((c) => (
                  <tr key={c}>
                    <td>{c}</td>
                    <td>{descriptiveStats[c].min}</td>
                    <td>{descriptiveStats[c].max}</td>
                    <td>{descriptiveStats[c].mean}</td>
                    <td>{descriptiveStats[c].median}</td>
                    <td>{descriptiveStats[c].std}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeAnalysis === "corr" && (
          <div className="card p-4 shadow-lg">
            <h5>Correlation Matrix</h5>
            <table className="table table-bordered text-center mt-3">
              <thead className="table-dark">
                <tr>
                  <th></th>
                  {numericColumns.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {numericColumns.map((r) => (
                  <tr key={r}>
                    <th className="table-dark">{r}</th>
                    {numericColumns.map((c) => (
                      <td key={c}>
                        {correlationMatrix[r][c]} (
                        {strength(correlationMatrix[r][c])})
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeAnalysis === "outliers" && (
          <div className="card p-4 shadow-lg">
            <h5>Outlier Detection (IQR)</h5>
            <table className="table table-striped mt-3">
              <thead className="table-dark">
                <tr>
                  <th>Column</th>
                  <th>Outliers</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(outliers).map((c) => (
                  <tr key={c}>
                    <td>{c}</td>
                    <td>{outliers[c]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeAnalysis === "missing" && (
          <div className="card p-4 shadow-lg">
            <h5>Missing Values</h5>
            <table className="table table-striped mt-3">
              <thead className="table-dark">
                <tr>
                  <th>Column</th>
                  <th>Missing Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(missing).map((c) => (
                  <tr key={c}>
                    <td>{c}</td>
                    <td>{missing[c]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnalyzePage;
