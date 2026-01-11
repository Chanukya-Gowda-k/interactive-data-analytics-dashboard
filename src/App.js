import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import UploadPage from "./components/UploadPage";
import VisualizePage from "./components/VisualizePage";
import AnalyzePage from "./components/AnalyzePage";

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/visualize" element={<VisualizePage />} />
      </Routes>
    </Router>
  );
}

export default App;
