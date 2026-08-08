#!/bin/bash

echo "=== Fixing API Calls ==="

# 1. Update all environment files
echo "1. Updating environment files..."
cat > .env.production << 'ENV'
VITE_API_URL=http://78.157.51.76/api
VITE_BASE_URL=/
ENV

cat > .env.local << 'ENV'
VITE_API_URL=http://78.157.51.76/api
VITE_BASE_URL=/
ENV

cat > .env << 'ENV'
VITE_API_URL=http://78.157.51.76/api
VITE_BASE_URL=/
ENV

# 2. Check if the app is using the correct API URL
echo "2. Checking API URL in source..."
grep -r "import.meta.env.VITE_API_URL" src/ || echo "No VITE_API_URL found in src"

# 3. Check if there are hardcoded URLs
echo "3. Checking for hardcoded URLs..."
grep -r "192.168.1.150" src/ && echo "⚠️ Found hardcoded local IP in source!" || echo "✅ No hardcoded local IP found"
grep -r "localhost:3000" src/ && echo "⚠️ Found hardcoded localhost in source!" || echo "✅ No hardcoded localhost found"

# 4. Rebuild the frontend
echo "4. Rebuilding frontend..."
rm -rf dist
npm run build

# 5. Test the API
echo "5. Testing API..."
curl -X POST http://78.157.51.76/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "09375437106"}'

echo -e "\n\n✅ Done! Now test: http://78.157.51.76/anpardaz/"
echo "If the app still shows errors, check the browser console for the exact URL being called."
