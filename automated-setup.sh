#!/bin/bash
# Complete automated setup script for Legal Connect

echo "🚀 Legal Connect - Automated Setup"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Create storage bucket
echo "📦 Step 1: Creating storage bucket..."
node create-storage-bucket.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Storage bucket created${NC}"
else
    echo -e "${RED}❌ Failed to create storage bucket${NC}"
    echo "Please run manually via Supabase Dashboard"
fi

echo ""
echo "📋 Manual Steps Required:"
echo "========================="
echo ""

# Step 2: SQL policies
echo -e "${YELLOW}⚠️  Action Required: Run SQL for storage policies${NC}"
echo ""
echo "1. Go to: https://dimpexgzgsjbxiisavmk.supabase.co"
echo "2. Click 'SQL Editor' in left sidebar"
echo "3. Copy and paste this SQL:"
echo ""
echo "----------------------------------------"
cat fix-storage-bucket.sql
echo "----------------------------------------"
echo ""
echo "4. Click 'Run' button"
echo ""

# Step 3: Approve lawyers
echo -e "${YELLOW}⚠️  Action Required: Approve pending lawyers${NC}"
echo ""
echo "1. Open: http://localhost:5173/admin-login"
echo "2. Login: admin / Ansh2015"
echo "3. Click 'Approve' on each pending lawyer"
echo ""

# Step 4: Test
echo "🧪 Step 4: Testing checklist"
echo "============================"
echo ""
echo "Test these URLs:"
echo "  ✓ Homepage:           http://localhost:5173"
echo "  ✓ Client Register:    http://localhost:5173/register"
echo "  ✓ Lawyer Register:    http://localhost:5173/register-lawyer"
echo "  ✓ Login:              http://localhost:5173/login"
echo "  ✓ Admin:              http://localhost:5173/admin-login"
echo ""

# Step 5: Deploy
echo "🚀 Step 5: Deploy to production"
echo "================================"
echo ""
echo "Run these commands:"
echo "  git add ."
echo "  git commit -m 'fix: ready for production'"
echo "  git push origin main"
echo ""
echo "Or:"
echo "  netlify deploy --prod"
echo ""

echo "✅ Setup script complete!"
echo ""
echo "📄 Full documentation in COMPLETE_EXECUTION_REPORT.md"
