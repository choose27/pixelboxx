#!/bin/bash

# PixelBoxx AI Service - Development Runner

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install/upgrade dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Check for .env file
if [ ! -f ".env" ]; then
    echo "No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "Please edit .env with your API keys before running."
    exit 1
fi

# Run the service
echo "Starting PixelBoxx AI Service..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000
