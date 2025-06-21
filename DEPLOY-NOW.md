# 🚀 Launch Aquelia Today - Quick Deployment Guide

## **Option 1: Render.com (Recommended - 5 minutes)**

1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository** (you'll need to push to GitHub first)
4. **Configure the service:**
   - **Name:** `aquelia-backend`
   - **Environment:** `Node`
   - **Build Command:** `npm ci`
   - **Start Command:** `node backend/server-node.js`
   - **Plan:** Free

5. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=your-supabase-url
   HUBTEL_CLIENT_ID=your-hubtel-client-id
   HUBTEL_CLIENT_SECRET=your-hubtel-client-secret
   HUBTEL_SENDER_ID=your-sender-id
   ```

6. **Click "Create Web Service"** - Done! 🎉

## **Option 2: Railway.com (Alternative)**

1. **Go to [railway.app](https://railway.app)**
2. **Click "New Project" → "Deploy from GitHub repo"**
3. **Select your repository**
4. **Add environment variables** (same as above)
5. **Deploy!**

## **Option 3: Vercel (Alternative)**

1. **Go to [vercel.com](https://vercel.com)**
2. **Import your GitHub repository**
3. **Configure build settings:**
   - **Framework Preset:** Other
   - **Build Command:** `npm ci`
   - **Output Directory:** `backend`
   - **Install Command:** `npm ci`
4. **Deploy!**

## **After Backend Deployment:**

1. **Copy your backend URL** (e.g., `https://aquelia-backend.onrender.com`)
2. **Update `lib/trpc.ts`** with your production URL
3. **Deploy frontend** with Expo Application Services

## **Frontend Deployment:**

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for production
eas build --platform all
```

## **Database Setup:**

1. **Go to [supabase.com](https://supabase.com)**
2. **Create new project**
3. **Get your database URL**
4. **Update environment variables**
5. **Run migrations:**
   ```bash
   npx prisma db push
   ```

## **SMS Setup:**

1. **Go to [hubtel.com](https://hubtel.com)**
2. **Get your credentials**
3. **Update environment variables**

## **🎯 You're Ready to Launch!**

Your app will be live at:
- **Backend:** `https://your-backend-url.com`
- **Frontend:** Available on App Store/Play Store

## **Quick Test:**

```bash
# Test your deployed backend
curl https://your-backend-url.com/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-06-21T04:20:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

## **🚀 Launch Checklist:**

- [ ] Backend deployed and responding
- [ ] Database connected and migrated
- [ ] SMS service configured
- [ ] Frontend built and deployed
- [ ] App tested on real devices
- [ ] Ready for users! 🎉

**Time to launch: ~15 minutes total!** 