#!/bin/bash

# Start the Python backend for AKShare futures data

echo "Starting AKShare Futures Backend..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Start the backend server
echo ""
echo "Starting backend server on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""
python3 backend_example.py

