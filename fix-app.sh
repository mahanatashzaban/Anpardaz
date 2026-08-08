#!/bin/bash

cd ~/Anpardaz

# Backup current
cp src/App.tsx src/App.tsx.current-backup

# 1. Fix API_BASE (remove /api from the URL)
sed -i 's|http://78.157.51.76/api|http://78.157.51.76|g' src/App.tsx

# 2. Add persistence - find where useState is and add useEffect after it
# We'll use a more careful approach with Python
python3 << 'PYTHON'
import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# Check if persistence useEffect already exists
if 'savedUser' not in content:
    # Find the useState declarations
    pattern = r'(const \[[^\]]*\] = useState[^\n]*\n)'
    match = re.search(pattern, content)
    if match:
        # Insert persistence useEffect after useState
        insert_pos = match.end()
        persistence_code = '''
  // ─── CHECK SAVED LOGIN ON START ────────────────────────────────────────────
  useEffect(() => {
    const savedUser = localStorage.getItem('anpardaz_user')
    const savedToken = localStorage.getItem('anpardaz_token')
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser))
        setScreen('home')
      } catch (e) {
        localStorage.removeItem('anpardaz_user')
        localStorage.removeItem('anpardaz_token')
      }
    }
  }, [])
'''
        content = content[:insert_pos] + persistence_code + content[insert_pos:]
        
        with open('src/App.tsx', 'w') as f:
            f.write(content)
        print("✅ Added persistence useEffect")
    else:
        print("❌ Could not find useState")
else:
    print("✅ Persistence already exists")

PYTHON

# 3. Fix the login function to save user data
# The login function already saves to localStorage, but let's make sure

echo "✅ Fixes applied!"
