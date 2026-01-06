# Futures Trading Platform

A modern Next.js application for viewing Chinese futures market data using AKShare.

## Features

- Real-time Chinese futures market data
- Support for all major Chinese futures exchanges (SHFE, DCE, CZCE, CFFEX, INE, GFEX)
- Beautiful, responsive UI with dark theme
- Search and filter functionality
- Auto-refresh every 30 seconds

## Setup

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.8+ (for AKShare backend)

### Frontend Setup

1. Install dependencies:
```bash
pnpm install
```

2. Start the development server:
```bash
pnpm dev
```

The app will be available at `http://localhost:3003`

### Backend Setup (AKShare)

The backend fetches real-time data from AKShare API.

**Option 1: Use the startup script (Recommended)**
```bash
chmod +x start_backend.sh
./start_backend.sh
```

**Option 2: Manual setup**

1. Create and activate virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the backend server:
```bash
python3 backend_example.py
```

**Note:** If you get `ModuleNotFoundError: No module named 'akshare'`, make sure you:
- Have activated the virtual environment: `source venv/bin/activate`
- Installed dependencies: `pip install -r requirements.txt`

The backend will run on `http://localhost:8000`

## Project Structure

```
futures/
├── app/
│   ├── cn/
│   │   └── page.tsx          # Chinese futures market page
│   ├── api/
│   │   └── futures/
│   │       └── cn/
│   │           └── route.ts   # Next.js API route
│   ├── page.tsx               # Home page
│   └── layout.tsx
├── backend_example.py         # Python Flask backend with AKShare
├── requirements.txt           # Python dependencies
└── package.json
```

## API Endpoints

### Backend (Python Flask)

- `GET /api/futures/cn` - Get all Chinese futures market data
- `GET /api/futures/cn/exchanges` - Get list of exchanges
- `GET /api/futures/cn/test` - Test AKShare connection
- `GET /health` - Health check

### Frontend (Next.js)

- `GET /api/futures/cn` - Proxy to Python backend

## AKShare Integration

This project uses [AKShare](https://akshare.akfamily.xyz/) to fetch Chinese futures data.

API Documentation: https://akshare.akfamily.xyz/data/futures/futures.html#id53

The backend uses `ak.futures_zh_spot()` to fetch real-time market data from all major Chinese futures exchanges.

## Development

### Running Both Services

1. Terminal 1 - Start Python backend:
```bash
python3 backend_example.py
```

2. Terminal 2 - Start Next.js frontend:
```bash
pnpm dev
```

### Testing

Test the backend connection:
```bash
curl http://localhost:8000/api/futures/cn/test
```

## License

See LICENSE file