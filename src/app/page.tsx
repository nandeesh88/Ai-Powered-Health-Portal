"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Sparkline from "@/components/Sparkline";

export default function Home() {
  const [heartRate, setHeartRate] = useState<number[]>([]);
  const [steps, setSteps] = useState<number[]>([]);
  const [upcoming, setUpcoming] = useState<{ date: number; doctorName: string; specialty: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;

    async function load() {
      try {
        // Upcoming appointment
        const apptRes = await fetch(`/api/appointments?upcoming=true&limit=1`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (apptRes.ok) {
          const appts = await apptRes.json();
          if (mounted && Array.isArray(appts) && appts.length > 0) {
            const a = appts[0];
            setUpcoming({ date: a.date, doctorName: a.doctorName, specialty: a.specialty });
          }
        }

        // Heart rate sparkline
        const hrRes = await fetch(`/api/iot?metric=heart_rate&limit=10`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (hrRes.ok) {
          const data = await hrRes.json();
          const vals: number[] = Array.isArray(data?.data)
            ? data.data.map((d: any) => Number(d.value))
            : [];
          if (mounted && vals.length) setHeartRate(vals);
        }

        // Steps sparkline
        const stepsRes = await fetch(`/api/iot?metric=steps&limit=10`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (stepsRes.ok) {
          const data = await stepsRes.json();
          const vals: number[] = Array.isArray(data?.data)
            ? data.data.map((d: any) => Number(d.value))
            : [];
          if (mounted && vals.length) setSteps(vals);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const latestHr = useMemo(() => (heartRate.length ? heartRate[heartRate.length - 1] : 75), [heartRate]);
  const latestSteps = useMemo(() => (steps.length ? steps[steps.length - 1] : 8420), [steps]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Patient Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Overview of your health, appointments, and activity</p>
        </div>
        <div className="flex gap-2">
          <Link href="/book" className="inline-flex items-center rounded-md bg-emerald-500 px-3 py-2 text-white hover:bg-emerald-600">Book a Doctor</Link>
          <Link href="/chatbot" className="inline-flex items-center rounded-md border px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5">Ask AI</Link>
        </div>
      </div>

      <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500">Upcoming Appointment</div>
          {upcoming ? (
            <>
              <div className="mt-2 text-lg font-medium">{new Date(upcoming.date).toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{upcoming.doctorName} • {upcoming.specialty}</div>
            </>
          ) : (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{loading ? "Loading..." : "No upcoming appointment"}</div>
          )}
          <Link className="mt-4 inline-block text-emerald-600 hover:underline" href="/book">Manage</Link>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Heart Rate</div>
            <div className="text-xs text-emerald-600">{heartRate.length ? "+" : "~"}3 bpm</div>
          </div>
          <div className="mt-2 text-2xl font-semibold">{latestHr} bpm</div>
          <div className="mt-2 h-12"><Sparkline data={heartRate.length ? heartRate : [72, 74, 70, 76, 78, 75, 73, 77, 74, 72]} color="#22c55e" /></div>
          <Link className="mt-4 inline-block text-emerald-600 hover:underline" href="/iot">See trends</Link>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Steps Today</div>
            <div className="text-xs text-emerald-600">Goal 10k</div>
          </div>
          <div className="mt-2 text-2xl font-semibold">{latestSteps.toLocaleString()}</div>
          <div className="mt-2 h-12"><Sparkline data={steps.length ? steps : [3200, 5400, 6100, 8000, 7200, 9000, 10000]} color="#3b82f6" /></div>
          <Link className="mt-4 inline-block text-emerald-600 hover:underline" href="/iot">Activity</Link>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Sleep Last Night</div>
          <div className="mt-2 text-2xl font-semibold">7h 35m</div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Quality Good</p>
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Link href="/history" className="text-sm text-emerald-600 hover:underline">View all</Link>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              <div>
                <p>Blood test results uploaded</p>
                <p className="text-gray-500">2 days ago</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
              <div>
                <p>Prescription refilled: Atorvastatin 10mg</p>
                <p className="text-gray-500">1 week ago</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-purple-500" />
              <div>
                <p>Visit summary added: General Checkup</p>
                <p className="text-gray-500">3 weeks ago</p>
              </div>
            </li>
          </ul>
        </div>
        <div className="card p-4">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Link href="/book" className="rounded-md border px-3 py-2 text-center hover:bg-gray-50 dark:hover:bg-white/5">Book Doctor</Link>
            <Link href="/chatbot" className="rounded-md border px-3 py-2 text-center hover:bg-gray-50 dark:hover:bg-white/5">Ask AI</Link>
            <Link href="/history" className="rounded-md border px-3 py-2 text-center hover:bg-gray-50 dark:hover:bg-white/5">Medical History</Link>
            <Link href="/iot" className="rounded-md border px-3 py-2 text-center hover:bg-gray-50 dark:hover:bg-white/5">IoT Data</Link>
          </div>
          <div className="mt-6 rounded-md overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1200&auto=format&fit=crop"
              alt="Healthcare"
              className="h-40 w-full object-cover"
            />
          </div>
        </div>
      </section>
    </main>
  );
}