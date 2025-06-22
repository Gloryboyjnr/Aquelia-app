#!/bin/bash

echo "🚀 Aquelia Vercel Deployment"
echo "============================"
echo ""

# Check if Vercel CLI is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js first."
    exit 1
fi

echo "🔐 Logging into Vercel..."
npx vercel login

echo ""
echo "🚀 Deploying to Vercel..."
echo "This will ask you a few questions:"
echo "- Set up and deploy: Yes"
echo "- Which scope: Choose your account"
echo "- Link to existing project: No"
echo "- Project name: aquelia-backend"
echo "- Directory: ./ (current directory)"
echo ""

npx vercel --prod

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your Vercel URL will be shown above"
echo ""
echo "📱 Next steps:"
echo "1. Copy your Vercel URL (e.g., https://aquelia-backend.vercel.app)"
echo "2. Update lib/trpc.ts with the production URL"
echo "3. Deploy frontend with: eas build --platform all"
echo ""
echo "🎯 Ready to launch!" 