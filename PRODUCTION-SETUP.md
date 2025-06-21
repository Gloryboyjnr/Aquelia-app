# 🚀 Production Setup Guide

## **Launch Timeline: TODAY**

### **Phase 1: Database Setup (30 minutes)**

#### **1.1 Configure Supabase**
```bash
# 1. Go to your Supabase project dashboard
# 2. Get your connection string from Settings > Database
# 3. Update your .env file:

DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

#### **1.2 Migrate Schema to Supabase**
```bash
# Generate Prisma client for Supabase
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Verify connection
npx prisma studio
```

### **Phase 2: Backend Deployment (45 minutes)**

#### **2.1 Deploy to Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend
vercel --prod

# Get your production URL (e.g., https://your-app.vercel.app)
```

#### **2.2 Configure Production Environment**
```bash
# Set production environment variables in Vercel dashboard:
DATABASE_URL="your-supabase-url"
HUBTEL_CLIENT_ID="your-hubtel-client-id"
HUBTEL_CLIENT_SECRET="your-hubtel-client-secret"
HUBTEL_SENDER_ID="your-sender-id"
NODE_ENV="production"
```

### **Phase 3: Frontend Deployment (30 minutes)**

#### **3.1 Configure Production Backend URL**
```typescript
// Update lib/trpc.ts
const getBaseUrl = () => {
  if (__DEV__) {
    return "http://localhost:4000";
  }
  return "https://your-backend-domain.vercel.app"; // Your Vercel URL
};
```

#### **3.2 Deploy to Expo Application Services (EAS)**
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build for production
eas build --platform all --profile production

# Submit to app stores (optional)
eas submit --platform all
```

### **Phase 4: SMS Service Setup (15 minutes)**

#### **4.1 Configure Hubtel Production**
1. **Get your Hubtel production credentials**
2. **Update environment variables**
3. **Test SMS delivery**

```bash
# Test production SMS
curl -X POST https://your-backend-domain.vercel.app/api/test-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+233204204583"}'
```

### **Phase 5: Testing & Launch (30 minutes)**

#### **5.1 Production Testing Checklist**
- [ ] Database connection works
- [ ] OTP API sends SMS
- [ ] Frontend connects to backend
- [ ] App works on real devices
- [ ] No console errors

#### **5.2 Launch Steps**
1. **Share Expo Go link** for immediate testing
2. **Submit to app stores** (if needed)
3. **Monitor logs** for any issues
4. **Gather user feedback**

## **🎯 Total Time: ~2.5 hours**

### **Priority Order:**
1. **Database** (Supabase) - Most critical
2. **Backend** (Vercel) - Core functionality
3. **Frontend** (EAS) - User interface
4. **SMS** (Hubtel) - OTP delivery
5. **Testing** - Quality assurance

## **🔧 Quick Commands**

### **Database Migration**
```bash
# Switch to Supabase
npx prisma db push

# Verify data
npx prisma studio
```

### **Backend Deployment**
```bash
# Deploy to Vercel
cd backend
vercel --prod
```

### **Frontend Build**
```bash
# Build production app
eas build --platform all --profile production
```

## **📱 Distribution Options**

### **Option 1: Expo Go (Immediate)**
- Share QR code with users
- Works instantly
- No app store approval needed

### **Option 2: App Stores (1-7 days)**
- Submit to Apple App Store
- Submit to Google Play Store
- Professional distribution

### **Option 3: Internal Testing**
- TestFlight (iOS)
- Internal Testing (Android)
- Limited to specific users

## **🚨 Emergency Fallback**

If anything fails:
1. **Keep using local SQLite** for now
2. **Deploy backend only** to Vercel
3. **Use Expo Go** for immediate testing
4. **Fix issues** and redeploy

## **📞 Support Contacts**

- **Supabase**: Dashboard support
- **Vercel**: Documentation & community
- **Expo**: Discord community
- **Hubtel**: Technical support

---

**Ready to launch? Let's start with Phase 1!** 🚀 