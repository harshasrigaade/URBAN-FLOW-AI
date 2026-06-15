<<<<<<< HEAD
# UrbanFlow AI - AI-Powered Smart Mobility Ecosystem

UrbanFlow AI is an AI-powered smart mobility platform that helps citizens and city authorities travel **Faster, Safer, Cheaper, and Greener**. It combines journey planning, real-time traffic congestion forecasts, safety ratings, emergency alarms, and carbon accounting into an integrated dark-theme glassmorphism web and mobile dashboard.

---

## Key Features

1. **AI Multi-Objective Route Planner**: Evaluates Fastest, Cheapest, Safest, Eco-Friendly, and Balanced journeys for Walking, Bicycling, Bus, Metro, Train, Auto, Taxi, and Ride Sharing.
2. **AI Traffic Congestion Engine**: Predicts delays and traffic density hotspots using a Decision Tree Regressor model.
3. **Route Safety Scorer**: Employs an incident-weighted scorer classifying regions into Safe, Moderate Risk, and High Risk categories.
4. **Emergency SOS Console**: One-Tap Panic Alarm, trusted contacts manager, SHE Teams responder dispatch simulation, and Fake Call generator to deter harassment.
5. **Sustainability Tracker & Green Rewards**: Computes carbon offsets vs driving an SUV, monitors travel mode splits, and rewards points (XP) for green commutes.
6. **Smart Cost Optimization**: Displays fare breakdowns and details how swapping to public transit alternatives maximizes savings.
7. **Citizen Hazard Reporter**: Crowd-sources incident logging (collisions, flooded roads, streetlights out) with upvotes and automated verification.
8. **AI Travel Chatbot**: A natural language assistant that parses questions and automatically maps optimized routes.
9. **Smart City Admin Panel**: Aggregate municipal analytics for city managers including congestion heatmaps, daily incidents charts, and environmental savings.

---

## Project Structure

```
UrbanFlow-AI/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── config.py         # App environment configuration
│   │   ├── database.py       # SQL SQLAlchemy database setup
│   │   ├── auth.py           # JWT and bcrypt hashing logic
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── routers/          # FastAPI routers (auth, routes, safety, traffic, carbon, etc.)
│   │   └── ml/               # Python ML models and Dijkstra graph router
│   ├── run.py                # Uvicorn launcher
│   └── requirements.txt      # Python dependencies list
├── frontend/                 # Vite + React + Tailwind CSS client
│   ├── src/
│   │   ├── components/       # UI (MapView, SOSButton, AIChat, CarbonTracker, etc.)
│   │   ├── context/          # MobilityContext global state provider
│   │   └── services/         # api.js fetch wrappers
│   └── tailwind.config.js    # Custom brand styles configuration
├── docker-compose.yml        # Multi-node container setup
└── README.md                 # System documentation
```

---

## Local Setup & Quick Run

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### Step 1: Run the Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Launch the FastAPI server:
   ```bash
   python run.py
   ```
   The backend will start on **`http://localhost:8000`** (Swagger docs are available at `http://localhost:8000/docs`).

### Step 2: Run the Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development node:
   ```bash
   npm run dev
   ```
   Open **`http://localhost:5173`** in your browser to experience UrbanFlow AI!

---

## Seed Authentication Accounts
During startup, the database is auto-seeded with test accounts for quick evaluation:

### Citizen Account (Jane Doe)
- **Email**: `user@urbanflow.ai`
- **Password**: `password123`

### City Manager Admin Account
- **Email**: `admin@urbanflow.ai`
- **Password**: `adminpassword`

*(Alternatively, use the quick login buttons at the bottom of the sign-in form.)*
=======
🚦 UrbanFlow AI – Smart Mobility Ecosystem
(Travel Faster, Safer, Cheaper, and Greener)

UrbanFlow AI is an AI-powered smart mobility platform designed to solve modern urban transportation challenges. The system integrates intelligent route planning, traffic prediction, women's safety features, emergency SOS services, cost optimization, and carbon footprint tracking into a single application. By combining AI, geospatial analytics, and real-time transit data, UrbanFlow AI helps commuters make smarter travel decisions while promoting sustainable transportation.


🌟 Features

🗺️ Intelligent Route Planning

* Multi-objective route optimization
* Fastest, Cheapest, Safest, and Eco-Friendly route options
* Multi-modal transportation support (Metro, Bus, Auto, Taxi, Walking, Cycling)
* Real-time route recommendations

🚨 Women's Safety & Emergency System

* AI-based Safety Score (0–10)
* One-Tap SOS Emergency Alert
* Route Safety Monitoring

🚦 Traffic Prediction

* Machine Learning-based congestion forecasting
* Predictive traffic analysis
* Smart rerouting suggestions
* Reduced travel time and delays

🌱 Carbon Footprint Tracking

* CO₂ emission calculation
* Green commute recommendations
* Sustainability score tracking
* Environmental impact monitoring

💰 Cost Optimization

* Fare comparison across transportation modes
* Cost vs Time trade-off analysis
* Dynamic travel recommendations
* Monthly savings estimation

📊 Smart City Analytics

* Congestion heatmaps
* Incident density reports
* Environmental impact analysis
* Urban mobility insights


🏗️ System Architecture


User
  │
  ▼
React Frontend
  │
  ▼
FastAPI Backend
  │
  ├── Route Optimization Engine
  ├── Safety Intelligence Module
  ├── Traffic Prediction Model
  ├── Carbon Tracking Module
  └── Fare Optimization Engine
  │
  ▼
PostgreSQL + PostGIS Database
  │
  ▼
OpenStreetMap / OSRM APIs


🛠️ Technology Stack

Frontend
* React.js
* Vite
* Tailwind CSS
* Framer Motion
* Lucide Icons
* Leaflet Maps

Backend
* FastAPI
* Uvicorn
* WebSockets
* JWT Authentication

Database
* PostgreSQL
* PostGIS
* SQLAlchemy ORM

AI & Machine Learning
* Scikit-Learn
* Decision Tree Regressor
* Dijkstra Algorithm
* Route Optimization Models
* NLP Assistant

GIS & Mapping
* OpenStreetMap
* OSRM Routing Engine
* GeoJSON
* Leaflet API


🎯 Problem Statement

Urban commuters face challenges such as traffic congestion, safety concerns, high transportation costs, and increasing carbon emissions. Existing solutions address these problems separately, forcing users to switch between multiple applications. UrbanFlow AI provides a unified platform that intelligently optimizes travel based on speed, cost, safety, and sustainability.

🚀 Key Benefits
* Faster route recommendations
* Improved commuter safety
* Reduced transportation costs
* Lower carbon emissions
* Better public transport adoption
* Smart city data analytics


📈 Future Enhancements

* IoT-based smart streetlight integration
* Live SHE Teams integration
* Smart traffic signal optimization
* Real-time city-wide congestion management
* Multi-city deployment
* AI-powered voice travel assistant


👨‍💻 Team

G. Harsha Sri** – AI Specialist
P. Sindhu Reddy** – Full-Stack Architect

📜 License

This project is developed for hackathons, academic research, and smart city innovation initiatives.

🌍 Vision

"Empowering Smart Cities with AI-Driven, Safe, Sustainable, and Intelligent Urban Mobility." 🚀🌱
>>>>>>> 26f0b892529fdc383f77daf7b94ea9641126ef41
