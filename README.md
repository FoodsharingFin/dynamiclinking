# A!FS Link Router

A beautiful, password-protected dynamic link management system that uses GitHub as its database. Create QR codes that can be updated without reprinting them - perfect for physical spaces, business cards, or any situation where you need flexible link routing.

![A!FS Link Router](https://img.shields.io/badge/Status-Production-brightgreen) ![GitHub](https://img.shields.io/badge/Database-GitHub-181717?logo=github)

## 🎯 What Does It Do?

Create a single, permanent QR code that can point to different URLs over time. Print it once, update the destination anytime.

**Use Cases:**
- 🏢 Meeting room signs that redirect to the current booking system
- 📱 Instagram bio link that you can change daily
- 🎫 Event posters with updatable registration links
- 📋 Product labels linking to latest documentation
- 🏪 Restaurant menus linking to current specials

## ✨ Key Features

- **Dynamic QR Codes**: One QR code, infinite destinations
- **GitHub-Powered**: Uses your GitHub repo as a database (free, reliable, version-controlled)
- **Password Protected**: Secure management interface (password: the year A!FS was founded)
- **Real-Time Updates**: Changes are live worldwide within 1-2 minutes
- **Beautiful UI**: Modern glassmorphism design with smooth animations
- **Multiple Formats**: Download QR codes as PNG or SVG
- **Zero Dependencies**: Runs entirely in the browser, no server needed
- **Visit Tracking**: See how many times each link has been accessed

## 🚀 Quick Start

### 1. Fork & Deploy

1. Fork this repository to your GitHub account
2. Enable GitHub Pages: Settings → Pages → Source: `main` branch
3. Your router is now live at: `https://[username].github.io/dynamiclinking`

### 2. Configure Your Token

Create a GitHub Personal Access Token:

1. GitHub.com → Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens
2. Click "Generate new token"
3. **Token name:** `AIFS Link Router`
4. **Repository access:** Only select repositories → Choose your `dynamiclinking` repo
5. **Permissions:** 
   - Repository Permissions → Contents → **Read and write**
6. Generate token and copy it

Open `index.html` and replace the token on line ~386:
```javascript
const GITHUB_TOKEN = 'your_token_here';
```

### 3. Create Your First Chain

1. Visit your deployed site
2. Unlock with password: `2024` (the year A!FS was founded)
3. Create a new chain:
   - **Note:** "Instagram Bio" (becomes slug: `instagram-bio`)
   - **Target URL:** `https://example.com/current-project`
4. Click "Publish to GitHub"
5. Your link is now live at: `https://[username].github.io/dynamiclinking?id=instagram-bio`

### 4. Generate & Use QR Code

1. Click the QR icon on your chain
2. Customize the color if desired
3. Download as PNG (for printing) or SVG (for digital use)
4. Print it, share it, embed it anywhere!

## 📖 How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  You create a "chain" (slug → URL mapping)                  │
│  ↓                                                           │
│  Click "Publish to GitHub"                                  │
│  ↓                                                           │
│  chains.json is committed to your repo                      │
│  ↓                                                           │
│  Someone scans your QR code                                 │
│  ↓                                                           │
│  Page loads chains.json from GitHub                         │
│  ↓                                                           │
│  Finds matching slug and redirects to target URL            │
└─────────────────────────────────────────────────────────────┘
```

**Architecture:**
- **Frontend Only**: Pure HTML/CSS/JS - no backend required
- **GitHub as Database**: `chains.json` file stores all your link mappings
- **GitHub Pages**: Hosts the entire application for free
- **GitHub API**: Reads/writes data via authenticated API calls

## 🎨 Features Breakdown

### Link Chains

A "chain" is a slug → URL mapping:
- **Slug**: Short identifier (e.g., `meeting-room-a`)
- **URL**: Where it redirects to (e.g., `https://zoom.us/j/123456`)
- **Note**: Human-readable description for your reference

### QR Code Studio

- **Color Customization**: Match your brand colors
- **Format Options**: 
  - PNG: High-resolution (1000x1000px) for printing
  - SVG: Vector format for infinite scaling
- **Native SVG**: True vector graphics, not rasterized

### Sync System

- **Publish to GitHub**: Commits your changes to the repo (live in ~1-2 minutes)
- **Manual Export**: Download `chains.json` as backup or for manual commit
- **Reload**: Discard local changes and pull fresh from GitHub
- **Sync Status Badge**: Shows if you have unpublished changes

## 🔐 Security

**What's Protected:**
- Management interface (password required)
- GitHub API token (embedded in code but scoped to only this repo)

**What's Public:**
- The redirect functionality (anyone can use `?id=slug` links)
- Your QR codes and destination URLs
- `chains.json` file (must be public for redirects to work)

**Token Permissions:**
The token can ONLY:
- Read/write `chains.json` in this specific repo
- Nothing else in your GitHub account

**Risk Assessment:**
If someone extracts your token from the page source, they can:
- Modify your link chains
- Nothing else (token is scoped tightly)

You can revoke and regenerate tokens anytime from GitHub settings.

## 📝 Workflow Example

**Scenario:** You're running a weekly event series and want a single QR code for all events.

1. **Print Phase:**
   - Create chain: `weekly-event` → `https://eventbrite.com/event-week-1`
   - Generate QR code, print on posters
   - Distribute posters

2. **Week 2:**
   - Edit `weekly-event` chain
   - Update URL to: `https://eventbrite.com/event-week-2`
   - Publish to GitHub
   - Same QR code now points to Week 2 event!

3. **Week 3, 4, 5...**
   - Repeat: update URL, publish
   - Never reprint posters

## 🛠️ Customization

### Change Password

Edit line ~221 in `index.html`:
```javascript
if (input === '2024') {  // Change this
```

### Branding

Update colors in CSS (lines ~10-15):
```css
:root {
    --primary: #6366f1;    /* Main color */
    --secondary: #a855f7;  /* Accent color */
    --dark: #0f172a;       /* Background */
}
```

### Domain

Use a custom domain with GitHub Pages:
1. Settings → Pages → Custom domain
2. Enter your domain (e.g., `links.yourcompany.com`)
3. Add DNS CNAME record pointing to `[username].github.io`

## 📊 Visit Tracking

The system tracks visits to each chain. Note that visit counts are incremented when someone scans the QR, but the count is stored in memory and only persists if you later publish an update. For true analytics, consider adding Google Analytics or a similar service.

## 🐛 Troubleshooting

**"Link Not Found" error when scanning QR:**
- Make sure you clicked "Publish to GitHub" after creating the chain
- Wait 1-2 minutes for GitHub CDN to update
- Check that `chains.json` exists in your repo

**"Failed to publish" error:**
- Verify your GitHub token is correct
- Check token hasn't expired
- Ensure token has "Contents: Read and write" permission

**QR code won't download:**
- Try the other format (PNG vs SVG)
- Check browser's download permissions
- Try a different browser

**Changes not appearing after publish:**
- Wait 1-2 minutes (GitHub CDN caching)
- Try opening in incognito mode
- Click "Reload from GitHub" in the manager

## 🤝 Contributing

This is an internal A!FS tool, but improvements are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Proprietary - A!FS Internal Tool

## 🙏 Credits

Built with:
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) - QR code generation
- [GitHub API](https://docs.github.com/en/rest) - Data storage and retrieval
- [Kimi2.5](https://www.kimi.com/en/) - UI
- [Claude](caude.ai/new) - Implementation

---

**Made with ❤️ by A!FS** 
