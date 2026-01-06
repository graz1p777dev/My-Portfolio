# 🚀 My Portfolio

> Modern, animated portfolio website with dark theme, i18n (EN/RU), and neon design

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

---

## ✨ Features

- ✅ **Bilingual** (English & Russian) with language switcher
- ✅ **Animated UI** - Matrix text reveal, scroll animations
- ✅ **Dark theme** with neon accents (customizable colors)
- ✅ **Fully responsive** - Mobile, tablet, desktop optimized
- ✅ **Background video** - Full-screen matrix rain effect
- ✅ **Live GitHub stats** - Auto-updating contribution chart
- ✅ **Codewars integration** - Real-time coding challenge stats
- ✅ **Contact section** - GitHub, Telegram, LinkedIn, Email
- ✅ **Resume download** - PDF/TXT in both languages
- ✅ **Easy customization** - All config in one place

---

## 🎨 Quick Customization Guide

### 1. **Change Your Info**

Edit `app/page.tsx` - `CONFIG` object:

```typescript
const CONFIG = {
  displayName: 'Your Name', // 👈 Your name (auto-translates in RU)
  age: 20, // 👈 Your age
  codewarsUsername: 'your_username', // 👈 Codewars profile
  githubUsername: 'your_github', // 👈 GitHub profile
  githubRepoFeatured: {
    name: 'Project Name',
    description: 'Description...',
    repoUrl: 'https://github.com/...',
    topics: ['Tech', 'Stack'],
  },
  contacts: {
    github: 'https://github.com/...',
    telegram: 'https://t.me/...',
    linkedin: 'https://linkedin.com/...',
    email: 'your@email.com',
  },
};
```

### 2. **Change Colors** 🎨

In same `CONFIG` object:

```typescript
colors: {
  accent: '#23d5ab',    // 👈 Primary neon color (currently turquoise)
  accent2: '#00b3ff',   // 👈 Secondary color (currently blue)
}
```

**Where colors appear:**

- Gradient backgrounds in hero section
- Neon borders & animated glows
- Button hover effects
- Text highlights

### 3. **Add/Remove Skills** 🛠️

In `app/page.tsx`, `Icons` object - add your skill:

```typescript
const Icons = {
  YourSkill: <IconImg src="/icons/yourskill.svg" />,
  // 👈 Add entry here
};
```

Then update `skills` array in Portfolio component:

```typescript
const skills = useMemo(
  () => [
    { label: 'YourSkill', icon: Icons.YourSkill },
    // 👈 Will appear in Skills section
  ],
  []
);
```

**📂 Icon files location**: `/public/icons/skillname.svg`

### 4. **Change Background Video** 🎬

Replace video files in `/public/`:

```bash
# These three files:
/public/matrix-rain.webm      # WebM format (preferred, smaller)
/public/matrix-rain.mp4       # MP4 fallback (for compatibility)
/public/matrix-rain-poster.jpg  # Poster shown before video loads
```

The component will use webm if supported, fallback to mp4.

### 5. **Update Resume Content**

Edit `app/data/resume.ts`:

```typescript
export const RESUME_TEXT_ENG = `
Your English resume content here...
Feel free to use any format
`;

export const RESUME_TEXT_RU = `
Ваше русское резюме здесь...
`;
```

Users can download or copy from the Resume section.

### 6. **Add New Translations**

In `app/page.tsx`, `TEXTS` object:

```typescript
const TEXTS = {
  'English text you want to translate': {
    en: 'English version',
    ru: 'Russian version (русский)',
  },
};
```

Then use in components:

```typescript
const t = useT();
{
  t('English text you want to translate');
}
```

### 7. **Update Featured Project**

In `CONFIG` object:

```typescript
githubRepoFeatured: {
  name: 'My Amazing Project',           // 👈 Project name
  description: 'What this project does...',  // 👈 Will auto-translate if in TEXTS
  repoUrl: 'https://github.com/user/repo',  // 👈 GitHub link
  topics: ['Python', 'Django', 'Docker']    // 👈 Tech stack
}
```

---

## 🚀 Getting Started

### Requirements

- Node.js 18 or higher
- npm, yarn, or pnpm

### Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/grazip777/Portfolio-graz1p.git
cd my-portfolio

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - site auto-reloads on code changes!

### Production Build

```bash
npm run build
npm start
```

---

## 📁 File Structure

