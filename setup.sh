#!/bin/bash

# 🎯 Quiz Battle - Auto Setup Script
# This script sets up the entire project automatically

set -e

echo "🎯 Quiz Battle - Automated Setup"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node -v)"
echo "✅ npm found: $(npm -v)"
echo ""

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p server client/src

# Setup Backend
echo ""
echo "🔧 Setting up Backend..."
echo "========================"

cd server

if [ ! -d "node_modules" ]; then
    echo "📦 Installing server dependencies..."
    npm install
else
    echo "✅ Server dependencies already installed"
fi

# Setup Frontend
echo ""
echo "🔧 Setting up Frontend..."
echo "========================"

cd ../client

if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next Steps:"
echo "1. Make sure MongoDB is running: mongod"
echo "2. Start backend: cd server && npm run dev"
echo "3. Start frontend (new terminal): cd client && npm start"
echo ""
echo "🎯 Dashboard will open at http://localhost:3000"
echo ""
