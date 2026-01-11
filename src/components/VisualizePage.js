import { useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Scatter } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function VisualizePage() {
  const location = useLocation();
  const { fullData = [], columns = [] } = location.state || {};

  const [xAxis, setXAxis] = useState("");
  const [yAxis, setYAxis] = useState("");
  const [groupBy, setGroupBy] = useState("");
  const [chartType, setChartType] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  /* -------------------------------
     2️⃣ AUTO-DETECT COLUMN TYPES
  --------------------------------*/
  const numericColumns = useMemo(() => {
    return columns.filter((col) =>
      fullData.every(
        (row) => row[col] !== "" && !isNaN(Number(row[col]))
      )
    );
  }, [columns, fullData]);

  const categoricalColumns = columns.filter(
    (col) => !numericColumns.includes(col)
  );

  /* -------------------------------
     3️⃣ GROUP BY → MULTI DATASETS
  --------------------------------*/
  const groupedDatasets = useMemo(() => {
    if (!groupBy) {
      return [
        {
          label: `${yAxis}`,
          data:
            chartType === "scatter"
              ? fullData.map((row) => ({
                  x: Number(row[xAxis]),
                  y: Number(row[yAxis]),
                }))
              : fullData.map((row) => Number(row[yAxis])),
        },
      ];
    }

    const groups = {};
    fullData.forEach((row) => {
      const key = row[groupBy];
      if (!groups[key]) groups[key] = [];
      groups[key].push(row);
    });

    const colors = [
      "#6366F1",
      "#22C55E",
      "#F97316",
      "#EF4444",
      "#06B6D4",
    ];

    return Object.keys(groups).map((key, index) => ({
      label: key,
      data:
        chartType === "scatter"
          ? groups[key].map((row) => ({
              x: Number(row[xAxis]),
              y: Number(row[yAxis]),
            }))
          : groups[key].map((row) => Number(row[yAxis])),
      backgroundColor: colors[index % colors.length],
      borderColor: colors[index % colors.length],
      tension: 0.4,
      fill: chartType === "line",
    }));
  }, [groupBy, fullData, xAxis, yAxis, chartType]);

  const chartData = {
    labels: fullData.map((row) => row[xAxis]),
    datasets: groupedDatasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { labels: { color: darkMode ? "#E5E7EB" : "#111827" } },
    },
    scales: {
      x: {
        ticks: { color: darkMode ? "#E5E7EB" : "#111827" },
        grid: { color: darkMode ? "#374151" : "#E5E7EB" },
      },
      y: {
        ticks: { color: darkMode ? "#E5E7EB" : "#111827" },
        grid: { color: darkMode ? "#374151" : "#E5E7EB" },
      },
    },
  };

  return (
    <div
      className={`min-vh-100 ${
        darkMode ? "bg-dark text-light" : "bg-light text-dark"
      }`}
    >
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center">
          <h2 className="fw-bold">Visualize Your Data</h2>
          <button
            className="btn btn-outline-secondary"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* CONTROLS */}
        <div className="row mt-4">
          <div className="col-md-3">
            <label>X-Axis</label>
            <select className="form-select" onChange={(e) => setXAxis(e.target.value)}>
              <option value="">Select</option>
              {categoricalColumns.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label>Y-Axis (Numeric)</label>
            <select className="form-select" onChange={(e) => setYAxis(e.target.value)}>
              <option value="">Select</option>
              {numericColumns.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label>Group By (Optional)</label>
            <select className="form-select" onChange={(e) => setGroupBy(e.target.value)}>
              <option value="">None</option>
              {categoricalColumns.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label>Chart Type</label>
            <select className="form-select" onChange={(e) => setChartType(e.target.value)}>
              <option value="">Select</option>
              <option value="bar">Bar</option>
              <option value="line">Line</option>
              <option value="scatter">Scatter</option>
            </select>
          </div>
        </div>

        {/* CHART */}
        {xAxis && yAxis && chartType && (
          <div className="card shadow-lg mt-5 p-4">
            {chartType === "bar" && <Bar data={chartData} options={options} />}
            {chartType === "line" && <Line data={chartData} options={options} />}
            {chartType === "scatter" && <Scatter data={chartData} options={options} />}
          </div>
        )}
      </div>
    </div>
  );
}

export default VisualizePage;
