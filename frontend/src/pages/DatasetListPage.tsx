import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

type Dataset = {
  id: string;
  originalFilename: string;
  rowsCount: number;
  status: string;
  createdAt: string;
};

export function DatasetListPage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Dataset[]>("/datasets")
      .then(setDatasets)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1>Наборы данных</h1>
      {loading ? (
        <p>Загружаю...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Файл</th>
              <th align="left">Статус</th>
              <th align="left">Строк</th>
              <th align="left">Создан</th>
            </tr>
          </thead>
          <tbody>
            {datasets.map(d => (
              <tr key={d.id}>
                <td><Link to={`/datasets/${d.id}`}>{d.originalFilename}</Link></td>
                <td>{d.status}</td>
                <td>{d.rowsCount}</td>
                <td>{new Date(d.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