```
my-portfolio/
├── app/
│   ├── page.tsx                    # Main component - edit CONFIG here!
│   ├── data/
│   │   └── resume.ts              # Resume content (EN & RU)
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       └── codewars/route.ts       # Codewars API integration
├── public/
│   ├── icons/                      # 👈 Place .svg skill icons here
│   │   ├── python.svg
│   │   ├── django.svg
│   │   ├── linux.svg
│   │   └── ...
│   ├── matrix-rain.webm            # 👈 Background video (main)
│   ├── matrix-rain.mp4             # 👈 Background video (fallback)
│   ├── matrix-rain-poster.jpg      # 👈 Video poster image
│   └── noise.png                   # Glass effect texture
├── tailwind.config.js              # Tailwind CSS settings
├── tsconfig.json                   # TypeScript config
├── next.config.ts
├── package.json
└── README.md
```

---

## 🎯 Main Sections

### Header

- **Logo**: Your name (translates to RU automatically)
- **Nav links**: Home, About, Skills, Projects, GitHub, Contact
- **Language toggle**: Switch between English and Russian

### Hero Section

- Full-screen background video
- Animated title with gradient
- Call-to-action buttons
- Responsive layout

### About Section

- Personal bio
- Technology focus
- Learning goals
- Availability info

### Skills Section

- Animated skill cards (12 skills)
- Icons from `/public/icons/`
- Easy to add/remove skills
- Customizable layout

### Projects Section

- Featured project showcase
- Links to GitHub repositories
- Project description
- Technology tags

### GitHub Section

- Real-time contribution chart (from GitHub API)
- Profile stats
- Codewars integration with live ranking
- Resume download/copy buttons

### Contact Section

- 4 contact cards (GitHub, Telegram, LinkedIn, Email)
- Copy-to-clipboard buttons
- External links with icons
- Responsive grid layout

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended, Free)

```bash
# Push code to GitHub first
git push origin main

# Then deploy
npm i -g vercel
vercel
```

Automatic deployments on every push to `main` branch.

### Option 2: Netlify

1. Connect GitHub repo to Netlify
2. Deploy automatically
3. Custom domain setup available

### Option 3: GitHub Pages

Build as static site and push to `gh-pages` branch

### Option 4: Any Node.js Server

```bash
npm run build
npm start
# Runs on port 3000
```

---

## ✅ Customization Checklist

Go through this to personalize your portfolio:

- [ ] Update name in `CONFIG.displayName`
- [ ] Update age in `CONFIG.age`
- [ ] Change GitHub username
- [ ] Change Codewars username
- [ ] Update all contact links
- [ ] Choose new accent colors (optional)
- [ ] Add/remove skills in `skills` array
- [ ] Add skill icons to `/public/icons/`
- [ ] Update resume in `app/data/resume.ts`
- [ ] Update featured project info
- [ ] Replace background video (optional)
- [ ] Deploy to Vercel or GitHub Pages

---

## 🔧 Useful Commands

```bash
# Development
npm run dev           # Start dev server on localhost:3000

# Production
npm run build         # Create optimized build
npm start             # Run production build

# Linting
npm run lint          # Check code style
```

---

## 🎓 Tech Stack

| Technology       | Purpose              |
| ---------------- | -------------------- |
| **Next.js 14**   | Framework & SSR      |
| **React 18**     | UI components        |
| **TypeScript**   | Type safety          |
| **Tailwind CSS** | Styling              |
| **CSS-in-JSX**   | Animations & effects |
| **GitHub API**   | Real-time stats      |
| **Codewars API** | Challenge data       |

---

## 💡 Tips & Tricks

### Making Content Translatable

```typescript
// Method 1: Direct translation in component
const t = useT();
{
  t('English text', 'Русский текст');
}

// Method 2: Using TEXTS object
// Add to TEXTS first, then use:
{
  t('Your English text');
}
```

### CSS Classes Reference

Reusable classes defined in styles:

- `.btn-primary` - Standard button styling
- `.card-label` - Card label text (gray, smaller)
- `.card-value` - Card value text (white, monospace)
- `.skill-glass` - Neon glass container with border

### Animation Speeds

Edit in styles section:

```css
animation: borderRun 4s linear infinite; /* Change 4s to make faster/slower */
```

In components:

```typescript
frameMs: 14; /* Lower = faster text reveal, higher = slower */
```

### Disable Background Video

In `MatrixRainPortalVideo()` function, comment out or add early return:

```typescript
if (true) return null; // Disables video
```

---

## 📞 Support & Questions

All customization points are marked with `👈` emoji in the code!

Main file to edit: **`app/page.tsx`**

Check inline comments for detailed instructions and examples.

---

## 📜 License

This project is licensed under **CC BY-NC 4.0**.

**You are allowed to:**

- Use and modify the code
- Customize colors, layout, animations
- Use for personal or educational purposes

**You must:**

- Credit the author

**Required attribution example:**

```
© 2026 Алихан Торебеков
GitHub: https://github.com/graz1p777
```

---

**Made with ❤️ using Next.js, React & TypeScript**

**Happy customizing! 🚀**
