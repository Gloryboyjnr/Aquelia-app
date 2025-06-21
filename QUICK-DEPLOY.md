# 🚀 Quick Deployment Guide - Launch Today!

## **Option 1: Railway (Recommended - 10 minutes)**

### **Step 1: Deploy to Railway**
1. **Go to [Railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your Aquelia repository**
6. **Set root directory to `backend`**
7. **Railway will auto-detect and deploy**

### **Step 2: Configure Environment Variables**
In Railway dashboard, add these variables:
```
DATABASE_URL=your-supabase-url
HUBTEL_CLIENT_ID=your-hubtel-client-id
HUBTEL_CLIENT_SECRET=your-hubtel-client-secret
HUBTEL_SENDER_ID=your-sender-id
NODE_ENV=production
PORT=10000
```

### **Step 3: Get Your Production URL**
Railway will give you a URL like: `https://aquelia-backend-production.up.railway.app`

---

## **Option 2: Render (Alternative - 15 minutes)**

### **Step 1: Deploy to Render**
1. **Go to [Render.com](https://render.com)**
2. **Sign up with GitHub**
3. **Click "New Web Service"**
4. **Connect your GitHub repo**
5. **Set root directory to `backend`**
6. **Environment: Bun**
7. **Build Command: `echo "No build step needed"`
8. **Start Command: `bun run hono.ts`**

### **Step 2: Configure Environment Variables**
Same as Railway above.

---

## **Option 3: Vercel (If login works)**

### **Step 1: Fix Vercel Login**
```bash
# Try different login methods
npx vercel login --github
# or
npx vercel login --email your-email@example.com
```

### **Step 2: Deploy**
```bash
cd backend
npx vercel --prod
```

---

## **🎯 Next Steps After Backend Deployment**

### **1. Update Frontend Backend URL**
```typescript
// In lib/trpc.ts, update getBaseUrl():
const getBaseUrl = () => {
  if (__DEV__) {
    return "http://localhost:4000";
  }
  return "https://your-railway-url.up.railway.app"; // Your production URL
};
```

### **2. Test Production Backend**
```bash
# Test health endpoint
curl https://your-production-url/api/health

# Test OTP API
curl -X POST https://your-production-url/api/test-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+233204204583"}'
```

### **3. Deploy Frontend**
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build for production
eas build --platform all --profile production
```

---

## **⏱️ Timeline**

- **Backend Deployment**: 10-15 minutes
- **Frontend Build**: 30 minutes
- **Testing**: 15 minutes
- **Total**: ~1 hour

---

## **🚨 Emergency Fallback**

If deployment fails:
1. **Keep using local backend** for now
2. **Share Expo Go link** for immediate testing
3. **Fix deployment issues** and redeploy
4. **Launch with local backend** if needed

---

**Ready to deploy? Choose Railway (Option 1) for the fastest deployment!** 🚀 