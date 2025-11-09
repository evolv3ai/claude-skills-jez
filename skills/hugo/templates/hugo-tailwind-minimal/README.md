# Hugo + Tailwind CSS v4 Minimal Starter

A minimal Hugo site with Tailwind CSS v4 integration. Perfect starting point for custom Hugo sites with modern utility-first CSS.

## Features

- ✅ Hugo 0.152.2+ with Extended version
- ✅ Tailwind CSS v4.1.16
- ✅ Dark mode with vanilla JavaScript
- ✅ Optimized build pipeline with Hugo Pipes
- ✅ PostCSS processing
- ✅ Production-ready minification and fingerprinting
- ✅ Responsive design
- ✅ Clean, minimal starting point

## Quick Start

### 1. Copy Template

```bash
# Copy this template directory to your project location
cp -r hugo-tailwind-minimal/ my-site/
cd my-site/
```

### 2. Install Dependencies

```bash
# Initialize git (optional)
git init

# Install npm dependencies
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:1313`

### 4. Create Content

```bash
# Create a new page
hugo new about.md

# Create a new post
hugo new posts/my-first-post.md
```

## Project Structure

```
hugo-tailwind-minimal/
├── assets/
│   └── css/
│       └── main.css              # Tailwind entry file
├── content/
│   └── _index.md                 # Homepage content
├── layouts/
│   ├── _default/
│   │   ├── baseof.html           # Base template
│   │   ├── list.html             # List pages
│   │   └── single.html           # Single pages
│   └── partials/
│       ├── head.html             # <head> content with CSS
│       ├── header.html           # Site header with nav
│       ├── footer.html           # Site footer
│       └── theme-toggle.html     # Dark mode toggle
├── hugo.yaml                     # Hugo configuration
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
├── package.json                  # npm dependencies & scripts
└── README.md                     # This file
```

## Configuration

### Hugo Configuration

Edit `hugo.yaml` to customize:

- `baseURL`: Your site URL
- `title`: Site title
- `languageCode`: Language code (e.g., 'en-us')
- `params`: Custom parameters

### Tailwind Configuration

Edit `tailwind.config.js` to customize:

- `theme.extend.colors`: Add custom colors
- `theme.extend.fontFamily`: Add custom fonts
- `plugins`: Add Tailwind plugins

### CSS Customization

Edit `assets/css/main.css` to:

- Customize theme variables in `@theme inline`
- Add global styles in `@layer base`
- Create reusable components in `@layer components`
- Add custom utilities in `@layer utilities`

## npm Scripts

```bash
npm run dev          # Start development server with drafts
npm run build        # Build for production (minified)
npm run clean        # Clean build artifacts and cache
```

## Adding Content

### Homepage

Edit `content/_index.md`:

```markdown
---
title: "Welcome"
---

# Your Homepage

Content goes here.
```

### New Page

```bash
hugo new about.md
```

Edit `content/about.md`:

```markdown
---
title: "About"
date: 2025-11-04
draft: false
---

# About Us

About page content.
```

### Blog Post

```bash
hugo new posts/hello-world.md
```

Edit `content/posts/hello-world.md`:

```markdown
---
title: "Hello World"
date: 2025-11-04
draft: false
tags: ["hello", "first-post"]
---

Your blog post content here.
```

## Dark Mode

This template includes a vanilla JavaScript dark mode toggle:

- **Auto-detection**: Follows system preference by default
- **Manual toggle**: Click the theme toggle button in header
- **Persistence**: Choice saved to localStorage
- **No flicker**: Theme loads before page render

The toggle is implemented in `layouts/partials/theme-toggle.html`.

## Tailwind Utilities

Common Tailwind classes used in this template:

```html
<!-- Container -->
<div class="container mx-auto px-4">

<!-- Dark mode -->
<div class="bg-white dark:bg-gray-900">
<p class="text-gray-900 dark:text-gray-100">

<!-- Responsive -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

<!-- Hover effects -->
<a class="hover:text-primary hover:underline">
```

## Adding Tailwind Plugins

### Typography Plugin (for blog content)

```bash
npm install -D @tailwindcss/typography
```

Add to `tailwind.config.js`:

```javascript
plugins: [
  require('@tailwindcss/typography'),
],
```

Use in templates:

```html
<article class="prose dark:prose-invert max-w-none">
  {{ .Content }}
</article>
```

### Forms Plugin (for contact forms)

```bash
npm install -D @tailwindcss/forms
```

Add to `tailwind.config.js`:

```javascript
plugins: [
  require('@tailwindcss/forms')({
    strategy: 'class',
  }),
],
```

## Production Build

```bash
# Build for production
npm run build

# Output will be in public/ directory
```

The production build includes:

- ✅ CSS minification
- ✅ Asset fingerprinting (cache busting)
- ✅ Subresource integrity (SRI)
- ✅ Only used Tailwind utilities (purged)

## Deployment

### Cloudflare Workers

Create `wrangler.jsonc`:

```jsonc
{
  "name": "my-hugo-site",
  "compatibility_date": "2025-01-10",
  "assets": {
    "directory": "./public"
  }
}
```

Deploy:

```bash
npm run build
npx wrangler deploy
```

### GitHub Pages

Add `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '0.152.2'
          extended: true

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: hugo --minify

      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./public
```

## Troubleshooting

### CSS not loading

```bash
# Clear cache and rebuild
npm run clean
npm run dev
```

### Tailwind classes not working

1. Check `hugo_stats.json` exists
2. Verify `writeStats: true` in `hugo.yaml`
3. Restart Hugo server

### Dark mode not switching

1. Check browser console for JavaScript errors
2. Verify `darkMode: 'class'` in `tailwind.config.js`
3. Clear localStorage: `localStorage.clear()` in console

## Next Steps

1. **Add more pages**: Create content in `content/` directory
2. **Customize design**: Edit Tailwind config and CSS
3. **Add components**: Create reusable partials in `layouts/partials/`
4. **Add plugins**: Install Tailwind plugins as needed
5. **Deploy**: Choose your hosting platform and deploy

## Resources

- [Hugo Documentation](https://gohugo.io/documentation/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Hugo + Tailwind Integration Guide](../../references/tailwind-v4-integration.md)

## License

MIT License - feel free to use for any project!
