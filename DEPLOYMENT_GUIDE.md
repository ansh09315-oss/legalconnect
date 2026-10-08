# 🚀 Legal Connect - Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. ✅ Database Setup (Supabase)

**URL:** https://dimpexgzgsjbxiisavmk.supabase.co

#### Steps:
1. Go to Supabase Dashboard → SQL Editor
2. Open `DATABASE_SETUP.sql` from this project
3. Copy the entire SQL script
4. Paste into SQL Editor and click "Run"
5. Verify tables created:
   - Go to Table Editor
   - Check for `clients` and `lawyers` tables
   - Verify columns and indexes exist

#### Verify Storage Bucket:
1. Dashboard → Storage
2. Check `lawyer-photos` bucket exists
3. Verify it's set to "Public"

---

### 2. 🔧 Netlify Environment Variables

**Important:** Set these in Netlify Dashboard → Site Settings → Environment Variables

```bash
# Supabase Configuration (Public - used in frontend)
VITE_SUPABASE_URL=https://dimpexgzgsjbxiisavmk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_A20nzTMuNVOaK2CasmR7YQ_sATKQ5CI

# Admin Credentials (Private - used in Netlify Functions only)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Ansh2015

# JWT Secret (Private - used in Netlify Functions only)
JWT_SECRET=089e675445adbb3429b0cdd26f4953dbaa4c599ae574a0d80e114da15701c323

# Optional: External APIs
ZAVUDEV_API_KEY=zv_live_26a189524096f10e2d58763b9f186cff97f7b13f5e0d2964
VITE_FIREBASE_API_KEY=AIzaSyAdrTqXHqcFlV0fqfyK2dJvgK_d3Sr74tt
VITE_FIREBASE_MESSAGING_SENDER_ID=1013297555390
VITE_FIREBASE_APP_ID=1:1013297555390:web:86a8a8afbea3ba1bd8fbef
```

---

### 3. 🏗️ Build Configuration

Verify `netlify.toml` is correct:

```toml
[build]
  publish = "dist"

[[edge_functions]]
  path = "/api/contact-lawyer"
  function = "send-email"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### 4. 📦 Dependencies Check

Run locally before deploying:

```bash
# Install dependencies
npm install

# Test build
npm run build

# Preview locally
npm run preview
```

Expected output:
```
✓ built in 13.46s
dist/index.html                     3.11 kB
dist/assets/index-g40ev6JJ.css     46.82 kB
dist/assets/index-DPuqSwF1.js   1,785.64 kB
```

---

## 🌐 Deployment Steps

### Option A: Deploy via Netlify CLI

```bash
# Install Netlify CLI (if not already installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your site (or create new)
netlify link

# Deploy to production
netlify deploy --prod
```

### Option B: Deploy via Git

1. Commit all changes:
```bash
git add .
git commit -m "fix: resolve authentication and database issues"
git push origin main
```

2. Netlify will auto-deploy from connected repository

---

## 🧪 Post-Deployment Testing

### 1. Test Homepage
- Visit your deployed URL
- Verify hero section loads
- Check navigation links work
- Test responsive design

### 2. Test Client Registration
1. Go to `/register`
2. Fill in:
   - Name: "Test Client"
   - Email: "test@example.com"
   - Phone: "+91 9876543210"
   - Password: "test123"
3. Submit and verify:
   - Success message appears
   - Redirects to client dashboard
   - Check Supabase → Table Editor → clients table for new entry

### 3. Test Lawyer Registration
1. Go to `/register-lawyer`
2. Fill in all required fields
3. Submit and verify:
   - Success message: "Application Submitted!"
   - Check Supabase → Table Editor → lawyers table
   - Verify status is "pending"

### 4. Test Admin Login
1. Go to `/admin-login`
2. Login with:
   - Username: `admin`
   - Password: `Ansh2015`
3. Verify admin portal loads
4. Test approving pending lawyers

### 5. Test Lawyer Login
1. First: Admin approves a lawyer
2. Go to `/login`
3. Select "Advocate Portal"
4. Login with lawyer's email and password
5. Verify redirects to lawyer dashboard

### 6. Test Client Login
1. Go to `/login`
2. Select "Client Portal"
3. Login with registered client credentials
4. Verify redirects to client dashboard

---

## 🔍 Troubleshooting

### Issue: "Database not configured"
**Solution:** Verify Supabase environment variables are set in Netlify dashboard

### Issue: "Invalid credentials"
**Solution:** 
- Check password is correct
- Verify user exists in Supabase tables
- For lawyers: ensure status is "approved"

### Issue: Build fails
**Solution:**
```bash
# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: API endpoints return 404
**Solution:**
- Verify `netlify/functions/api.js` exists
- Check Netlify Functions logs in dashboard
- Ensure MongoDB connection string is correct (if using MongoDB)

### Issue: Images not uploading
**Solution:**
- Check Supabase Storage → lawyer-photos bucket exists
- Verify bucket is public
- Check RLS policies allow uploads

---

## 📊 Monitoring

### Netlify Dashboard
- Check deploy logs
- Monitor function invocations
- View error logs

### Supabase Dashboard
- Monitor database queries
- Check storage usage
- View API usage

---

## 🔐 Security Notes

1. **Never commit `.env` to Git** (already in `.gitignore`)
2. **Rotate secrets regularly** - especially JWT_SECRET
3. **Use strong admin passwords** in production
4. **Enable Supabase RLS** policies properly
5. **Monitor failed login attempts**

---

## 📈 Performance Optimization

### Recommended Next Steps:
1. Enable Netlify CDN caching
2. Optimize images with WebP format
3. Implement code splitting for 3D components
4. Add service worker for offline support
5. Enable Supabase connection pooling

---

## 🆘 Support

If you encounter issues:
1. Check Netlify deploy logs
2. Check browser console for errors
3. Verify all environment variables are set
4. Test API endpoints directly
5. Check Supabase logs for database errors

---

**Last Updated:** 2026-10-08  
**Project:** Legal Connect  
**Version:** 1.0.0
