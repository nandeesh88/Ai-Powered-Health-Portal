# AI Powered Health Portal
Smart healthcare platform that lets patients book doctors, view medical history and track IoT health metrics in real time.  

## 🚀 Features  
- **Dashboard (/):** View upcoming appointment + IoT metrics (heart rate, steps, sleep hours).  
- **Book Doctor (/book):** Browse available slots and book appointments with real doctors.  
- **Medical History (/history):** Fetch past records with loading/empty/error states.  
- **IoT Metrics (/iot):** Displays health data with sparklines and bar charts.  
- **Auth Ready:** API calls include bearer token from `localStorage` if available.  

## ⚙️ Tech Stack  
- **Frontend:** Next.js (App Router) + TailwindCSS  
- **Backend APIs:** Database-backed routes under `/api/appointments`, `/api/history`, `/api/iot`  
- **Database:** PostgreSQL (configurable)  
- **Hosting:** Vercel (frontend) + Render/AWS (backend)  

## 📡 API Highlights  
- `GET /api/appointments?upcoming=true&limit=1` → Upcoming appointment  
- `POST /api/appointments` → Create appointment  
- `GET /api/history?order=desc&limit=50` → Past medical records  
- `GET /api/iot?metric=heart_rate|steps|sleep_hours` → IoT health metrics  

## 🔮 Next Steps  
- Add appointment **update/cancel** options  
- Support **create/delete** for history entries  
- Role-based access (doctor vs patient)  

---
💡 Navigate to `/book` from the navbar or the dashboard’s **Book a Doctor** button to see available doctors.  
