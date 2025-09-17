"use client";

import { useEffect, useMemo, useState } from "react";
import Sparkline from "@/components/Sparkline";

export default function Page() {
  const [hr, setHr] = useState<number[]>([]);
  const [steps, setSteps] = useState<number[]>([]);
  const [sleep, setSleep] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;

    async function load() {
      try {
        const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

        // heart rate
        const hrRes = await fetch(`/api/iot?metric=heart_rate&limit=12`, { headers });
        if (!hrRes.ok) throw new Error((await hrRes.json().catch(() => ({})))?.error || "Failed to fetch heart rate");
        const hrJson = await hrRes.json();
        const hrVals: number[] = Array.isArray(hrJson?.data) ? hrJson.data.map((d: any) => Number(d.value)) : [];
        if (mounted) setHr(hrVals);

        // steps (last 7)
        const stepsRes = await fetch(`/api/iot?metric=steps&limit=7`, { headers });
        if (!stepsRes.ok) throw new Error((await stepsRes.json().catch(() => ({})))?.error || "Failed to fetch steps");
        const stepsJson = await stepsRes.json();
        const stepVals: number[] = Array.isArray(stepsJson?.data) ? stepsJson.data.map((d: any) => Number(d.value)) : [];
        if (mounted) setSteps(stepVals);

        // sleep hours (last 7)
        const sleepRes = await fetch(`/api/iot?metric=sleep_hours&limit=7`, { headers });
        if (!sleepRes.ok) throw new Error((await sleepRes.json().catch(() => ({})))?.error || "Failed to fetch sleep");
        const sleepJson = await sleepRes.json();
        const sleepVals: number[] = Array.isArray(sleepJson?.data) ? sleepJson.data.map((d: any) => Number(d.value)) : [];
        if (mounted) setSleep(sleepVals);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Something went wrong loading IoT data");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const latestHr = useMemo(() => (hr.length ? hr[hr.length - 1] : 76), [hr]);
  const latestSteps = useMemo(() => (steps.length ? steps[steps.length - 1] : 8420), [steps]);
  const latestSleep = useMemo(() => (sleep.length ? sleep[sleep.length - 1] : 7.2), [sleep]);

  const stepsMax = useMemo(() => (steps.length ? Math.max(...steps) : 10000), [steps]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">IoT Health Data</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Connected device metrics with trends</p>
      </div>

      {error && <div className="card p-3 mb-4 text-sm text-red-600">{error}</div>}

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Heart Rate</div>
            <div className="text-xs text-emerald-600">{hr.length ? "+" : "~"}2 bpm</div>
          </div>
          <div className="mt-2 text-2xl font-semibold">{latestHr} bpm</div>
          <div className="mt-2 h-14">
            <Sparkline data={hr.length ? hr : [72, 74, 70, 76, 78, 75, 73, 77, 74, 72, 79, 76]} color="#ef4444" />
          </div>
          {loading && <div className="mt-2 text-xs text-gray-500">Loading...</div>}
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Steps (Today)</div>
            <div className="text-xs text-emerald-600">Goal 10k</div>
          </div>
          <div className="mt-2 text-2xl font-semibold">{latestSteps.toLocaleString()}</div>
          <div className="mt-2 h-14">
            <Sparkline data={steps.length ? steps : [3200, 5400, 6100, 8000, 7200, 9000, 10000]} color="#3b82f6" />
          </div>
          {loading && <div className="mt-2 text-xs text-gray-500">Loading...</div>}
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Sleep (hrs)</div>
          <div className="mt-2 text-2xl font-semibold">{latestSleep} h</div>
          <div className="mt-2 h-14">
            <Sparkline data={sleep.length ? sleep : [6.2, 7.5, 7.9, 6.8, 8.1, 7.0, 7.6]} color="#a855f7" />
          </div>
          {loading && <div className="mt-2 text-xs text-gray-500">Loading...</div>}
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold">Weekly Steps</h2>
          <div className="mt-4 grid grid-cols-7 gap-2 items-end h-40">
            {(steps.length ? steps : [3200, 5400, 6100, 8000, 7200, 9000, 10000]).map((v, i, arr) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-full bg-emerald-500/20 rounded">
                  <div
                    className="bg-emerald-500 rounded"
                    style={{ height: `${(v / (stepsMax || Math.max(...arr))) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500">D{i + 1}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold">Sleep Quality</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(sleep.length ? sleep : [6.2, 7.5, 7.9, 6.8, 8.1, 7.0, 7.6]).map((v, i) => (
              <li key={i} className="flex items-center justify-between">
                <span>Night {i + 1}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 bg-purple-500/20 rounded">
                    <div className="h-2 bg-purple-500 rounded" style={{ width: `${(v / 9) * 100}%` }} />
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">{v}h</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8 card p-6">
        <h2 className="font-semibold">Connect a Device</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Ready for API integration (Fitbit, Apple Health, Google Fit). Add your provider token to sync real data.</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <button className="rounded-md border px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5">Connect Fitbit</button>
          <button className="rounded-md border px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5">Connect Apple Health</button>
          <button className="rounded-md border px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5">Connect Google Fit</button>
        </div>
      </section>
    </main>
  );
}