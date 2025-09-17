"use client";

import { useEffect, useMemo, useState } from "react";

type ApiHistory = {
  id: number;
  date: number; // unix ms
  type: "visit" | "prescription" | "test_result";
  title: string;
  description?: string | null;
};

export default function Page() {
  const [items, setItems] = useState<ApiHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;

    async function load() {
      try {
        const res = await fetch(`/api/history?order=desc&limit=50`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Failed to fetch history");
        const data = await res.json();
        if (mounted && Array.isArray(data)) setItems(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Something went wrong");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const mapped = items.map((i) => ({
      id: String(i.id),
      date: new Date(i.date).toISOString(),
      kind: i.type === "test_result" ? ("test" as const) : (i.type as "visit" | "prescription" | "test"),
      title: i.title,
      notes: i.description || undefined,
    }));
    return mapped.sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [items]);

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Medical History</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Timeline of past visits, prescriptions, and test results</p>
      </div>

      {error && <div className="card p-3 mb-4 text-sm text-red-600">{error}</div>}

      <section className="card p-6">
        {loading ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">Loading...</div>
        ) : grouped.length === 0 ? (
          <div className="text-sm text-gray-600 dark:text-gray-400">No history yet.</div>
        ) : (
          <ol className="relative border-s pl-6">
            {grouped.map((e, idx) => (
              <li key={e.id} className="mb-6 ms-4">
                <span
                  className={`absolute -start-1.5 mt-1 flex h-3 w-3 items-center justify-center rounded-full ${
                    e.kind === "visit" ? "bg-emerald-500" : e.kind === "test" ? "bg-blue-500" : "bg-purple-500"
                  }`}
                />
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{e.title}</h3>
                  <time className="text-xs text-gray-500">{new Date(e.date).toLocaleString()}</time>
                </div>
                {e.notes && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{e.notes}</p>}
                {idx < grouped.length - 1 && <div className="mt-4 h-px bg-gray-200 dark:bg-white/10" />}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}