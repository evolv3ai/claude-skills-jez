# Hugo + Tailwind CSS v4 Blog Template

A complete blog template with Hugo and Tailwind CSS v4. Features a modern design, dark mode, responsive layouts, and beautiful typography for blog posts.

## Features

- ✅ Hugo 0.152.2+ with Extended version
- ✅ Tailwind CSS v4.1.16
- ✅ @tailwindcss/typography for beautiful blog posts
- ✅ Dark mode with vanilla JavaScript
- ✅ Blog post listings with card design
- ✅ Tag/category support
- ✅ Responsive navigation
- ✅ Reading time estimates
- ✅ Post metadata (date, tags, reading time)
- ✅ SEO-friendly markup
- ✅ Production-optimized build

## Quick Start

### 1. Copy Template

```bash
cp -r hugo-tailwind-blog/ my-blog/
cd my-blog/
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:1313`

### 4. Create Your First Post

```bash
hugo new posts/my-first-post.md
```

Edit `content/posts/my-first-post.md`:

```markdown
---
title: "My First Post"
date: 2025-11-04
draft: false
tags: ["hello", "first-post"]
categories: ["General"]
description: "My first blog post"
---

Content goes here...
```

## Project Structure

```
hugo-tailwind-blog/
├── assets/
│   └── css/
│       └── main.css              # Tailwind with typography styles
├── content/
│   ├── _index.md                 # Homepage
│   ├── about.md                  # About page
│   └── posts/
│       ├── _index.md             # Posts list page
│       └── my-first-post.md      # Example post
├── layouts/
│   ├── _default/
│   │   ├── baseof.html           # Base template
│   │   ├── list.html             # List pages
│   │   └── single.html           # Single pages
│   ├── partials/
│   │   ├── head.html             # <head> with CSS
│   │   ├── header.html           # Site header
│   │   ├── footer.html           # Site footer
│   │   ├── theme-toggle.html     # Dark mode toggle
│   │   └── post-card.html        # Reusable post card
│   ├── posts/
│   │   ├── list.html             # Posts list layout
│   │   └── single.html           # Single post layout
│   └── index.html                # Homepage layout
├── static/
│   └── images/                   # Static images
├── hugo.yaml                     # Hugo configuration
├── tailwind.config.js            # Tailwind with typography
├── postcss.config.js             # PostCSS configuration
├── package.json                  # npm dependencies & scripts
└── README.md                     # This file
```

## Configuration

### Site Settings

Edit `hugo.yaml`:

```yaml
baseURL: 'https://yourblog.com/'
title: 'My Blog'

params:
  description: 'A modern blog about...'
  author: 'Your Name'
  postsPerPage: 10
```

### Menu

Add menu items in `hugo.yaml`:

```yaml
menu:
  main:
    - name: Home
      url: /
      weight: 1
    - name: Posts
      url: /posts/
      weight: 2
    - name: About
      url: /about/
      weight: 3
```

### Tailwind Customization

Edit `tailwind.config.js` to customize colors, fonts, etc.

Edit `assets/css/main.css` to customize typography styles.

## Content Structure

### Homepage

Edit `content/_index.md` for your homepage content.

### Blog Posts

Create posts in `content/posts/`:

```markdown
---
title: "Post Title"
date: 2025-11-04
draft: false
tags: ["tag1", "tag2"]
categories: ["Category"]
description: "SEO description"
image: "/images/post-image.jpg"  # Optional featured image
---

Your post content here...
```

### Pages

Create pages in `content/`:

```bash
hugo new about.md
hugo new contact.md
```

## Features Explained

### Typography Plugin

This template uses `@tailwindcss/typography` for beautiful prose styles.

Wrap your content in `prose` class (already done in post template):

```html
<article class="prose dark:prose-invert max-w-none">
  {{ .Content }}
</article>
```

### Post Cards

Reusable post card partial (`layouts/partials/post-card.html`) shows:
- Featured image (if present)
- Title
- Date and reading time
- Summary/description
- Tags

### Dark Mode

Vanilla JavaScript dark mode with:
- System preference detection
- Manual toggle
- localStorage persistence
- No flash on page load

### Tags & Categories

Access tags and categories:

```go
{{/* In templates */}}
{{ range .Params.tags }}
  <a href="/tags/{{ . | urlize }}">{{ . }}</a>
{{ end }}

{{/* List all tags */}}
{{ range $name, $taxonomy := .Site.Taxonomies.tags }}
  <a href="/tags/{{ $name | urlize }}">{{ $name }}</a>
{{ end }}
```

## npm Scripts

```bash
npm run dev          # Start dev server with drafts
npm run build        # Build for production
npm run clean        # Clean build artifacts
```

## Customization

### Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    },
  },
},
```

### Typography

Edit `assets/css/main.css` or `tailwind.config.js` to customize prose styles.

### Fonts

Add Google Fonts in `layouts/partials/head.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

Then update `tailwind.config.js`:

```javascript
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
  },
},
```

## Production Build

```bash
npm run build
```

Output in `public/` directory, optimized with:
- Minified CSS
- Fingerprinted assets
- Only used Tailwind utilities

## Deployment

### Cloudflare Workers

```bash
# Create wrangler.jsonc
npm run build
npx wrangler deploy
```

### GitHub Pages

Use GitHub Actions workflow (see minimal template README for example).

## Content Tips

### Writing Posts

- Use descriptive titles
- Add tags for discoverability
- Include meta descriptions
- Use headings (H2, H3) for structure
- Add images to break up text
- Write summaries (first 70 words auto-used)

### Images

Place images in `static/images/`:

```markdown
![Alt text](/images/my-image.jpg)
```

Or use Hugo's image processing:

```markdown
{{< figure src="/images/my-image.jpg" alt="Alt text" >}}
```

### Code Blocks

Use fenced code blocks with language:

```markdown
\`\`\`javascript
const hello = "world";
\`\`\`
```

### Frontmatter Templates

Create `archetypes/posts.md` for post templates:

```markdown
---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
draft: true
tags: []
categories: []
description: ""
---

Write your post here...
```

## Troubleshooting

Same as minimal template - see that README for common issues.

## Resources

- [Hugo Documentation](https://gohugo.io/documentation/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind Typography](https://tailwindcss.com/docs/typography-plugin)
- [Hugo + Tailwind Integration Guide](../../references/tailwind-v4-integration.md)

## License

MIT License - free to use for any project!
