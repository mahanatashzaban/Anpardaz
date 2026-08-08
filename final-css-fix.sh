#!/bin/bash

echo "=== Final CSS Fix ==="

cd ~/Anpardaz

# 1. Update Vite config
echo "1. Updating vite.config.ts..."
cat > vite.config.ts << 'VITE'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/anpardaz/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    cssCodeSplit: false,
  },
})
VITE

# 2. Verify index.css has correct imports
echo "2. Checking index.css..."
cat src/index.css | head -10

# 3. Clean and rebuild
echo "3. Rebuilding frontend..."
rm -rf dist node_modules/.vite
npm run build

# 4. Check CSS
echo "4. Checking generated CSS..."
CSS_FILE=$(ls -t dist/assets/*.css 2>/dev/null | head -1)
if [ -n "$CSS_FILE" ]; then
    SIZE=$(wc -c < "$CSS_FILE")
    echo "✅ CSS file: $CSS_FILE"
    echo "📊 Size: $SIZE bytes"
    
    # Show first 20 lines
    echo -e "\n📄 First 20 lines of CSS:"
    head -20 "$CSS_FILE"
    
    # Check if it contains actual CSS
    if grep -q "body\|html\|flex\|grid" "$CSS_FILE"; then
        echo -e "\n✅ CSS contains valid styles!"
    else
        echo -e "\n❌ CSS does not contain expected styles"
    fi
else
    echo "❌ No CSS file found!"
fi

# 5. Test API
echo -e "\n5. Testing API..."
curl -s -X POST http://78.157.51.76/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "09375437106"}'

echo -e "\n\n✅ Done! Now test: http://78.157.51.76/anpardaz/"
echo "Clear your browser cache and refresh."
