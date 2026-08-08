#!/bin/bash

cd ~/Anpardaz

# Backup current App.tsx
cp src/App.tsx src/App.tsx.before-persistence

# Add useEffect for checking saved token at the top of the App component
# We'll use sed to insert the persistence logic

# First, find where the App function starts
grep -n "function App()" src/App.tsx

# Add the useEffect after the useState declarations
# For now, let's create a complete fixed version
