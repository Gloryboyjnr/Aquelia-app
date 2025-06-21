#!/bin/bash

echo "🚀 Setting up GitHub repository for deployment..."
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Please run: git init"
    exit 1
fi

echo "📝 Please create a GitHub repository manually:"
echo "1. Go to https://github.com/new"
echo "2. Repository name: aquelia-app"
echo "3. Make it Public"
echo "4. Don't initialize with README (we already have one)"
echo "5. Click 'Create repository'"
echo ""

read -p "✅ Have you created the GitHub repository? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔗 Adding remote origin..."
    git remote add origin https://github.com/$(git config user.name)/aquelia-app.git
    
    echo "📤 Pushing to GitHub..."
    git branch -M main
    git push -u origin main
    
    echo ""
    echo "✅ Repository pushed to GitHub!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Go to https://render.com"
    echo "2. Click 'New +' → 'Web Service'"
    echo "3. Connect your GitHub repository"
    echo "4. Follow the deployment guide in DEPLOY-NOW.md"
    echo ""
    echo "🚀 Ready to launch!"
else
    echo "❌ Please create the GitHub repository first, then run this script again."
fi 