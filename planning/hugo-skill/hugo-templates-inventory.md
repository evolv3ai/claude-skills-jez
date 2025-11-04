# Hugo Templates Inventory

**Project**: Hugo Skill for Claude Code
**Templates**: 4 complete Hugo project templates
**Last Updated**: 2025-11-04

---

## Overview

The Hugo skill includes 4 production-ready templates for different use cases. Each template is fully functional, documented, and ready to copy into user projects.

**Common Features Across All Templates**:
- YAML configuration (not TOML) for Sveltia CMS compatibility
- .gitignore configured correctly
- README.md with setup instructions
- wrangler.jsonc for Cloudflare Workers deployment
- Optimized for Cloudflare Workers Static Assets

---

## Template 1: Hugo Blog (PaperMod Theme)

### Purpose
Complete blog setup with the popular PaperMod theme, ready for immediate use.

### Location
`skills/hugo/templates/hugo-blog/`

### Directory Structure
```
hugo-blog/
├── .gitignore
├── .gitmodules
├── README.md
├── wrangler.jsonc
├── hugo.yaml
├── content/
│   ├── _index.md
│   ├── about.md
│   ├── archives.md
│   ├── search.md
│   └── posts/
│       ├── _index.md
│       ├── first-post.md
│       ├── second-post.md
│       └── third-post.md
├── static/
│   ├── favicon.ico
│   ├── images/
│   │   └── sample-post-image.jpg
│   └── admin/
│       ├── index.html
│       └── config.yml
├── themes/
│   └── PaperMod/ (Git submodule)
└── .github/
    └── workflows/
        └── deploy.yml
```

### hugo.yaml Configuration
```yaml
baseURL: "https://example.com/"
title: "My Hugo Blog"
theme: "PaperMod"
languageCode: "en-us"
defaultContentLanguage: "en"
enableRobotsTXT: true
buildDrafts: false
buildFuture: false
buildExpired: false
enableEmoji: true
pygmentsUseClasses: true
summaryLength: 30

minify:
  disableXML: true
  minifyOutput: true

params:
  env: production
  title: "My Hugo Blog"
  description: "A blog built with Hugo and PaperMod"
  keywords: [Blog, Portfolio, PaperMod]
  author: "Your Name"
  images: ["/images/og-image.jpg"]
  DateFormat: "January 2, 2006"
  defaultTheme: auto # dark, light, auto
  disableThemeToggle: false

  ShowReadingTime: true
  ShowShareButtons: true
  ShowPostNavLinks: true
  ShowBreadCrumbs: true
  ShowCodeCopyButtons: true
  ShowWordCount: true
  ShowRssButtonInSectionTermList: true
  UseHugoToc: true
  disableSpecial1stPost: false
  disableScrollToTop: false
  comments: false
  hidemeta: false
  hideSummary: false
  showtoc: true
  tocopen: false

  assets:
    disableHLJS: true
    disableFingerprinting: false

  label:
    text: "My Hugo Blog"
    icon: /favicon.ico
    iconHeight: 35

  profileMode:
    enabled: false
    title: "Welcome"
    subtitle: "A blog built with Hugo"
    imageUrl: "/images/profile.jpg"
    imageWidth: 120
    imageHeight: 120
    imageTitle: "Profile"
    buttons:
      - name: Posts
        url: posts
      - name: Tags
        url: tags

  homeInfoParams:
    Title: "Hi there 👋"
    Content: Welcome to my blog. Here I share thoughts on web development, technology, and more.

  socialIcons:
    - name: twitter
      url: "https://twitter.com/"
    - name: github
      url: "https://github.com/"
    - name: linkedin
      url: "https://linkedin.com/"
    - name: rss
      url: "/index.xml"

  cover:
    hidden: false
    hiddenInList: false
    hiddenInSingle: false

  editPost:
    URL: "https://github.com/<username>/<repo>/tree/main/content"
    Text: "Suggest Changes"
    appendFilePath: true

  fuseOpts:
    isCaseSensitive: false
    shouldSort: true
    location: 0
    distance: 1000
    threshold: 0.4
    minMatchCharLength: 0
    keys: ["title", "permalink", "summary", "content"]

menu:
  main:
    - identifier: search
      name: Search
      url: /search/
      weight: 10
    - identifier: posts
      name: Posts
      url: /posts/
      weight: 20
    - identifier: archives
      name: Archives
      url: /archives/
      weight: 30
    - identifier: tags
      name: Tags
      url: /tags/
      weight: 40
    - identifier: about
      name: About
      url: /about/
      weight: 50

outputs:
  home:
    - HTML
    - RSS
    - JSON # is necessary for search
```

