"use client";

import { useMemo, useState } from "react";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  hospital: string;
  rating: number; // 0-5
  slots: string[]; // e.g., "2025-09-20T10:30"
};

const SPECIALTIES = [
  "All",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Pediatrician",
  "Orthopedic",
  "General Physician",
];

const DOCTORS: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Aisha Khan",
    specialty: "Cardiologist",
    hospital: "City Heart Center",
    rating: 4.8,
    slots: ["2025-10-24T10:30", "2025-10-24T14:00", "2025-10-25T09:15"],
  },
  {
    id: "d2",
    name: "Dr. Miguel Lopez",
    specialty: "Dermatologist",
    hospital: "Sunrise Clinic",
    rating: 4.6,
    slots: ["2025-10-24T11:00", "2025-10-25T16:30"],
  },
  {
    id: "d3",
    name: "Dr. Priya Narayanan",
    specialty: "Neurologist",
    hospital: "NeuroCare Institute",
    rating: 4.9,
    slots: ["2025-10-26T09:00", "2025-10-26T13:30", "2025-10-27T10:00"],
  },
  {
    id: "d4",
    name: "Dr. Ethan Wang",
    specialty: "General Physician",
    hospital: "Downtown Medical",
    rating: 4.5,
    slots: ["2025-10-24T09:45", "2025-10-24T12:15", "2025-10-25T15:00"],
  },
];

export default function Page() {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [scheduled, setScheduled] = useState<{ doctor: Doctor; when: string } | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null); // slot being submitted
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return DOCTORS.filter((d) =>
      (specialty === "All" || d.specialty === specialty) &&
      (d.name.toLowerCase().includes(query.toLowerCase()) || d.hospital.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query, specialty]);

  async function handleSchedule(doc: Doctor, slot: string) {
    setError(null);
    setSubmitting(slot);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("bearer_token") : null;
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          patient_name: "You",
          doctor_name: doc.name,
          specialty: doc.specialty.toLowerCase(),
          date: new Date(slot).getTime(),
          notes: `Booked via portal for ${doc.hospital}`,
        }),
      });
      if (!res.ok) {
        const msg = (await res.json().catch(() => ({})))?.error || "Failed to create appointment";
        throw new Error(msg);
      }
      setScheduled({ doctor: doc, when: slot });
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Book a Doctor</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">Search doctors, filter by specialty, and schedule an appointment</p>
      </div>

      {error && (
        <div className="card p-3 mb-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by doctor or hospital"
            className="w-full rounded-md border px-3 py-2 bg-transparent"
          />
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="w-full sm:w-56 rounded-md border px-3 py-2 bg-transparent"
          >
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((doc) => (
          <article key={doc.id} className="card p-4 flex flex-col">
            <div className="flex items-start gap-4">
              <img
                src={`https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=400&auto=format&fit=crop`}
                alt={doc.name}
                className="h-16 w-16 rounded-md object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{doc.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{doc.specialty} • {doc.hospital}</p>
                <div className="mt-1 text-xs text-emerald-600">★ {doc.rating.toFixed(1)}</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-sm text-gray-500 mb-2">Available slots</div>
              <div className="flex flex-wrap gap-2">
                {doc.slots.map((slot) => {
                  const d = new Date(slot);
                  const label = d.toLocaleString(undefined, { weekday: "short", hour: "2-digit", minute: "2-digit", month: "short", day: "2-digit" });
                  const isSubmitting = submitting === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => handleSchedule(doc, slot)}
                      disabled={isSubmitting}
                      className={`rounded-md border px-2.5 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-white/5 ${isSubmitting ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {isSubmitting ? "Booking..." : label}
                    </button>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </div>

      {scheduled && (
        <div className="fixed inset-x-0 bottom-4 flex justify-center px-4">
          <div className="card p-4 w-full max-w-lg flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">✓</div>
            <div className="flex-1">
              <p className="font-medium">Appointment Scheduled</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(scheduled.when).toLocaleString()} with {scheduled.doctor.name} ({scheduled.doctor.specialty})
              </p>
            </div>
            <button
              onClick={() => setScheduled(null)}
              className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}