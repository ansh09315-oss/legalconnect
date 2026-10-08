#!/bin/bash
# Quick test script - Run this to verify everything works

echo "🧪 QUICK VERIFICATION TEST"
echo "=========================="
echo ""

# Check if dev server is running
echo "1️⃣ Checking dev server..."
curl -s http://localhost:5173 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ Dev server is running"
else
    echo "   ❌ Dev server is NOT running"
    echo "   Run: npm run dev"
fi

echo ""
echo "2️⃣ Checking build..."
if [ -d "dist" ]; then
    echo "   ✅ Build directory exists"
else
    echo "   ⚠️  Build directory missing"
    echo "   Run: npm run build"
fi

echo ""
echo "3️⃣ Checking environment..."
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
else
    echo "   ❌ .env file missing"
fi

echo ""
echo "📋 Manual Tests Required:"
echo "=========================="
echo ""
echo "✅ 1. Create storage bucket in Supabase"
echo "   → Go to Supabase Dashboard → Storage → New Bucket"
echo "   → Name: lawyer-photos, Public: YES"
echo ""
echo "✅ 2. Approve pending lawyers"
echo "   → http://localhost:5173/admin-login"
echo "   → Login: admin / Ansh2015"
echo "   → Approve all pending lawyers"
echo ""
echo "✅ 3. Test registration flows"
echo "   → http://localhost:5173/register (client)"
echo "   → http://localhost:5173/register-lawyer (lawyer)"
echo ""
echo "✅ 4. Test login flows"
echo "   → http://localhost:5173/login"
echo ""
echo "🚀 Once verified, deploy with:"
echo "   git add . && git commit -m 'fix: ready for production' && git push"
