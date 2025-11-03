import { Link, Route, Routes } from "react-router-dom";
import { UploadPage } from "./pages/UploadPage";
import { DatasetListPage } from "./pages/DatasetListPage";
import { DatasetViewPage } from "./pages/DatasetViewPage";

export default function App() {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <header style={{ marginBottom: 20, display: "flex", gap: 16 }}>
        <Link to="/">Загрузка</Link>
        <Link to="/datasets">Наборы</Link>
      </header>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/datasets" element={<DatasetListPage />} />
        <Route path="/datasets/:id" element={<DatasetViewPage />} />
      </Routes>
    </div>
  );
}
