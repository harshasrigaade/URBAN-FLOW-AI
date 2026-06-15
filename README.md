# 🌐 UrbanFlow AI — AI-Powered Smart Mobility Ecosystem
> Empowering Smart Cities with AI-Driven, Safe, Sustainable, and Intelligent Urban Mobility. 🚀🌱

UrbanFlow AI is an AI-powered smart mobility platform designed to solve modern urban transportation challenges. The system integrates intelligent route planning, traffic congestion forecasting, safety score mapping, emergency SOS services, transit cost optimization, and carbon footprint tracking into a single unified dashboard.

By combining AI, geospatial analytics, and real-time transit data, UrbanFlow AI helps citizens make travel decisions that are **Faster, Safer, Cheaper, and Greener**, while providing city managers with actionable urban planning analytics.

---

## 🌟 Key Features

1. 🗺️ **AI Multi-Objective Route Planner**: Optimizes journeys across five metrics (Fastest, Cheapest, Safest, Eco-Friendly, and Balanced) for Walking, Bicycling, Bus, Metro, Train, Auto, Taxi, and Ride Sharing.
2. 🚦 **AI Traffic Congestion Engine**: Predicts delays and traffic density hotspots using a Machine Learning Decision Tree Regressor model.
3. 🛡️ **Route Safety Scorer**: Employs an incident-weighted scorer that evaluates coordinates in real-time, classifying routes into Safe, Moderate Risk, and High Risk.
4. 🚨 **Emergency SOS Console**: Features a One-Tap Panic Alarm, trusted emergency contacts manager, automated SHE Teams responder dispatch simulation, and a fake call generator.
5. 🌱 **Sustainability & Carbon Accounting**: Computes active CO₂ emissions offset compared to driving an SUV, monitors travel mode splits, and rewards points (XP) for green commutes.
6. 💰 **Smart Cost Optimization**: Fare comparison engine across transit modes showing cost vs. time trade-offs and recommending high-savings public transport alternatives.
7. 📢 **Citizen Hazard Reporter**: Crowd-sourced hazard reporting (floods, collisions, dark alleys) with upvotes and automated municipal verification.
8. 🤖 **AI Travel Assistant Chat**: A natural language assistant that parses questions and automatically maps optimized routes on the view.
9. 📊 **Smart City Admin Panel**: Aggregate municipal analytics for city managers including congestion heatmaps, active incident logs, and carbon offset charts.

---

## 🚀 Live Demo
🌍 **Frontend Live App**: [Paste your Railway Frontend URL here!]
📡 **FastAPI API Swagger Docs**: [Paste your Railway Backend URL here!]/docs

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React.js, Vite, Tailwind CSS, Framer Motion, Leaflet Maps, Lucide Icons |
| **Backend** | Python, FastAPI, Uvicorn, SQLAlchemy ORM |
| **Database** | SQLite (Local/Development), support for PostgreSQL + PostGIS |
| **AI & ML** | Scikit-Learn (Decision Tree Regressor), Dijkstra Path Optimization, NLP Parsing |
| **GIS & Mapping**| OpenStreetMap API, OSRM Routing Engine, Leaflet API, GeoJSON |

---

## 📂 Project Structure

```text
UrbanFlow-AI/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── config.py         # App environment configuration
│   │   ├── database.py       # SQL database session setup
│   │   ├── auth.py           # JWT and bcrypt hashing logic
│   │   ├── models/           # SQLAlchemy models (User, Incident, SOS, Alerts)
│   │   ├── schemas/          # Pydantic validation schemas
│   │   ├── routers/          # FastAPI routers (auth, routes, safety, traffic, carbon, etc.)
│   │   └── ml/               # ML models, Dijkstra graph routing algorithm
│   ├── run.py                # Uvicorn launcher
│   └── requirements.txt      # Python dependencies list
├── frontend/                 # Vite + React + Tailwind CSS client
│   ├── src/
│   │   ├── components/       # UI Components (MapView, SOSButton, AIChat, CarbonTracker, etc.)
│   │   ├── context/          # MobilityContext global state provider
│   │   └── services/         # api.js API fetch wrapper
│   ├── tailwind.config.js    # Custom brand styling configuration
│   └── package.json          # Node dependencies list
├── docker-compose.yml        # Multi-node container setup
└── README.md                 # Project documentation
```

---

## 💻 Local Setup & Quick Run

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
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the database migrations (optional, adds columns like `phone`):
   ```bash
   python run.py
   ```
   *The backend will start on **`http://localhost:8000`** (Swagger docs are available at `http://localhost:8000/docs`).*

### Step 2: Run the Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Open **`https://urban-flow-ai-production.up.railway.app/`** in your browser to experience UrbanFlow AI!*

---




## 👨‍💻 Team
* **G. Harsha Sri** – AI Specialist
* **P. Sindhu Reddy** – Full-Stack Architect

---

## 📜 License
This project is licensed under academic and smart city research initiatives.
