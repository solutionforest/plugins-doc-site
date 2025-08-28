# 🚀 GitHub Pages Deployment Guide

**Complete step-by-step guide to deploy your fumadocs site to GitHub Pages**

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- ✅ GitHub account with admin access to your repository
- ✅ Repository pushed to GitHub
- ✅ GitHub Personal Access Token (we'll create this)

---

## 🔥 **STEP-BY-STEP DEPLOYMENT GUIDE**

### **Step 1: Push Your Code to GitHub**

If you haven't already, push your current code:

```bash
# Navigate to your project directory
cd /path/to/your/plugins-doc-site

# Add all files
git add .

# Commit your changes
git commit -m "Add GitHub Pages deployment configuration"

# Push to GitHub
git push origin main
```

---

### **Step 2: Create GitHub Personal Access Token**

1. **Go to GitHub Settings**
   - Click your profile picture → **Settings**
   - Or visit: https://github.com/settings/profile

2. **Navigate to Developer Settings**
   - Scroll down to **Developer settings** (bottom left)
   - Click **Personal access tokens**
   - Click **Tokens (classic)**

3. **Generate New Token**
   - Click **Generate new token (classic)**
   - **Note**: `fumadocs-deployment-token`
   - **Expiration**: `No expiration` (or 1 year for security)

4. **Select Scopes** (IMPORTANT):

   ```
   ✅ repo (Full control of private repositories)
   ✅ workflow (Update GitHub Action workflows)
   ✅ read:org (Read org and team membership)
   ```

5. **Generate and Copy Token**
   - Click **Generate token**
   - **⚠️ IMPORTANT**: Copy the token immediately - you won't see it again!
   - Save it temporarily in a secure location

---

### **Step 3: Configure Repository Secrets**

1. **Go to Your Repository**
   - Navigate to: `https://github.com/solutionforest/plugins-doc-site`

2. **Access Settings**
   - Click the **Settings** tab (next to Security)

3. **Go to Secrets and Variables**
   - In the left sidebar, click **Secrets and variables**
   - Click **Actions**

4. **Add Repository Secrets**

   Click **New repository secret** and add these **TWO** secrets:

   **Secret 1:**
   - **Name**: `GITHUB_TOKEN`
   - **Secret**: `[paste your personal access token here]`
   - Click **Add secret**

   **Secret 2:**
   - **Name**: `WEBHOOK_SECRET`
   - **Secret**: `your-secure-random-string-123` (create a random string)
   - Click **Add secret**

5. **Add Repository Variables (Optional)**

   Click **Variables** tab, then **New repository variable**:
   - **Name**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://solutionforest.github.io/plugins-doc-site`
   - Click **Add variable**

---

### **Step 4: Enable GitHub Pages**

1. **Go to Pages Settings**
   - In your repository, go to **Settings** → **Pages**

2. **Configure Source**
   - **Source**: Select **GitHub Actions** (NOT "Deploy from a branch")
   - This tells GitHub to use your workflow file

3. **Custom Domain (Optional)**
   - If you have a custom domain, enter it here
   - Otherwise, your site will be at: `https://solutionforest.github.io/plugins-doc-site`

---

### **Step 5: Trigger the First Deployment**

Now that everything is configured, trigger your first deployment:

1. **Option A: Push a Change**

   ```bash
   # Make a small change to trigger deployment
   echo "# Live on GitHub Pages!" >> README.md
   git add README.md
   git commit -m "Trigger first deployment"
   git push origin main
   ```

2. **Option B: Manual Trigger**
   - Go to your repository → **Actions** tab
   - Click **Deploy to GitHub Pages** workflow
   - Click **Run workflow** → **Run workflow**

---

### **Step 6: Monitor Deployment**

1. **Check Actions Tab**
   - Go to your repository → **Actions**
   - You should see a running workflow "Deploy to GitHub Pages"
   - Click on it to see progress

2. **Deployment Steps Should Show**:

   ```
   ✅ Checkout
   ✅ Setup Node.js
   ✅ Setup pnpm
   ✅ Install dependencies
   ✅ Build with Next.js
   ✅ Upload artifact
   ✅ Deploy to GitHub Pages
   ```

3. **Expected Build Time**: 3-5 minutes

---

### **Step 7: Verify Your Site is Live**

1. **Get Your Site URL**
   - After successful deployment, go to **Settings** → **Pages**
   - Your site URL will be shown at the top
   - Usually: `https://solutionforest.github.io/plugins-doc-site`

2. **Test Your Site**
   - Visit the URL
   - You should see your plugin documentation site
   - Navigate through different plugin docs to test

---

## 🔄 **Setting Up Automatic Rebuilds**

### **For Manual Rebuilds (GitHub Pages)**

Since GitHub Pages uses static hosting, you can trigger rebuilds manually:

1. **GitHub Actions UI**:
   - Go to **Actions** → **Deploy to GitHub Pages** → **Run workflow**

2. **GitHub API** (for automation):
   ```bash
   curl -X POST \
     -H "Accept: application/vnd.github.v3+json" \
     -H "Authorization: Bearer YOUR_GITHUB_TOKEN" \
     https://api.github.com/repos/solutionforest/plugins-doc-site/dispatches \
     -d '{"event_type":"rebuild-docs"}'
   ```

### **For Automatic Rebuilds (Server Deployment)**

If you later deploy to Vercel/Netlify for webhook support:

1. **Set up webhooks in each plugin repository**:
   - Go to plugin repo → **Settings** → **Webhooks**
   - **Payload URL**: `https://your-domain.com/api/rebuild`
   - **Content type**: `application/json`
   - **Secret**: Use your `WEBHOOK_SECRET`
   - **Events**: Just the push event

---

## 🎯 **Verification Checklist**

After deployment, verify these items:

- ✅ **Site loads**: Visit your GitHub Pages URL
- ✅ **Navigation works**: Click through different plugins
- ✅ **Documentation displays**: Check README, Documentation, Changelog pages
- ✅ **Styling is correct**: CSS and images load properly
- ✅ **Mobile responsive**: Test on mobile device
- ✅ **Search functionality**: If applicable

---

## 🚨 **Troubleshooting Common Issues**

### **Problem: Build Fails**

**Solution**:

1. Check **Actions** tab for error logs
2. Verify your `GITHUB_TOKEN` has correct permissions
3. Ensure all dependencies are in `package.json`

### **Problem: Site Shows 404**

**Solution**:

1. Verify GitHub Pages is enabled with "GitHub Actions" source
2. Check if deployment completed successfully
3. Wait 5-10 minutes for GitHub CDN to update

### **Problem: Content Not Updating**

**Solution**:

1. Clear browser cache (Ctrl+F5 / Cmd+Shift+R)
2. Check if new deployment actually ran
3. Verify your changes were committed and pushed

### **Problem: Styling Broken**

**Solution**:

1. Check if `NEXT_PUBLIC_SITE_URL` is set correctly
2. Verify static assets are loading from correct path
3. Check browser console for 404 errors

---

## 💡 **Pro Tips for CTO**

### **Cost Management**

- ✅ **GitHub Pages**: Completely FREE
- ✅ **GitHub Actions**: 2000 free minutes/month (plenty for docs)
- ✅ **Storage**: 1GB free (more than enough for static site)

### **Performance Monitoring**

- Monitor build times in Actions tab
- Use GitHub Insights for traffic analytics
- Set up Google Analytics if needed

### **Security Best Practices**

- Rotate GitHub tokens annually
- Use repository secrets (never commit tokens)
- Enable branch protection on main branch
- Review GitHub Actions logs regularly

### **Backup Strategy**

- Your source is backed up in Git
- GitHub Pages content is regenerated from source
- No additional backup needed for static content

---

## 🎉 **Success!**

Once you've completed all steps, you'll have:

✅ **Professional documentation site** hosted on GitHub Pages  
✅ **Global CDN delivery** with 99.9% uptime  
✅ **Zero hosting costs** and minimal maintenance  
✅ **Automatic deployments** on code changes  
✅ **Enterprise-grade security** with GitHub infrastructure

Your documentation site is now **production-ready** and **enterprise-grade**!