### wrangler.jsonc
```jsonc
{
  "name": "hugo-blog",
  "compatibility_date": "2025-01-29",
  "assets": {
    "directory": "./public",
    "html_handling": "auto-trailing-slash",
    "not_found_handling": "404-page"
  }
}
```

### Sveltia CMS Configuration (static/admin/config.yml)
```yaml
backend:
  name: github
  repo: username/repo
  branch: main

media_folder: "static/images/uploads"
public_folder: "/images/uploads"

collections:
  - name: "blog"
    label: "Blog Posts"
    folder: "content/posts"
    create: true
    slug: "{{slug}}"
    fields:
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Description", name: "description", widget: "string", required: false}
      - {label: "Date", name: "date", widget: "datetime"}
      - {label: "Draft", name: "draft", widget: "boolean", default: false}
      - {label: "Tags", name: "tags", widget: "list", required: false}
      - {label: "Categories", name: "categories", widget: "list", required: false}
      - {label: "Cover Image", name: "cover", widget: "object", required: false, fields: [
          {label: "Image", name: "image", widget: "image", required: false},
          {label: "Alt Text", name: "alt", widget: "string", required: false},
          {label: "Caption", name: "caption", widget: "string", required: false}
        ]}
      - {label: "Show Table of Contents", name: "showtoc", widget: "boolean", default: true, required: false}
      - {label: "Body", name: "body", widget: "markdown"}

  - name: "pages"
    label: "Pages"
    folder: "content"
    create: true
    slug: "{{slug}}"
    fields:
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Date", name: "date", widget: "datetime"}
      - {label: "Draft", name: "draft", widget: "boolean", default: false}
      - {label: "Body", name: "body", widget: "markdown"}
```

### GitHub Actions Workflow (.github/workflows/deploy.yml)
```yaml
name: Deploy Hugo Blog to Cloudflare Workers

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '0.152.2'
          extended: true

      - name: Build
        run: hugo --minify

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

### Sample Post (content/posts/first-post.md)
```yaml
---
title: "Welcome to My Blog"
description: "My first post on this new Hugo blog"
date: 2025-11-04T10:00:00+11:00
draft: false
tags: ["hugo", "blog", "getting-started"]
categories: ["General"]
cover:
  image: "/images/welcome.jpg"
  alt: "Welcome image"
  caption: "Welcome to my blog!"
showtoc: true
---

# Welcome!

This is my first blog post. I'm excited to share my thoughts and experiences here.

## What You'll Find Here

- Web development tutorials
- Technology insights
- Personal projects
- And more!

## Let's Get Started

Stay tuned for more content coming soon!
```

### Features
- ✅ Dark/light/auto theme mode
- ✅ Search functionality
- ✅ Archives page
- ✅ Tags and categories
- ✅ Social links
- ✅ RSS feed
- ✅ Syntax highlighting
- ✅ Code copy buttons
- ✅ Reading time
- ✅ Share buttons
- ✅ Breadcrumbs
- ✅ Table of contents
- ✅ Responsive design
- ✅ SEO optimized

### Setup Instructions (README.md)
1. Install Hugo Extended v0.152.2+
2. Clone repository with submodules: `git clone --recursive`
3. Run local server: `hugo server`
4. Build for production: `hugo --minify`
5. Deploy to Workers: `wrangler deploy`

---

## Template 2: Hugo Docs Site

### Purpose
Documentation site with sidebar navigation, perfect for technical docs, knowledge bases, or API documentation.

### Location
`skills/hugo/templates/hugo-docs/`

### Directory Structure
```
hugo-docs/
├── .gitignore
├── .gitmodules
├── README.md
├── wrangler.jsonc
├── hugo.yaml
├── content/
│   ├── _index.md
│   └── docs/
│       ├── _index.md
│       ├── getting-started/
│       │   ├── _index.md
│       │   ├── installation.md
│       │   ├── quick-start.md
│       │   └── configuration.md
│       ├── guides/
│       │   ├── _index.md
│       │   ├── basic-usage.md
│       │   └── advanced-features.md
│       └── reference/
│           ├── _index.md
│           ├── api.md
│           └── cli.md
├── static/
│   ├── favicon.ico
│   └── admin/
│       ├── index.html
│       └── config.yml
├── themes/
│   └── hugo-book/ (Git submodule)
└── .github/
    └── workflows/
        └── deploy.yml
