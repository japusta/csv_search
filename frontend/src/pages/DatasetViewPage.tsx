import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";

type Dataset = {
  id: string;
  originalFilename: string;
  rowsCount: number;
  status: string;
  columns?: string[];
  progress?: number;
};

type Row = {
  id: string;
  datasetId: string;
  data: Record<string, any>;
};

type Paginated<T> = {
  total: number;
  page: number;
  limit: number;
  items: T[];
};

type Condition = {
  field: string;
  value: string;
};

export function DatasetViewPage() {
  const { id } = useParams();
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [loading, setLoading] = useState(false);

  // search
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [mode, setMode] = useState<"and" | "or">("and");
  const [appliedConditions, setAppliedConditions] = useState<Condition[]>([]);
  const [appliedMode, setAppliedMode] = useState<"and" | "or">("and");
  const [isSearching, setIsSearching] = useState(false);

  // sorting
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // fetch dataset
  useEffect(() => {
    if (!id) return;
    api<Dataset>(`/datasets/${id}`).then((d) => {
      setDataset(d);
      if (d.columns && d.columns.length > 0) {
        setConditions([{ field: d.columns[0], value: "" }]);
      }
    });
  }, [id]);

  // poll status
  useEffect(() => {
    if (!id) return;
    if (!dataset) return;
    if (dataset.status === "READY" || dataset.status === "FAILED") return;
    const timer = setInterval(() => {
      api<Dataset>(`/datasets/${id}`).then(setDataset);
    }, 3000);
    return () => clearInterval(timer);
  }, [id, dataset]);

  const columns = useMemo(() => {
    if (dataset?.columns && dataset.columns.length > 0) return dataset.columns;
    if (rows[0]?.data) return Object.keys(rows[0].data);
    return [];
  }, [dataset, rows]);

  // add first condition if none
  useEffect(() => {
    if (columns.length > 0 && conditions.length === 0) {
      setConditions([{ field: columns[0], value: "" }]);
    }
  }, [columns, conditions.length]);

  // fetch rows / search
  useEffect(() => {
    if (!id) return;
    async function load() {
      setLoading(true);
      try {
        if (isSearching) {
          const active = appliedConditions.filter((c) => c.field && c.value.trim() !== "");
          const params = new URLSearchParams();
          params.set("datasetId", id);
          params.set("mode", appliedMode);
          params.set("page", page.toString());
          params.set("limit", limit.toString());
          if (sortField) {
            params.set("sortField", sortField);
            params.set("sortOrder", sortOrder);
          }
          for (const c of active) {
            params.append("field", c.field);
            params.append("value", c.value);
          }
          const res = await api<Paginated<Row>>(`/search?${params.toString()}`);
          setRows(res.items);
          setTotal(res.total);
        } else {
          const params = new URLSearchParams();
          params.set("datasetId", id);
          params.set("page", page.toString());
          params.set("limit", limit.toString());
          if (sortField) {
            params.set("sortField", sortField);
            params.set("sortOrder", sortOrder);
          }
          const res = await api<Paginated<Row>>(`/rows?${params.toString()}`);
          setRows(res.items);
          setTotal(res.total);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, page, limit, isSearching, appliedConditions, appliedMode, sortField, sortOrder]);

  function handleConditionChange(index: number, key: "field" | "value", value: string) {
    setConditions((prev) => prev.map((c, i) => (i === index ? { ...c, [key]: value } : c)));
  }

  function handleAddCondition() {
    const first = columns[0] ?? "";
    setConditions((prev) => [...prev, { field: first, value: "" }]);
  }

  function handleRemoveCondition(index: number) {
    setConditions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    const active = conditions.filter((c) => c.field && c.value.trim() !== "");
    if (active.length === 0) {
      return clearSearch();
    }
    setAppliedConditions(active);
    setAppliedMode(mode);
    setIsSearching(true);
    setPage(1);
  }

  function clearSearch() {
    setIsSearching(false);
    setAppliedConditions([]);
    setAppliedMode("and");
    setPage(1);
    setConditions((prev) => prev.map((c, i) => (i === 0 ? { ...c, value: "" } : c)));
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <h1>{dataset?.originalFilename ?? "Набор"}</h1>
      <p>
        Статус: <b>{dataset?.status}</b>{" "}
        {dataset?.status === "PROCESSING" && typeof dataset.progress === "number"
          ? `(${dataset.progress}%)`
          : null}
      </p>
      <p>
        Строк (по данным набора): <b>{dataset?.rowsCount ?? 0}</b>
      </p>

      {/* filters */}
      <form
        onSubmit={handleSearch}
        style={{ margin: "20px 0", padding: 12, border: "1px solid #ddd", borderRadius: 8 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>Фильтры</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <label>
              <input
                type="radio"
                name="mode"
                value="and"
                checked={mode === "and"}
                onChange={() => setMode("and")}
              />{" "}
              AND
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="or"
                checked={mode === "or"}
                onChange={() => setMode("or")}
              />{" "}
              OR
            </label>
          </div>
        </div>

        {conditions.map((cond, index) => (
          <div key={index} style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <select
              value={cond.field}
              onChange={(e) => handleConditionChange(index, "field", e.target.value)}
            >
              {columns.length === 0 ? (
                <option value="">(нет колонок)</option>
              ) : (
                columns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))
              )}
            </select>
            <input
              value={cond.value}
              onChange={(e) => handleConditionChange(index, "value", e.target.value)}
              style={{ flex: 1 }}
              placeholder="значение"
            />
            {conditions.length > 1 && (
              <button type="button" onClick={() => handleRemoveCondition(index)}>
                ✕
              </button>
            )}
          </div>
        ))}

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button type="button" onClick={handleAddCondition}>
            + условие
          </button>
          <button type="submit">Найти</button>
          {isSearching && (
            <button type="button" onClick={clearSearch}>
              Сброс
            </button>
          )}
          {/* экспорт */}
          <button
            type="button"
            onClick={() => {
              if (!id) return;
              const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
              const token = import.meta.env.VITE_API_TOKEN;
              const params = new URLSearchParams();
              params.set("datasetId", id);
              if (isSearching) {
                params.set("mode", appliedMode);
                appliedConditions.forEach((c) => {
                  params.append("field", c.field);
                  params.append("value", c.value);
                });
              }
              // если токен нужен в header, то надо fetch+blob, но для простоты:
              const url = `${API_URL}/export?${params.toString()}`;
              if (token) {
                // нельзя просто window.open с заголовком, поэтому предупредим:
                alert("Экспорт настроен, но для приватного токена сделай fetch+blob на фронте.");
              } else {
                window.open(url, "_blank");
              }
            }}
          >
            Экспортировать CSV
          </button>
        </div>
      </form>

      {/* table */}
      {loading ? (
        <p>Загружаю...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {columns.map((col) => {
                  const active = sortField === col;
                  return (
                    <th
                      key={col}
                      style={{ border: "1px solid #ddd", padding: 4, cursor: "pointer" }}
                      onClick={() => {
                        setPage(1);
                        if (sortField === col) {
                          setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                        } else {
                          setSortField(col);
                          setSortOrder("asc");
                        }
                      }}
                    >
                      {col}
                      {active ? (sortOrder === "asc" ? " ↑" : " ↓") : ""}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => (
                    <td key={col} style={{ border: "1px solid #eee", padding: 4 }}>
                      {row.data?.[col] ?? ""}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={columns.length} style={{ padding: 8 }}>
                    Нет данных
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* pagination */}
      <div style={{ marginTop: 16, display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
          Назад
        </button>
        <span>
          Стр. {page} из {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
        >
          Вперёд
        </button>
        {isSearching && (
          <span style={{ fontSize: 12, color: "#666" }}>
            Поиск: {appliedConditions.length} усл. ({appliedMode.toUpperCase()})
          </span>
        )}
      </div>
    </div>
  );
}
