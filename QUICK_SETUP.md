# 🚀 Quick Setup Checklist for GitHub Pages

## ✅ Pre-Deployment Checklist

**Before you start, ensure:**

- [ ] Code is committed and pushed to GitHub
- [ ] You have admin access to your GitHub repository
- [ ] Repository is public or you have GitHub Pro/Enterprise

---

## 🔥 **QUICK SETUP (5 minutes)**

### **1. Create GitHub Token** (2 minutes)

- [ ] Go to: https://github.com/settings/tokens
- [ ] Click "Generate new token (classic)"
- [ ] Select scopes: `repo`, `workflow`, `read:org`
- [ ] Copy token and save it securely

### **2. Configure Repository** (2 minutes)

- [ ] Go to your repo → Settings → Secrets and Variables → Actions
- [ ] Add secret: `GITHUB_TOKEN` = [your token]
- [ ] Add secret: `WEBHOOK_SECRET` = [random string like: `doc-rebuild-secret-123`]
- [ ] Go to Settings → Pages
- [ ] Set Source to "GitHub Actions"

### **3. Deploy** (1 minute)

- [ ] Go to Actions tab → "Deploy to GitHub Pages" → "Run workflow"
- [ ] Wait 3-5 minutes for build completion
- [ ] Visit your site: `https://solutionforest.github.io/plugins-doc-site`

---

## 🎯 **That's it! Your site should be live.**

**If something goes wrong:**

1. Check the Actions tab for error messages
2. Verify your token has the right permissions
3. Ensure GitHub Pages source is set to "GitHub Actions"

**Your site URL will be:**

```
https://solutionforest.github.io/plugins-doc-site
```

---

## 📞 **Need help?**

Check the detailed DEPLOYMENT.md file for troubleshooting steps.