```

### hugo.yaml Configuration
```yaml
baseURL: "https://docs.example.com/"
title: "Documentation"
theme: "hugo-book"
languageCode: "en-us"
defaultContentLanguage: "en"
enableRobotsTXT: true
enableGitInfo: true
enableEmoji: true

minify:
  disableXML: true
  minifyOutput: true

params:
  BookTheme: "auto" # light, dark, auto
  BookToC: true
  BookComments: false
  BookSearch: true
  BookMenuBundle: /menu
  BookSection: docs
  BookRepo: "https://github.com/username/repo"
  BookEditPath: "edit/main"
  BookDateFormat: "January 2, 2006"

menu:
  after:
    - name: "GitHub"
      url: "https://github.com/username/repo"
      weight: 10
```

### Sveltia CMS Configuration
```yaml
backend:
  name: github
  repo: username/repo
  branch: main

media_folder: "static/images"
public_folder: "/images"

collections:
  - name: "docs"
    label: "Documentation"
    folder: "content/docs"
    create: true
    nested:
      depth: 100
      summary: "{{title}}"
    slug: "{{slug}}"
    fields:
      - {label: "Title", name: "title", widget: "string"}
      - {label: "Weight", name: "weight", widget: "number", default: 10, required: false}
      - {label: "Draft", name: "draft", widget: "boolean", default: false}
      - {label: "Body", name: "body", widget: "markdown"}
```

### Features
- ✅ Nested sidebar navigation
- ✅ Search functionality
- ✅ Dark/light theme
- ✅ Table of contents per page
- ✅ Git edit links
- ✅ Breadcrumbs
- ✅ Mobile responsive
- ✅ Print-friendly
- ✅ Keyboard shortcuts

---

## Template 3: Hugo Landing Page

### Purpose
Marketing or landing page with hero section, features, testimonials, and CTAs.

### Location
`skills/hugo/templates/hugo-landing/`

### Directory Structure
```
hugo-landing/
├── .gitignore
├── README.md
├── wrangler.jsonc
├── hugo.yaml
├── content/
│   └── _index.md
├── layouts/
│   ├── index.html
│   ├── partials/
│   │   ├── header.html
│   │   ├── footer.html
│   │   ├── hero.html
│   │   ├── features.html
│   │   ├── testimonials.html
│   │   └── cta.html
│   └── _default/
│       └── baseof.html
├── static/
│   ├── favicon.ico
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── main.js
│   └── images/
│       ├── hero-bg.jpg
│       ├── feature-1.svg
│       ├── feature-2.svg
│       └── feature-3.svg
└── .github/
    └── workflows/
        └── deploy.yml
```

### hugo.yaml Configuration
```yaml
baseURL: "https://landing.example.com/"
title: "Product Name"
languageCode: "en-us"
enableRobotsTXT: true

params:
  description: "Product tagline goes here"
  author: "Company Name"
  email: "contact@example.com"

  hero:
    title: "Build Amazing Things"
    subtitle: "The best solution for your needs"
    cta_primary: "Get Started"
    cta_primary_link: "#signup"
    cta_secondary: "Learn More"
    cta_secondary_link: "#features"

  features:
    - title: "Fast"
      description: "Lightning-fast performance"
      icon: "/images/feature-1.svg"
    - title: "Secure"
      description: "Bank-level security"
      icon: "/images/feature-2.svg"
    - title: "Scalable"
      description: "Grows with your business"
      icon: "/images/feature-3.svg"
```

### Features
- ✅ Hero section with CTA
- ✅ Features grid
- ✅ Testimonials carousel
- ✅ Pricing table
- ✅ Contact form
- ✅ Responsive design
- ✅ SEO optimized
- ✅ Fast loading

---

## Template 4: Minimal Starter

### Purpose
Bare-bones Hugo project for complete custom development, no theme included.

### Location
`skills/hugo/templates/minimal-starter/`

### Directory Structure
```
minimal-starter/
├── .gitignore
├── README.md
├── wrangler.jsonc
├── hugo.yaml
├── content/
│   └── _index.md
├── layouts/
│   └── _default/
│       └── .gitkeep
├── static/
│   └── .gitkeep
├── data/
│   └── .gitkeep
└── .github/
    └── workflows/
        └── deploy.yml
