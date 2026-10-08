#!/bin/bash
# Quick verification script after fixing the error

echo "🔍 Verifying Storage Bucket Fix..."
echo "===================================="
echo ""

cd "C:\Users\ansh0\legal connect"

# Test database connection and bucket
echo "Running verification..."
node test-database.js

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Expected output:"
echo "  ✅ lawyer-photos bucket exists"
echo ""
echo "If you see this ☝️ the error is FIXED!"
echo ""
echo "If you see:"
echo "  ⚠️  lawyer-photos bucket not found"
echo ""
echo "Then the bucket still needs to be created."
echo "Follow Method 1 in ERROR_FIX_INVALID_PATH.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
