import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* HERO */}
      <section className="hero-section text-center">
        <div className="container">
          <h1>Turn Your Data Into Insights, Visuals & Predictions</h1>
          <p>
            Upload your data, analyze it, visualize trends, and predict outcomes
            using a simple dashboard.
          </p>

          <button
            className="btn btn-primary btn-lg mt-3"
            onClick={() => navigate("/upload")}
          >
            Get Started
          </button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mt-5 text-center">
        <div className="row">
          <div className="col-md-4">
            <h4>📊 Visualize</h4>
            <p>Create charts and graphs</p>
          </div>
          <div className="col-md-4">
            <h4>📈 Analyze</h4>
            <p>Explore insights from your data</p>
          </div>
          <div className="col-md-4">
            <h4>🤖 Predict</h4>
            <p>Apply ML models on your data</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
