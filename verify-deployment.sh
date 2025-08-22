#!/bin/bash

# 🚀 Deployment Verification Script
# Run this script to verify your GitHub Pages deployment

echo "🔍 Verifying GitHub Pages Deployment..."
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from your project root directory"
    exit 1
fi

# Check if static build works
echo "📦 Testing static build..."
if yarn run build:static > /dev/null 2>&1; then
    echo "✅ Static build successful"
else
    echo "❌ Static build failed - check your configuration"
    exit 1
fi

# Check if out directory was created
if [ -d "out" ]; then
    echo "✅ Static files generated in /out directory"
    echo "   📂 Files: $(find out -type f | wc -l) files"
else
    echo "❌ No /out directory found"
    exit 1
fi

# Check if GitHub workflow exists
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "✅ GitHub Actions workflow configured"
else
    echo "❌ GitHub Actions workflow missing"
    exit 1
fi

# Check if key files exist
echo "📋 Checking required files..."
FILES=(
    "next.config.js"
    "package.json"
    ".github/workflows/deploy.yml"
    "app/layout.tsx"
    "lib/plugins.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
    fi
done

# Check environment configuration
if [ -f ".env.example" ]; then
    echo "✅ Environment template provided"
else
    echo "❌ .env.example missing"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Push your code to GitHub: git push origin main"
echo "2. Follow the DEPLOYMENT.md guide to:"
echo "   - Create GitHub Personal Access Token"
echo "   - Configure repository secrets"
echo "   - Enable GitHub Pages"
echo "   - Trigger first deployment"
echo ""
echo "📚 Your site will be available at:"
echo "   https://solutionforest.github.io/plugins-doc-site"
echo ""
echo "✨ Ready for deployment!"