```

### hugo.yaml Configuration
```yaml
baseURL: "https://example.com/"
title: "My Site"
languageCode: "en-us"
enableRobotsTXT: true

params:
  description: "Site description"
  author: "Your Name"
```

### README.md
```markdown
# Hugo Minimal Starter

A bare-bones Hugo project for custom development.

## Getting Started

1. Install Hugo Extended
2. Run `hugo server` to start development server
3. Build with `hugo --minify`
4. Deploy with `wrangler deploy`

## Adding a Theme

### Option 1: Git Submodule
git submodule add https://github.com/author/theme.git themes/theme-name
echo 'theme: "theme-name"' >> hugo.yaml


### Option 2: Hugo Module
hugo mod init github.com/username/repo
# Add to hugo.yaml:
# module:
#   imports:
#     - path: github.com/author/theme


## Custom Development

- Add layouts in `layouts/`
- Add content in `content/`
- Add static assets in `static/`
- Add data files in `data/`
```

### Features
- ✅ Clean slate
- ✅ No theme dependencies
- ✅ Minimal configuration
- ✅ Ready for customization
- ✅ Deployment configured

---

## Common Files Across Templates

### .gitignore
```
# Hugo
/public/
/resources/_gen/
.hugo_build.lock

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/
.idea/
*.swp
*.swo

# Dependencies
node_modules/
```

### GitHub Actions Workflow (Common Pattern)
```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '0.152.2'
          extended: true

      - name: Build
        run: hugo --minify

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

---

## Template Selection Guide

### Use Hugo Blog When:
- Building a personal or company blog
- Want a ready-to-use, beautiful theme
- Need search, tags, categories out of the box
- Want dark/light mode toggle
- Need minimal setup time

### Use Hugo Docs When:
- Building technical documentation
- Need hierarchical navigation
- Want version control integration
- Need search across docs
- Building API reference or knowledge base

### Use Hugo Landing When:
- Building marketing site
- Need hero section, features, testimonials
- Want single-page layout
- Building product landing page
- Need conversion-focused design

### Use Minimal Starter When:
- Building completely custom site
- Want full control over every aspect
- Have specific design requirements
- Don't want theme dependencies
- Learning Hugo from scratch

---

## Installation Instructions (Common)

### Prerequisites
```bash
# Install Hugo Extended
# macOS
brew install hugo

# Linux (Ubuntu/Debian)
wget https://github.com/gohugoio/hugo/releases/download/v0.152.2/hugo_extended_0.152.2_linux-amd64.deb
sudo dpkg -i hugo_extended_0.152.2_linux-amd64.deb

# Verify installation
hugo version  # Should show "hugo v0.152.2+extended"
```

### Using a Template
```bash
# 1. Copy template
cp -r skills/hugo/templates/hugo-blog/ my-blog/
cd my-blog/

# 2. Initialize Git (if not already)
git init

# 3. Add theme as submodule (for blog/docs templates)
git submodule add https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod

# 4. Update hugo.yaml with your details
# - baseURL
# - title
# - author info
# - social links

# 5. Run local server
hugo server

# 6. Build for production
hugo --minify

# 7. Deploy to Workers
wrangler deploy
```

---

## Customization Tips

### All Templates Support:
- TailwindCSS integration (add via Hugo Pipes)
- Custom CSS in static/css/
- Custom JavaScript in static/js/
- Google Analytics / Plausible
- Comments (Disqus, Utterances, etc.)
- Social sharing
- RSS feeds

### Theme Customization:
1. **Override Layouts**: Copy theme file to project layouts/
2. **Custom Partials**: Create layouts/partials/custom.html
3. **CSS Override**: Add static/css/custom.css
4. **Config Override**: hugo.yaml overrides theme defaults

---

## Testing Checklist

Before committing a template:
- [ ] Builds without errors (`hugo`)
- [ ] Local server works (`hugo server`)
- [ ] No broken links (check localhost)
- [ ] Images load correctly
- [ ] Theme renders properly (if applicable)
- [ ] Sveltia CMS config valid (if included)
- [ ] wrangler.jsonc deploys successfully
- [ ] GitHub Actions workflow syntax valid
- [ ] README.md has clear instructions
- [ ] .gitignore includes all necessary patterns

---

**Last Updated**: 2025-11-04
**Status**: Specification complete, ready for Phase 4 (Template Creation)
