import { useState } from "react";

export function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const token = import.meta.env.VITE_API_TOKEN;
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: form,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      setResult(data.datasetId);
    } catch (e) {
      alert("Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Загрузка CSV</h1>
      <input type="file" accept=".csv" onChange={e => setFile(e.target.files?.[0] ?? null)} />
      <button onClick={handleUpload} disabled={!file || loading}>
        {loading ? "Загружаю..." : "Загрузить"}
      </button>
      {result && <p>Набор создан: {result}</p>}
    </div>
  );
}
