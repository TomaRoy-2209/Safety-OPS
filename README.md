# 🚨 SafeCity Ops — Integrated Urban Safety & Emergency Response Platform

**Course:** CSE471 – System Analysis and Design  
**Semester:** Fall 2025  
**Group:** 08 (Lab Section 02)

🌐 **Live Deployment:** https://safety-ops.vercel.app/  
📦 **GitHub Repository:** https://github.com/TomaRoy-2209/Safety-OPS

---

## 📖 Project Overview

**SafeCity Ops** (also referred to as **SafetyOps**) is a smart city, web-based emergency and civic issue management platform that bridges the gap between **citizens in distress**, **emergency responders**, and **city administrators**.

The system enables **real-time incident reporting**, **intelligent dispatch**, **live monitoring**, and **data-driven safety analytics**. It supports both **critical emergencies** (fire, crime, medical) and **non-emergency civic maintenance issues** (potholes, broken streetlights), making it suitable for modern urban safety infrastructure.

This project was designed and implemented as part of **CSE471** with a strong emphasis on **scalability, reliability, real-time performance, and practical system design**.

---

## 🎯 Problem Statement & Vision

Urban emergency response systems often suffer from:
- Delayed reporting
- Lack of real-time coordination
- Poor visibility of city-wide risk patterns
- No fallback when internet connectivity fails

**SafeCity Ops** addresses these gaps by providing:
- GPS-based incident reporting
- Real-time admin command center
- Offline SMS fallback for responders
- AI-assisted incident summarization
- Heatmaps & predictive risk analysis

The long-term vision is to support **smarter, safer, and data-driven cities**.

---

## 👥 System Roles

| Role | Description |
|-----|------------|
| **Citizen** | Reports emergencies & maintenance issues, uploads evidence, tracks status, views safety maps |
| **Admin (Commander)** | Monitors incidents, dispatches units, broadcasts alerts, manages agencies & analytics |
| **Worker / Responder** | Receives assignments via dashboard & SMS, resolves incidents, updates status |

---

## 🚀 Core Features

### 👤 Citizen Module
- Secure registration & login (JWT-based)
- Emergency reporting with **automatic GPS geotagging**
- Maintenance issue reporting (roads, electricity, sewage)
- Photo & video evidence upload (cloud storage)
- Personal "My Reports" dashboard with live status tracking
- Tactical safety map & **heatmap-based risk visualization**
- Location-based **risk assessment index**

### 🧭 Admin Module (Command Center)
- Real-time incident feed using **WebSockets (Pusher)**
- Tactical incident map with live pins (Leaflet)
- AI-powered incident summarization (**Gemini 2.5 Flash**)
- Incident assignment & responder dispatch
- Disaster Mode: city-wide emergency broadcast (SMS + Push)
- Multi-agency workforce access control
- Weekly / monthly analytics with **CSV & PDF export**

### 🚑 Worker / Responder Module
- Offline **SMS alerts** via sms.net.bd
- Mission-specific dashboard
- Push notifications (Firebase Cloud Messaging)
- Incident resolution & status updates

---

## 🧠 Smart & Advanced Capabilities

- **AI Incident Summarization:** Converts long reports into concise 3-bullet summaries for faster decisions
- **Incident Heatmap Analytics:** Identifies high-risk zones using historical data
- **Predictive Risk Scoring:** Estimates neighborhood risk based on time, location, and incident type
- **Offline Reliability:** SMS fallback ensures alerts even without internet connectivity

---

## 🛠️ Technology Stack

### Frontend
- **Next.js** (React, SSR & routing)
- **Tailwind CSS** (responsive UI)
- **Leaflet & react-leaflet** (maps & heatmaps)

### Backend
- **Laravel (PHP)** — RESTful API
- **PostgreSQL** — relational database
- **JWT Authentication**

### Real-Time & Messaging
- **Pusher** — real-time incident feed
- **Firebase Cloud Messaging (FCM)** — push notifications
- **sms.net.bd** — offline SMS alerts

### AI & External APIs
- **Gemini 2.5 Flash** — AI incident summarization
- **Leaflet API** — geospatial visualization

### Deployment
- **Frontend:** Vercel  
- **Backend:** Render

---

## 🔌 API Highlights (Backend)

| Endpoint | Purpose |
|-------|--------|
| `POST /api/auth/register` | Citizen registration |
| `POST /api/auth/login` | JWT-based authentication |
| `POST /api/incidents` | Create emergency incident |
| `GET /api/incidents/heatmap` | Heatmap analytics data |
| `POST /api/incidents/{id}/assign` | Dispatch responder + notify |
| `POST /api/maintenance/tickets` | Submit maintenance issue |

---

## 📊 Performance & Reliability

- Optimized for **low-latency real-time updates**
- Tested on both **desktop & mobile environments**
- Efficient map rendering for high-density incident data
- SMS & push notifications ensure mission-critical delivery
- Scalable design to handle disaster-level traffic spikes

---

## 👨‍💻 Team & Contributions

| Name | Student ID | Key Contributions |
|----|-----------|------------------|
| **Ahmed Ifrad Anwar** | 22201801 | Evidence upload, real-time feed, heatmap analytics, disaster mode |
| **Toma Roy** | 22201429 | Authentication, incident dispatch, AI summarization, SMS integration |
| **Sabrina Sultana** | 22299072 | Incident reporting, access control, reports export, push notifications |
| **Shabnam Sharmin Tarin** | 22201031 | My Reports dashboard, map visualization, risk scoring, maintenance system |

---

## 📘 Documentation

A comprehensive **User Manual** is included in the repository, covering:
- Authentication & onboarding
- Citizen, Admin, and Worker workflows
- Incident reporting & tracking
- Disaster mode operations
- Notifications & analytics

---

## 🎓 Academic Context

This project was developed as part of **CSE471: System Analysis and Design**, focusing on:
- Requirement engineering
- Real-world system architecture
- Performance & network analysis
- Scalable and fault-tolerant design

---

## 📜 License

This project is developed for **academic and educational purposes**.

---

⭐ If you find this project interesting or useful, feel free to star the repository and explore the live deployment!

