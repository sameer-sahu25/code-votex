# RansomWatch — Ransomware Early Warning Simulator

A real-time cybersecurity tool that detects and stops ransomware attacks before they complete.

## Features

- 🐦 **Canary File System**: Honeypot files that trigger alerts when accessed
- 🔢 **File Entropy Analyzer**: Detects encrypted files by measuring randomness
- 💻 **Process Behavior Monitor**: Tracks suspicious processes in real-time
- 📊 **AI Threat Score Engine**: Calculates risk scores (0-100)
- 🔌 **Automatic Network Kill Switch**: Isolates the system to stop spread
- 📱 **Mobile Responsive**: Works on all device sizes
- 🎨 **Beautiful UI**: Modern dark theme with smooth animations

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Clerk (Auth)
- **Backend**: Node.js, Express, Sequelize (ORM), PostgreSQL, Redis, Socket.io, Zod
- **ML Service**: Python 3.11, FastAPI, Scikit-learn, Watchdog, Psutil
- **DevOps**: Docker, Docker Compose, GitHub Actions

## Project Structure

```
ransomwatch/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── lib/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   └── middleware/
│   └── package.json
├── ml-service/
│   ├── app/
│   │   ├── analyzer/
│   │   ├── watcher/
│   │   └── api/
│   └── main.py
├── docker/
└── docker-compose.yml
```

## Quick Start (Docker)

1. **Clone the repo**:
   ```bash
   git clone <your-repo-url>
   cd ransomwatch
   ```

2. **Copy env files**:
   ```bash
   cp backend/.env.example backend/.env
   cp ml-service/.env.example ml-service/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Update environment variables**:
   - Add your Clerk API keys to `frontend/.env`
   - Add `ML_API_KEY` to both `backend/.env` and `ml-service/.env`

4. **Start all services**:
   ```bash
   docker-compose up --build
   ```

5. **Access the app**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - ML Service API: http://localhost:8000

## Quick Start (Local)

### Backend
```bash
cd backend
npm install
npm run dev
```

### ML Service
```bash
cd ml-service
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Services

| Service       | Port | Description                 |
|---------------|------|-----------------------------|
| Frontend      | 3000 | React UI                    |
| Backend       | 5000 | Express REST API + Socket   |
| ML Service    | 8000 | FastAPI ML Service          |
| PostgreSQL    | 5432 | Database                    |
| Redis         | 6379 | Caching & sessions          |

## Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (optional)

### Environment Variables

**Backend** (.env)
```
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ransomwatch
DB_USER=postgres
DB_PASSWORD=password
REDIS_HOST=localhost
REDIS_PORT=6379
CLERK_SECRET_KEY=your_clerk_secret
ML_API_KEY=your_ml_api_key
ML_SERVICE_URL=http://localhost:8000
```

**Frontend** (.env)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_BACKEND_URL=http://localhost:5000
```

**ML Service** (.env)
```
ML_API_KEY=your_ml_api_key
BACKEND_URL=http://localhost:5000
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Build
```bash
cd frontend
npm run build
```

## Deployment

The project includes a GitHub Actions CI/CD pipeline at `.github/workflows/deploy.yml`.
It runs tests on PRs and deploys on pushes to `main`.


## License

MIT
