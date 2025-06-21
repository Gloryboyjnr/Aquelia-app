#!/bin/bash

echo "🚀 Aquelia Quick Deployment Script"
echo "=================================="
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

echo "🔐 Please login to Railway..."
railway login

echo "🚀 Deploying to Railway..."
railway init
railway link

echo "⚙️  Setting up environment variables..."
echo "Please add these environment variables in Railway dashboard:"
echo ""
echo "DATABASE_URL=your-supabase-url"
echo "HUBTEL_CLIENT_ID=your-hubtel-client-id"
echo "HUBTEL_CLIENT_SECRET=your-hubtel-client-secret"
echo "HUBTEL_SENDER_ID=your-sender-id"
echo "NODE_ENV=production"
echo "PORT=10000"
echo ""

echo "🚀 Deploying backend..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your backend URL will be shown above"
echo ""
echo "📱 Next steps:"
echo "1. Copy your Railway URL"
echo "2. Update lib/trpc.ts with the production URL"
echo "3. Deploy frontend with: eas build --platform all"
echo ""
echo "🎯 Ready to launch!" 