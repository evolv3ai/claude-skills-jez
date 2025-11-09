# Hugo + Tailwind CSS v4 Integration Guide

**Last Updated**: 2025-11-04
**Hugo Version**: 0.152.2
**Tailwind CSS Version**: 4.1.16
**Production Tested**: Yes

---

## Table of Contents

1. [Quick Start (5 Minutes)](#quick-start-5-minutes)
2. [Architecture Overview](#architecture-overview)
3. [Complete Setup Guide](#complete-setup-guide)
4. [Dark Mode Implementation](#dark-mode-implementation)
5. [Typography Plugin Setup](#typography-plugin-setup)
6. [Forms Plugin Setup](#forms-plugin-setup)
7. [Template Integration](#template-integration)
8. [PaperMod vs Tailwind Decision Guide](#papermod-vs-tailwind-decision-guide)
9. [Common Issues & Solutions](#common-issues--solutions)
10. [Configuration Reference](#configuration-reference)
11. [Build Commands](#build-commands)
12. [Production Deployment](#production-deployment)

---

## Quick Start (5 Minutes)

This quick start gets you a working Hugo + Tailwind v4 setup. For detailed explanations, see the sections below.

### 1. Install Dependencies

```bash
# Initialize npm if needed
npm init -y

# Install Tailwind CSS v4 CLI and PostCSS
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest

# Initialize Tailwind config
npx tailwindcss init
```

### 2. Configure Hugo

Edit `hugo.yaml` (or create it):

```yaml
baseURL: 'https://example.com/'
languageCode: 'en-us'
title: 'My Hugo Site'

# Enable Hugo stats for Tailwind content scanning
build:
  writeStats: true

# Asset processing configuration
module:
  mounts:
    - source: assets
      target: assets
    - source: hugo_stats.json
      target: assets/watching/hugo_stats.json
```

### 3. Create Tailwind Config

Edit `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './hugo_stats.json',
    './layouts/**/*.html',
    './content/**/*.{html,md}'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 4. Create PostCSS Config

Create `postcss.config.js`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 5. Create Tailwind CSS Entry File

Create `assets/css/main.css`:

```css
@import "tailwindcss";

/* Optional: Theme customization */
@theme inline {
  --color-primary: #0066cc;
  --color-secondary: #6366f1;
}

/* Base styles */
@layer base {
  html {
    @apply antialiased;
  }

  body {
    @apply bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100;
  }
}
```

### 6. Create Base Template

Create `layouts/_default/baseof.html`:

```html
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode }}" class="h-full">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ .Title }} - {{ .Site.Title }}</title>

  {{ $options := dict "transpiler" "libsass" "targetPath" "css/main.css" }}
  {{ $style := resources.Get "css/main.css" | resources.PostCSS $options }}
  {{ if hugo.IsProduction }}
    {{ $style = $style | minify | fingerprint }}
  {{ end }}
  <link rel="stylesheet" href="{{ $style.RelPermalink }}" {{ if hugo.IsProduction }}integrity="{{ $style.Data.Integrity }}" crossorigin="anonymous"{{ end }}>
</head>
<body class="h-full">
  <div class="min-h-full">
    {{ block "main" . }}{{ end }}
  </div>
</body>
</html>
```

### 7. Create Content

Create `content/_index.md`:

```markdown
---
title: "Welcome"
---

# Hello, Tailwind!

This is a Hugo site with Tailwind CSS v4.
```

### 8. Start Development Server

```bash
hugo server --buildDrafts
```

Visit `http://localhost:1313` - you should see styled content!

---

## Architecture Overview

### Hugo Pipes vs JavaScript Bundlers

Understanding the architectural differences is crucial to avoid confusion:

| Aspect | Vite + React | Hugo |
|--------|-------------|------|
| **Build System** | JavaScript (Node.js) | Go (Hugo binary) |
| **Asset Pipeline** | Vite/Rollup | Hugo Pipes |
| **Tailwind Integration** | `@tailwindcss/vite` plugin | Tailwind CLI + PostCSS |
| **Config File** | `vite.config.ts` | `hugo.yaml` |
| **Content Scanning** | `content: []` globs | `hugo_stats.json` |
| **Dev Server** | Vite (port 5173) | Hugo (port 1313) |
| **Hot Reload** | HMR (module replacement) | Live reload (full page) |
| **Dark Mode** | React ThemeProvider | CSS classes or Alpine.js |
| **Templates** | JSX/TSX | Go templates (.html) |

### Why You Can't Use @tailwindcss/vite

The `@tailwindcss/vite` plugin from the `tailwind-v4-shadcn` skill **will not work with Hugo** because:

1. **No Vite**: Hugo doesn't use Vite or any JavaScript bundler
2. **No package.json scripts**: Hugo builds are triggered by `hugo` command, not `npm run build`
3. **Different asset system**: Hugo Pipes processes assets at build time using Go, not Node.js
4. **Template language**: Go templates, not React/JSX

### Hugo's Asset Pipeline (Hugo Pipes)

Hugo Pipes is Hugo's native asset processing system:

```
Source Assets (assets/)
  ↓
Hugo Pipes Functions (PostCSS, Minify, Fingerprint)
  ↓
Processed Assets (public/)
```

**Key Hugo Pipes Functions**:
- `resources.Get`: Load asset file
- `resources.PostCSS`: Process with PostCSS (includes Tailwind)
- `minify`: Minify CSS for production
- `fingerprint`: Add content hash for cache busting

### How Tailwind Integrates

```
1. Hugo generates hugo_stats.json (all HTML classes used)
2. Tailwind scans hugo_stats.json (via content config)
3. PostCSS runs Tailwind CLI
4. Hugo Pipes processes the output
5. Final CSS includes only used utilities
```

---

## Complete Setup Guide

### Directory Structure

```
your-hugo-site/
├── assets/
│   └── css/
│       └── main.css          # Tailwind entry file
├── content/
│   ├── _index.md
│   └── posts/
│       └── first-post.md
├── layouts/
│   ├── _default/
│   │   ├── baseof.html       # Base template
│   │   ├── list.html         # List pages
│   │   └── single.html       # Single pages
│   └── partials/
│       ├── head.html         # <head> content
│       ├── header.html       # Site header
│       └── footer.html       # Site footer
├── static/
│   └── images/
├── hugo.yaml                 # Hugo config
├── tailwind.config.js        # Tailwind config
├── postcss.config.js         # PostCSS config
├── package.json              # npm dependencies
└── hugo_stats.json           # Auto-generated by Hugo
```

### Step 1: Hugo Configuration

Create or edit `hugo.yaml`:

```yaml
baseURL: 'https://example.com/'
languageCode: 'en-us'
title: 'My Hugo Site'
theme: ''  # Empty if using custom Tailwind styling

# Build configuration
build:
  # Generate hugo_stats.json with class names
  writeStats: true

  # Build stats configuration
  buildStats:
    enable: true
    disableClasses: false
    disableIDs: false
    disableTags: false

# Module mounts - make hugo_stats.json available to Tailwind
module:
  mounts:
    - source: assets
      target: assets
    - source: hugo_stats.json
      target: assets/watching/hugo_stats.json

# Development server configuration
server:
  headers:
    - for: /**
      values:
        X-Frame-Options: DENY
        X-XSS-Protection: 1; mode=block
        X-Content-Type-Options: nosniff
        Referrer-Policy: strict-origin-when-cross-origin

# Markup configuration (optional, recommended for blogs)
markup:
  goldmark:
    renderer:
      unsafe: true  # Allow HTML in Markdown
  highlight:
    style: monokai  # Code highlighting theme
    lineNos: true
    lineNumbersInTable: true
```

**Key Settings Explained**:

- `writeStats: true` - Generates `hugo_stats.json` with all HTML elements, classes, and IDs used in your templates
- `module.mounts` - Makes `hugo_stats.json` available to Tailwind for content scanning
- `buildStats.enable: true` - Enables detailed build statistics

### Step 2: Tailwind Configuration

Create `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Content sources for class scanning
  content: [
    './hugo_stats.json',           // Hugo's generated stats file
    './layouts/**/*.html',         // All layout templates
    './content/**/*.{html,md}',    // All content files
  ],

  // Dark mode configuration
  darkMode: 'class',  // Use class-based dark mode (.dark on <html>)

  // Theme customization
  theme: {
    extend: {
      colors: {
        // Add custom colors if needed
        primary: '#0066cc',
        secondary: '#6366f1',
      },
      typography: (theme) => ({
        // Customize typography plugin (if using @tailwindcss/typography)
        DEFAULT: {
          css: {
            color: theme('colors.gray.900'),
            a: {
              color: theme('colors.primary'),
              '&:hover': {
                color: theme('colors.primary'),
              },
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.100'),
            a: {
              color: theme('colors.primary'),
            },
          },
        },
      }),
    },
  },

  // Plugins
  plugins: [
    // Add plugins here (see sections below)
  ],
}
```

### Step 3: PostCSS Configuration

Create `postcss.config.js`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Why PostCSS?**
- Hugo Pipes uses PostCSS to process CSS
- Tailwind v4 CLI is invoked via PostCSS
- Autoprefixer adds vendor prefixes for browser compatibility

### Step 4: Package Configuration

Create or edit `package.json`:

```json
{
  "name": "hugo-tailwind-site",
  "version": "1.0.0",
  "description": "Hugo site with Tailwind CSS v4",
  "scripts": {
    "dev": "hugo server --buildDrafts --buildFuture",
    "build": "hugo --minify",
    "clean": "rm -rf public resources"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^4.1.16"
  }
}
```

### Step 5: Tailwind CSS Entry File

Create `assets/css/main.css`:

```css
@import "tailwindcss";

/* Theme variables (Tailwind v4 approach) */
@theme inline {
  /* Custom colors */
  --color-primary: #0066cc;
  --color-secondary: #6366f1;

  /* Custom spacing (if needed) */
  --spacing-18: 4.5rem;
}

/* Base layer - global styles */
@layer base {
  html {
    @apply antialiased scroll-smooth;
  }

  body {
    @apply bg-white dark:bg-gray-900;
    @apply text-gray-900 dark:text-gray-100;
    @apply transition-colors duration-200;
  }

  /* Headings */
  h1 {
    @apply text-4xl font-bold mb-4;
  }

  h2 {
    @apply text-3xl font-bold mb-3;
  }

  h3 {
    @apply text-2xl font-semibold mb-2;
  }

  /* Links */
  a {
    @apply text-primary hover:underline;
  }
}

/* Component layer - reusable components */
@layer components {
  .btn {
    @apply px-4 py-2 rounded-md font-medium transition-colors;
  }

  .btn-primary {
    @apply bg-primary text-white hover:bg-primary/90;
  }

  .btn-outline {
    @apply border-2 border-primary text-primary hover:bg-primary hover:text-white;
  }

  .card {
    @apply bg-white dark:bg-gray-800 rounded-lg shadow-md p-6;
  }
}

/* Utility layer - custom utilities */
@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

**Tailwind v4 Key Differences**:
- Uses `@import "tailwindcss"` instead of separate `@tailwind` directives
- Theme customization via `@theme inline {}` (no need for `tailwind.config.js` theme)
- Still supports `@layer` for custom styles

### Step 6: Base Template with CSS Processing

Create `layouts/_default/baseof.html`:

```html
<!DOCTYPE html>
<html lang="{{ .Site.LanguageCode }}" class="h-full">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ if .IsHome }}{{ .Site.Title }}{{ else }}{{ .Title }} - {{ .Site.Title }}{{ end }}</title>

  {{/* Process Tailwind CSS with Hugo Pipes */}}
  {{ $options := dict "transpiler" "libsass" "targetPath" "css/main.css" }}
  {{ $style := resources.Get "css/main.css" | resources.PostCSS $options }}

  {{/* Minify and fingerprint in production */}}
  {{ if hugo.IsProduction }}
    {{ $style = $style | minify | fingerprint }}
  {{ end }}

  <link rel="stylesheet" href="{{ $style.RelPermalink }}"
    {{ if hugo.IsProduction }}
      integrity="{{ $style.Data.Integrity }}"
      crossorigin="anonymous"
    {{ end }}>

  {{/* Dark mode detection script (runs before page render) */}}
  <script>
    // Prevent flash of wrong theme
    (function() {
      const theme = localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList.toggle('dark', theme === 'dark');
    })();
  </script>
</head>
<body class="h-full flex flex-col">
  <div class="flex-1">
    {{ block "main" . }}{{ end }}
  </div>
</body>
</html>
```

**Hugo Pipes Breakdown**:

```go
{{ $style := resources.Get "css/main.css" }}       // Load CSS file
{{ $style = $style | resources.PostCSS $options }} // Process with PostCSS (Tailwind)
{{ $style = $style | minify }}                     // Minify (production only)
{{ $style = $style | fingerprint }}                // Add content hash (cache busting)
<link rel="stylesheet" href="{{ $style.RelPermalink }}"> // Output link
```

---

## Dark Mode Implementation

Hugo doesn't have React's ThemeProvider, so we implement dark mode with vanilla approaches.

### Approach 1: CSS-Only (Recommended)

**Pros**: No JavaScript, simple, works without JS enabled
**Cons**: No persistent toggle (always follows system preference)

Create `layouts/partials/dark-mode-css.html`:

```html
<style>
  /* Default to light mode */
  :root {
    color-scheme: light;
  }

  /* Auto dark mode based on system preference */
  @media (prefers-color-scheme: dark) {
    html {
      color-scheme: dark;
    }

    html:not(.light) {
      /* Add .dark class automatically */
      --tw-darkmode: dark;
    }
  }
</style>
```

Include in `baseof.html` `<head>`:

```html
{{ partial "dark-mode-css.html" . }}
```

**Limitations**: Users cannot manually toggle; always follows system preference.

### Approach 2: Alpine.js (Full Featured)

**Pros**: Manual toggle, localStorage persistence, smooth transitions
**Cons**: Requires JavaScript, adds ~15KB dependency

#### Step 1: Install Alpine.js

```bash
npm install -D alpinejs
```

Or use CDN in `baseof.html`:

```html
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

#### Step 2: Create Theme Toggle Partial

Create `layouts/partials/theme-toggle.html`:

```html
<div x-data="themeToggle()" x-init="init()">
  <button
    @click="toggle()"
    class="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    {{/* Moon icon - show in light mode */}}
    <svg x-show="!isDark" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
    </svg>

    {{/* Sun icon - show in dark mode */}}
    <svg x-show="isDark" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd" />
    </svg>
  </button>
</div>

<script>
  function themeToggle() {
    return {
      isDark: false,

      init() {
        // Load saved theme or detect system preference
        const savedTheme = localStorage.getItem('theme');

        if (savedTheme) {
          this.isDark = savedTheme === 'dark';
        } else {
          this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }

        // Apply initial theme
        this.applyTheme();

        // Watch for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (!localStorage.getItem('theme')) {
            this.isDark = e.matches;
            this.applyTheme();
          }
        });
      },

      toggle() {
        this.isDark = !this.isDark;
        this.applyTheme();
        localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
      },

      applyTheme() {
        if (this.isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
  }
</script>
```

#### Step 3: Include in Header

In your header partial or `baseof.html`:

```html
<header class="bg-white dark:bg-gray-800 shadow">
  <div class="container mx-auto px-4 py-4 flex justify-between items-center">
    <a href="/" class="text-2xl font-bold">{{ .Site.Title }}</a>

    <nav class="flex items-center gap-4">
      <a href="/posts">Posts</a>
      <a href="/about">About</a>

      {{/* Theme toggle */}}
      {{ partial "theme-toggle.html" . }}
    </nav>
  </div>
</header>
```

#### Step 4: Prevent Flash of Wrong Theme

Update `baseof.html` `<head>` (before CSS):

```html
<script>
  // Run before page render to prevent flash
  (function() {
    const theme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  })();
</script>
```

### Approach 3: Vanilla JavaScript (No Dependencies)

If you don't want Alpine.js, create a simpler vanilla JS version:

Create `layouts/partials/theme-toggle-vanilla.html`:

```html
<button
  id="theme-toggle"
  class="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
  aria-label="Toggle theme"
>
  <svg id="theme-toggle-dark-icon" class="hidden w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
  </svg>
  <svg id="theme-toggle-light-icon" class="hidden w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
  </svg>
</button>

<script>
  (function() {
    const toggle = document.getElementById('theme-toggle');
    const darkIcon = document.getElementById('theme-toggle-dark-icon');
    const lightIcon = document.getElementById('theme-toggle-light-icon');
    const html = document.documentElement;

    // Get saved theme or default to system preference
    const getTheme = () => {
      return localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    };

    // Apply theme
    const applyTheme = (theme) => {
      const isDark = theme === 'dark';
      html.classList.toggle('dark', isDark);
      darkIcon.classList.toggle('hidden', isDark);
      lightIcon.classList.toggle('hidden', !isDark);
    };

    // Initial theme
    applyTheme(getTheme());

    // Toggle on click
    toggle.addEventListener('click', () => {
      const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('theme', newTheme);
    });
  })();
</script>
```

---

## Typography Plugin Setup

The `@tailwindcss/typography` plugin provides beautiful typography styles for prose content (blog posts, docs, etc.).

### Installation

```bash
npm install -D @tailwindcss/typography
```

### Configuration (Tailwind v4 Method)

In `assets/css/main.css`, add the plugin using `@plugin` directive:

```css
@import "tailwindcss";

/* Add typography plugin */
@plugin "@tailwindcss/typography";

/* Optional: Customize typography theme */
@theme inline {
  /* Your custom colors */
  --color-primary: #0066cc;
}

/* Customize prose styles (optional) */
@layer components {
  .prose {
    /* Override default prose styles */
  }

  .prose-lg {
    /* Larger prose variant */
  }
}
```

**Alternative Method** (if the above doesn't work with your Tailwind v4 version):

Edit `tailwind.config.js`:

```javascript
module.exports = {
  // ... other config
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

### Usage in Templates

Wrap your content in a container with the `prose` class:

Create `layouts/_default/single.html`:

```html
{{ define "main" }}
<article class="container mx-auto px-4 py-8">
  <header class="mb-8">
    <h1 class="text-4xl font-bold mb-2">{{ .Title }}</h1>

    {{ if .Date }}
      <time class="text-gray-600 dark:text-gray-400">
        {{ .Date.Format "January 2, 2006" }}
      </time>
    {{ end }}
  </header>

  {{/* Prose wrapper for beautiful typography */}}
  <div class="prose dark:prose-invert max-w-none">
    {{ .Content }}
  </div>

  {{ if .Params.tags }}
    <footer class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div class="flex flex-wrap gap-2">
        {{ range .Params.tags }}
          <a href="/tags/{{ . | urlize }}" class="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm">
            {{ . }}
          </a>
        {{ end }}
      </div>
    </footer>
  {{ end }}
</article>
{{ end }}
```

### Typography Variants

The plugin provides several size variants:

```html
<div class="prose prose-sm">Small prose</div>
<div class="prose">Default prose</div>
<div class="prose prose-lg">Large prose</div>
<div class="prose prose-xl">Extra large prose</div>
<div class="prose prose-2xl">2X large prose</div>
```

### Dark Mode Support

Use `dark:prose-invert` to automatically adapt colors for dark mode:

```html
<div class="prose dark:prose-invert">
  {{ .Content }}
</div>
```

### Custom Typography Theme

To customize typography colors to match your theme, add to `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.900'),
            a: {
              color: theme('colors.primary'),
              '&:hover': {
                color: theme('colors.primary'),
                textDecoration: 'underline',
              },
            },
            h1: {
              color: theme('colors.gray.900'),
            },
            h2: {
              color: theme('colors.gray.900'),
            },
            h3: {
              color: theme('colors.gray.900'),
            },
            code: {
              color: theme('colors.pink.600'),
              backgroundColor: theme('colors.gray.100'),
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              fontWeight: '600',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.100'),
            a: {
              color: theme('colors.primary'),
            },
            h1: {
              color: theme('colors.gray.100'),
            },
            h2: {
              color: theme('colors.gray.100'),
            },
            h3: {
              color: theme('colors.gray.100'),
            },
            code: {
              color: theme('colors.pink.400'),
              backgroundColor: theme('colors.gray.800'),
            },
            blockquote: {
              color: theme('colors.gray.300'),
              borderLeftColor: theme('colors.primary'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

---

## Forms Plugin Setup

The `@tailwindcss/forms` plugin provides better default styles for form elements.

### Installation

```bash
npm install -D @tailwindcss/forms
```

### Configuration (Tailwind v4 Method)

In `assets/css/main.css`:

```css
@import "tailwindcss";

/* Add forms plugin with strategy */
@plugin "@tailwindcss/forms" {
  strategy: "class";  /* or "base" */
}
```

**Strategy Options**:

1. **`"base"`** (default): Applies global styles to ALL form elements
   ```css
   @plugin "@tailwindcss/forms" {
     strategy: "base";
   }
   ```
   Result: All `<input>`, `<select>`, `<textarea>` elements get styled automatically

2. **`"class"`**: Only style elements with `form-*` classes (opt-in)
   ```css
   @plugin "@tailwindcss/forms" {
     strategy: "class";
   }
   ```
   Result: Only elements with `form-input`, `form-select`, etc. get styled

**Alternative Method** (if the above doesn't work):

Edit `tailwind.config.js`:

```javascript
module.exports = {
  // ... other config
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // or 'base'
    }),
  ],
}
```

### Usage in Templates

#### With `strategy: "base"` (Global Styles)

All form elements are styled automatically:

```html
<form class="space-y-4">
  <div>
    <label for="name" class="block mb-2">Name</label>
    <input
      type="text"
      id="name"
      name="name"
      placeholder="Enter your name"
    >
  </div>

  <div>
    <label for="email" class="block mb-2">Email</label>
    <input
      type="email"
      id="email"
      name="email"
      placeholder="you@example.com"
    >
  </div>

  <div>
    <label for="message" class="block mb-2">Message</label>
    <textarea
      id="message"
      name="message"
      rows="4"
      placeholder="Your message..."
    ></textarea>
  </div>

  <button type="submit" class="btn btn-primary">
    Send Message
  </button>
</form>
```

#### With `strategy: "class"` (Opt-In Styles)

Add `form-*` classes explicitly:

```html
<form class="space-y-4">
  <input
    type="text"
    class="form-input rounded-md border-gray-300 dark:border-gray-600"
    placeholder="Enter your name"
  >

  <select class="form-select rounded-md border-gray-300 dark:border-gray-600">
    <option>Option 1</option>
    <option>Option 2</option>
  </select>

  <textarea
    class="form-textarea rounded-md border-gray-300 dark:border-gray-600"
    rows="4"
  ></textarea>

  <input type="checkbox" class="form-checkbox rounded text-primary">
  <input type="radio" class="form-radio text-primary">
</form>
```

### Available Classes (with `strategy: "class"`)

- `form-input` - Text inputs, email, password, etc.
- `form-textarea` - Textareas
- `form-select` - Select dropdowns
- `form-checkbox` - Checkboxes
- `form-radio` - Radio buttons

### Custom Form Styles

Add custom form styles to `assets/css/main.css`:

```css
@layer components {
  .form-group {
    @apply mb-4;
  }

  .form-label {
    @apply block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300;
  }

  .form-input-custom {
    @apply w-full px-4 py-2 border border-gray-300 dark:border-gray-600;
    @apply rounded-md bg-white dark:bg-gray-800;
    @apply text-gray-900 dark:text-gray-100;
    @apply focus:ring-2 focus:ring-primary focus:border-transparent;
    @apply transition-colors;
  }

  .form-error {
    @apply mt-1 text-sm text-red-600 dark:text-red-400;
  }
}
```

Usage:

```html
<div class="form-group">
  <label class="form-label" for="email">Email</label>
  <input
    type="email"
    id="email"
    class="form-input-custom"
    placeholder="you@example.com"
  >
  <p class="form-error">Please enter a valid email</p>
</div>
```

---

## Template Integration

### Using Tailwind Classes in Go Templates

Hugo templates use Go's template syntax. Here's how to use Tailwind classes effectively:

#### Basic Class Application

```html
<div class="container mx-auto px-4 py-8">
  <h1 class="text-4xl font-bold mb-4">{{ .Title }}</h1>
  <p class="text-gray-600 dark:text-gray-400">{{ .Description }}</p>
</div>
```

#### Conditional Classes

Use Hugo conditionals to apply classes dynamically:

```html
{{/* Featured badge on featured posts */}}
{{ if .Params.featured }}
  <span class="px-2 py-1 bg-primary text-white text-xs rounded">Featured</span>
{{ end }}

{{/* Different styles for published vs draft */}}
<article class="{{ if .Draft }}opacity-50 bg-yellow-50 dark:bg-yellow-900/20{{ else }}bg-white dark:bg-gray-800{{ end }}">
  {{ .Content }}
</article>

{{/* Active nav link styling */}}
<nav>
  {{ range .Site.Menus.main }}
    <a href="{{ .URL }}" class="px-4 py-2 {{ if $.IsMenuCurrent "main" . }}bg-primary text-white{{ else }}text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700{{ end }}">
      {{ .Name }}
    </a>
  {{ end }}
</nav>
```

#### Iterate with Tailwind

```html
{{/* Post grid */}}
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {{ range .Pages }}
    <article class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
      {{ if .Params.image }}
        <img src="{{ .Params.image }}" alt="{{ .Title }}" class="w-full h-48 object-cover">
      {{ end }}

      <div class="p-6">
        <h2 class="text-2xl font-bold mb-2">
          <a href="{{ .Permalink }}" class="hover:text-primary transition-colors">{{ .Title }}</a>
        </h2>

        <p class="text-gray-600 dark:text-gray-400 mb-4">{{ .Summary }}</p>

        <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-500">
          <time datetime="{{ .Date.Format "2006-01-02" }}">{{ .Date.Format "Jan 2, 2006" }}</time>
          <span>{{ .ReadingTime }} min read</span>
        </div>
      </div>
    </article>
  {{ end }}
</div>
```

### Component-Like Partials

Create reusable partials with Tailwind classes:

#### Button Partial

Create `layouts/partials/button.html`:

```html
{{/* Usage: {{ partial "button.html" (dict "href" "/about" "text" "Learn More" "variant" "primary") }} */}}

{{ $href := .href }}
{{ $text := .text }}
{{ $variant := .variant | default "default" }}
{{ $size := .size | default "default" }}

{{ $baseClasses := "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50" }}

{{ $variantClasses := dict
  "primary" "bg-primary text-white hover:bg-primary/90"
  "secondary" "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600"
  "outline" "border-2 border-primary text-primary hover:bg-primary hover:text-white"
  "ghost" "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
}}

{{ $sizeClasses := dict
  "sm" "px-3 py-1.5 text-sm"
  "default" "px-4 py-2"
  "lg" "px-6 py-3 text-lg"
}}

<a href="{{ $href }}" class="{{ $baseClasses }} {{ index $variantClasses $variant }} {{ index $sizeClasses $size }}">
  {{ $text }}
</a>
```

Usage in templates:

```html
{{ partial "button.html" (dict "href" "/posts" "text" "View All Posts" "variant" "primary") }}
{{ partial "button.html" (dict "href" "/about" "text" "Learn More" "variant" "outline" "size" "lg") }}
```

#### Card Partial

Create `layouts/partials/card.html`:

```html
{{/* Usage: {{ partial "card.html" . }} */}}

<article class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
  {{ if .Params.image }}
    <div class="aspect-video w-full overflow-hidden">
      <img src="{{ .Params.image }}" alt="{{ .Title }}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300">
    </div>
  {{ end }}

  <div class="p-6">
    <h3 class="text-xl font-bold mb-2">
      <a href="{{ .Permalink }}" class="hover:text-primary transition-colors">
        {{ .Title }}
      </a>
    </h3>

    {{ if .Summary }}
      <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
        {{ .Summary }}
      </p>
    {{ end }}

    <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-500">
      <time datetime="{{ .Date.Format "2006-01-02" }}">
        {{ .Date.Format "Jan 2, 2006" }}
      </time>

      {{ if .ReadingTime }}
        <span>{{ .ReadingTime }} min read</span>
      {{ end }}
    </div>

    {{ if .Params.tags }}
      <div class="flex flex-wrap gap-2 mt-4">
        {{ range .Params.tags }}
          <a href="/tags/{{ . | urlize }}" class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full hover:bg-primary hover:text-white transition-colors">
            {{ . }}
          </a>
        {{ end }}
      </div>
    {{ end }}
  </div>
</article>
```

---

## PaperMod vs Tailwind Decision Guide

### When to Use PaperMod (or Other Themes)

**Choose PaperMod/themes when:**

✅ You need a production-ready design immediately
✅ You're happy with theme customization options (colors, fonts, layout within limits)
✅ You don't have specific design requirements
✅ You want proven, battle-tested components
✅ You're building a standard blog/docs site
✅ You want community support and regular updates
✅ You don't want to write custom CSS

**Example Use Cases:**
- Personal blog (standard layout)
- Developer portfolio (standard design)
- Documentation site (focus on content)
- Quick MVP launch

### When to Use Tailwind

**Choose Tailwind when:**

✅ You need complete design control
✅ You have custom design requirements or brand guidelines
✅ You want utility-first CSS workflow
✅ You're building a unique layout
✅ You want to build a custom component library
✅ You're comfortable with CSS and design
✅ Theme customization is too limiting

**Example Use Cases:**
- Custom marketing site (unique design)
- Product landing pages (brand-specific)
- Portfolio with custom layout
- Application-like interface (not just content)

### Hybrid Approach: Start with Theme, Migrate to Tailwind

**Step 1**: Start with PaperMod for quick launch
**Step 2**: Use theme while building content and testing
**Step 3**: Migrate to Tailwind when design needs exceed theme capabilities

**Migration Process:**

1. Install Tailwind (follow setup guide above)
2. Create new layouts in `layouts/` (overrides theme)
3. Gradually replace theme templates with Tailwind versions
4. Remove theme when all templates are replaced

### Comparison Table

| Aspect | PaperMod Theme | Tailwind CSS |
|--------|---------------|--------------|
| **Setup Time** | 5 minutes | 15-30 minutes |
| **Design Flexibility** | Limited to theme options | Complete control |
| **Learning Curve** | Low (just config) | Medium (learn Tailwind) |
| **Customization** | Theme parameters | Full CSS control |
| **Maintenance** | Theme updates | Self-maintained |
| **Bundle Size** | ~50KB (theme CSS) | ~10-20KB (purged utilities) |
| **Dark Mode** | Built-in | Implement yourself |
| **Components** | Pre-built | Build yourself |
| **Best For** | Standard blogs/docs | Custom designs |

---

## Common Issues & Solutions

### Issue 1: Tailwind Not Processing CSS

**Symptoms:**
- Raw `@import "tailwindcss"` visible in browser
- Tailwind classes not working
- Console error: "Unknown at rule @import"

**Causes:**
- PostCSS not installed
- Hugo Pipes not configured
- Missing `resources.PostCSS` in template

**Solutions:**

**Check 1**: Verify PostCSS installation
```bash
npm list postcss tailwindcss autoprefixer
```

If missing:
```bash
npm install -D postcss tailwindcss autoprefixer
```

**Check 2**: Verify `postcss.config.js` exists:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Check 3**: Verify Hugo Pipes usage in `baseof.html`:
```html
{{ $style := resources.Get "css/main.css" | resources.PostCSS }}
<link rel="stylesheet" href="{{ $style.RelPermalink }}">
```

**Check 4**: Clear Hugo cache
```bash
rm -rf resources/ public/
hugo server
```

---

### Issue 2: Classes Not Purging / Large CSS File

**Symptoms:**
- Production CSS is 3MB+ (should be ~10-20KB)
- All Tailwind utilities included (not just used ones)

**Causes:**
- `hugo_stats.json` not being generated
- Wrong content paths in `tailwind.config.js`
- `writeStats: false` in `hugo.yaml`

**Solutions:**

**Check 1**: Verify `hugo.yaml` has `writeStats: true`:
```yaml
build:
  writeStats: true
```

**Check 2**: Check `hugo_stats.json` exists and has content:
```bash
cat hugo_stats.json
```

Should contain:
```json
{
  "htmlElements": {
    "tags": ["html", "body", "div"],
    "classes": ["container", "mx-auto", "px-4"],
    "ids": ["main"]
  }
}
```

If empty or missing, Hugo isn't generating it. Rebuild:
```bash
hugo --buildStats
```

**Check 3**: Verify `tailwind.config.js` content paths:
```javascript
module.exports = {
  content: [
    './hugo_stats.json',           // Must be included!
    './layouts/**/*.html',
    './content/**/*.{html,md}',
  ],
}
```

**Check 4**: Rebuild everything:
```bash
rm -rf public/ resources/ hugo_stats.json
hugo --buildStats
```

---

### Issue 3: Dark Mode Not Switching

**Symptoms:**
- Dark mode toggle doesn't work
- Theme doesn't persist after refresh
- Always light or always dark

**Causes:**
- Missing `darkMode: 'class'` in config
- No localStorage script
- JavaScript errors

**Solutions:**

**Check 1**: Verify `tailwind.config.js` has `darkMode: 'class'`:
```javascript
module.exports = {
  darkMode: 'class',  // Must be 'class', not 'media'
  // ...
}
```

**Check 2**: Verify theme detection script in `<head>` (before CSS):
```html
<script>
  (function() {
    const theme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  })();
</script>
```

**Check 3**: Verify toggle button JavaScript works:
```javascript
// Test in browser console
localStorage.getItem('theme')  // Should return 'dark' or 'light'
document.documentElement.classList.contains('dark')  // Should match theme
```

**Check 4**: Check browser console for errors:
- Open DevTools → Console
- Look for JavaScript errors

**Check 5**: Test manually:
```javascript
// In browser console
document.documentElement.classList.add('dark')      // Should switch to dark
document.documentElement.classList.remove('dark')   // Should switch to light
```

---

### Issue 4: Asset Fingerprinting Breaks Styles

**Symptoms:**
- CSS loads in dev but not production
- 404 error for CSS file in production
- Different hash on each build breaks caching

**Causes:**
- Incorrect `RelPermalink` usage
- Missing integrity attribute handling
- CDN caching old hash

**Solutions:**

**Check 1**: Verify correct Hugo Pipes setup:
```html
{{ $style := resources.Get "css/main.css" | resources.PostCSS }}
{{ if hugo.IsProduction }}
  {{ $style = $style | minify | fingerprint }}
{{ end }}

<link rel="stylesheet" href="{{ $style.RelPermalink }}"
  {{ if hugo.IsProduction }}
    integrity="{{ $style.Data.Integrity }}"
    crossorigin="anonymous"
  {{ end }}>
```

**Check 2**: Verify build output:
```bash
hugo --minify
ls -lh public/css/
```

Should see: `main.[hash].css`

**Check 3**: If deploying to Cloudflare Workers, verify `wrangler.jsonc`:
```jsonc
{
  "compatibility_date": "2025-01-10",
  "assets": {
    "directory": "./public"
  }
}
```

**Check 4**: Clear all caches:
```bash
# Local Hugo cache
rm -rf resources/ public/

# Cloudflare cache (if deployed)
npx wrangler deploy --force
```

---

### Issue 5: Hugo Template Syntax in @apply Breaks Build

**Symptoms:**
- Build error: "Unknown at rule @apply"
- CSS doesn't compile when using Go template variables in styles

**Cause:**
- Trying to use Hugo template syntax ({{ }}) inside CSS `@apply` directive

**Example of Problem:**
```css
/* ❌ This won't work */
.post-{{ .Type }} {
  @apply text-gray-900 dark:text-gray-100;
}
```

**Solution:**

**Option 1**: Use inline styles in templates (recommended):
```html
{{/* ✅ Inline styles */}}
<div class="text-gray-900 dark:text-gray-100">
  Content
</div>
```

**Option 2**: Use Hugo's `style` attribute for dynamic values:
```html
{{/* ✅ Dynamic inline style */}}
<div style="color: {{ .Params.textColor }};" class="font-bold">
  Content
</div>
```

**Option 3**: Generate classes dynamically in template:
```html
{{/* ✅ Conditional classes */}}
<div class="{{ if eq .Type "post" }}text-blue-600{{ else }}text-gray-900{{ end }}">
  Content
</div>
```

**Never** try to use Hugo template syntax inside CSS files - it won't be processed.

---

### Issue 6: Version Mismatch Between CLI and PostCSS

**Symptoms:**
- Error: "Tailwind CSS version mismatch"
- Unexpected behavior after updating
- Build warnings about incompatible versions

**Cause:**
- `tailwindcss` package (PostCSS plugin) and Tailwind CLI are different versions

**Solution:**

**Check current versions:**
```bash
npm list tailwindcss postcss autoprefixer
```

**Update all to latest:**
```bash
npm install -D tailwindcss@latest postcss@latest autoprefixer@latest
```

**Verify versions match:**
```bash
npx tailwindcss --help  # Should show v4.1.16
```

**Clear cache and rebuild:**
```bash
rm -rf node_modules/.cache resources/ public/
npm install
hugo server
```

---

## Configuration Reference

### Complete hugo.yaml Example

```yaml
baseURL: 'https://example.com/'
languageCode: 'en-us'
title: 'My Hugo Site'
theme: ''

# Build configuration
build:
  writeStats: true

  buildStats:
    enable: true
    disableClasses: false
    disableIDs: false
    disableTags: false

# Module configuration
module:
  mounts:
    - source: assets
      target: assets
    - source: hugo_stats.json
      target: assets/watching/hugo_stats.json

# Params (site-wide variables)
params:
  description: 'A Hugo site with Tailwind CSS v4'
  author: 'Your Name'

# Menu configuration
menu:
  main:
    - identifier: home
      name: Home
      url: /
      weight: 1
    - identifier: posts
      name: Posts
      url: /posts/
      weight: 2
    - identifier: about
      name: About
      url: /about/
      weight: 3

# Taxonomies
taxonomies:
  tag: tags
  category: categories

# Markup configuration
markup:
  goldmark:
    renderer:
      unsafe: true
  highlight:
    style: monokai
    lineNos: true
    lineNumbersInTable: true

# Output formats
outputs:
  home:
    - HTML
    - RSS
  page:
    - HTML

# Server configuration (development)
server:
  headers:
    - for: /**
      values:
        X-Frame-Options: DENY
        X-Content-Type-Options: nosniff
```

### Complete tailwind.config.js Example

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './hugo_stats.json',
    './layouts/**/*.html',
    './content/**/*.{html,md}',
  ],

  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        primary: '#0066cc',
        secondary: '#6366f1',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.900'),
            a: {
              color: theme('colors.primary'),
              '&:hover': {
                color: theme('colors.primary'),
              },
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.100'),
            a: {
              color: theme('colors.primary'),
            },
          },
        },
      }),
    },
  },

  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
}
```

### Complete package.json Example

```json
{
  "name": "hugo-tailwind-site",
  "version": "1.0.0",
  "description": "Hugo site with Tailwind CSS v4",
  "scripts": {
    "dev": "hugo server --buildDrafts --buildFuture",
    "build": "hugo --minify",
    "clean": "rm -rf public resources hugo_stats.json"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.10",
    "@tailwindcss/typography": "^0.5.16",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^4.1.16"
  }
}
```

---

## Build Commands

### Development

```bash
# Start Hugo dev server with live reload
hugo server

# With drafts and future posts
hugo server --buildDrafts --buildFuture

# On different port
hugo server --port 1314

# With verbose logging
hugo server --verbose

# Bind to all network interfaces (access from other devices)
hugo server --bind 0.0.0.0
```

### Production Build

```bash
# Build for production (minified, fingerprinted)
hugo --minify

# Build with specific environment
hugo --environment production

# Build and show build stats
hugo --buildStats --minify

# Clean before build
rm -rf public/ resources/ hugo_stats.json && hugo --minify
```

### Debugging

```bash
# Check Hugo version
hugo version

# Verify configuration
hugo config

# List all content
hugo list all

# Check what will be published (not drafts/future)
hugo list published

# Generate hugo_stats.json manually
hugo --buildStats
```

### npm Scripts (Recommended)

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "hugo server --buildDrafts --buildFuture",
    "build": "hugo --minify",
    "clean": "rm -rf public resources hugo_stats.json",
    "deploy": "npm run clean && npm run build && npx wrangler deploy"
  }
}
```

Usage:
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run clean    # Clean cache
npm run deploy   # Build and deploy to Cloudflare
```

---

## Production Deployment

### Deploy to Cloudflare Workers

Hugo sites work perfectly with Cloudflare Workers Static Assets.

#### Step 1: Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

#### Step 2: Create wrangler.jsonc

```jsonc
{
  "name": "hugo-tailwind-site",
  "compatibility_date": "2025-01-10",
  "assets": {
    "directory": "./public",
    "binding": "ASSETS"
  }
}
```

#### Step 3: Build and Deploy

```bash
# Build for production
hugo --minify

# Deploy to Cloudflare
npx wrangler deploy
```

Your site will be live at: `https://hugo-tailwind-site.YOUR-SUBDOMAIN.workers.dev`

#### Step 4: Custom Domain (Optional)

```jsonc
{
  "name": "hugo-tailwind-site",
  "compatibility_date": "2025-01-10",
  "assets": {
    "directory": "./public"
  },
  "routes": [
    {
      "pattern": "yourdomain.com/*",
      "zone_name": "yourdomain.com"
    }
  ]
}
```

### CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true  # Fetch themes if using git submodules

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

      - name: Deploy to Cloudflare
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: deploy
```

---

## Official Documentation

- **Hugo**: https://gohugo.io/documentation/
- **Hugo Pipes**: https://gohugo.io/hugo-pipes/introduction/
- **Hugo PostCSS**: https://gohugo.io/hugo-pipes/postcss/
- **Tailwind CSS v4**: https://tailwindcss.com/docs/v4-beta
- **Tailwind CLI**: https://tailwindcss.com/docs/installation
- **@tailwindcss/typography**: https://tailwindcss.com/docs/typography-plugin
- **@tailwindcss/forms**: https://github.com/tailwindlabs/tailwindcss-forms
- **PostCSS**: https://postcss.org/
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Wrangler**: https://developers.cloudflare.com/workers/wrangler/

---

## Troubleshooting Checklist

If Tailwind isn't working with Hugo, check this list:

- [ ] `postcss`, `tailwindcss`, `autoprefixer` installed in `package.json`
- [ ] `postcss.config.js` exists with correct plugins
- [ ] `tailwind.config.js` has `hugo_stats.json` in content paths
- [ ] `hugo.yaml` has `writeStats: true`
- [ ] `hugo_stats.json` is generated and contains classes
- [ ] `assets/css/main.css` has `@import "tailwindcss"`
- [ ] `baseof.html` uses `resources.PostCSS` to process CSS
- [ ] Hugo dev server is running (`hugo server`)
- [ ] No JavaScript errors in browser console (for dark mode)
- [ ] `darkMode: 'class'` in `tailwind.config.js` (for dark mode)
- [ ] Clear cache: `rm -rf resources/ public/ hugo_stats.json`

---

**End of Guide**

For questions or issues, refer to:
- Hugo Discourse: https://discourse.gohugo.io/
- Tailwind Discord: https://tailwindcss.com/discord
- GitHub Issues: (your repo)

**Last Updated**: 2025-11-04
**Version**: 2.0.0
