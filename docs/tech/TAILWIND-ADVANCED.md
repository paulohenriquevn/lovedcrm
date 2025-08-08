# Tailwind CSS Advanced Patterns & Components

> **Advanced Tailwind CSS patterns, component integration, and shadcn/ui components for our Multi-Tenant SaaS project**

## **PRINCÍPIOS FUNDAMENTAIS - EXTREMAMENTE IMPORTANTES**

### **KISS, YAGNI, DRY - NUNCA QUEBRAR**

- **KISS (Keep It Simple, Stupid)**: **SEMPRE** escolher a solução mais simples que funciona
- **YAGNI (You Aren't Gonna Need It)**: **NUNCA** implementar funcionalidades "para o futuro"
- **DRY (Don't Repeat Yourself)**: **SEMPRE** reutilizar código existente antes de criar novo
- **CRITICAL**: Quebrar estes princípios é considerado falha crítica no desenvolvimento

## Table of Contents

- [Components Integration](#components-integration)
- [shadcn/ui Integration](#shadcnui-integration)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)
- [Performance Tips](#performance-tips)
- [Quick Reference](#quick-reference)

> **For core utilities**: See [TAILWIND-CSS-GUIDE.md](TAILWIND-CSS-GUIDE.md)

---

## Components Integration

### shadcn/ui Button Integration

```html
<!-- Primary button -->
<button
  class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
>
  Primary Button
</button>

<!-- Secondary button -->
<button
  class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
>
  Secondary Button
</button>
```

### Card Components

```html
<!-- Basic card -->
<div class="rounded-lg border bg-card text-card-foreground shadow-sm">
  <div class="p-6 pt-0">
    <div class="space-y-1.5 p-6">
      <h3 class="text-2xl font-semibold leading-none tracking-tight">
        Card Title
      </h3>
      <p class="text-sm text-muted-foreground">Card description</p>
    </div>
    <div class="p-6 pt-0">Card content</div>
  </div>
</div>
```

### Form Components

```html
<!-- Input field -->
<div class="space-y-2">
  <label
    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    Email
  </label>
  <input
    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    type="email"
    placeholder="Enter your email"
  />
</div>

<!-- Select field -->
<select
  class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

---

## shadcn/ui Integration

### Using shadcn/ui Components

Our project uses shadcn/ui for consistent styling and component patterns:

```typescript
// Import components from shadcn/ui
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge, badgeVariants } from "@/components/ui/badge"
```

### Common Patterns

```tsx
// Icon sizes using standard Tailwind classes
const iconSizes = {
  xs: "h-3 w-3", // Small indicators
  sm: "h-4 w-4", // Standard icons
  md: "h-5 w-5", // Medium icons
  lg: "h-6 w-6", // Large icons
  xl: "h-8 w-8", // Extra large icons
}

// Typography using Tailwind classes
const typography = {
  h1: "text-3xl font-bold tracking-tight",
  h2: "text-2xl font-semibold tracking-tight",
  h3: "text-xl font-semibold",
  h4: "text-lg font-semibold",
  large: "text-lg",
  base: "text-base",
  small: "text-sm",
  muted: "text-sm text-muted-foreground",
}

// Grid systems using Tailwind CSS Grid
const gridSystems = {
  stats: "grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  twoCol: "grid gap-6 grid-cols-1 lg:grid-cols-2",
  form: "grid gap-4 grid-cols-1 md:grid-cols-2",
}
```

### Usage Examples

```tsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function MyComponent() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">
            Card Title
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Button size="sm">Action Button</Button>
            <span className="text-sm text-muted-foreground">Small text</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Best Practices

### 1. **Component Composition**

```tsx
// Good: Reusable component with Tailwind classes
const Button = ({ variant = "primary", size = "md", children, ...props }) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors"
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  }
  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-6 text-lg",
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]}`}
      {...props}
    >
      {children}
    </button>
  )
}
```

### 2. **Responsive Design Patterns**

```html
<!-- Good: Mobile-first responsive -->
<div class="p-4 md:p-6 lg:p-8">
  <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold">Responsive Title</h1>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- Responsive grid -->
  </div>
</div>

<!-- Avoid: Desktop-first -->
<div class="p-8 md:p-6 sm:p-4">
  <!-- Wrong order -->
</div>
```

### 3. **Performance Optimization**

```html
<!-- Good: Use semantic classes -->
<div class="bg-card text-card-foreground border-border">Semantic styling</div>

<!-- Avoid: Too many utility classes -->
<div
  class="bg-white text-gray-900 border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 ease-in-out"
>
  Consider extracting to component
</div>
```

### 4. **Accessibility First**

```html
<!-- Good: Accessible focus states -->
<button
  class="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
>
  Accessible button
</button>

<!-- Good: Proper contrast -->
<div class="bg-gray-900 text-white">High contrast text</div>

<!-- Good: Screen reader utilities -->
<span class="sr-only">Screen reader only text</span>
```

### 5. **Dark Mode Best Practices**

```html
<!-- Good: Consistent dark variants -->
<div
  class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
>
  Proper dark mode support
</div>

<!-- Good: Use semantic colors -->
<div class="bg-background text-foreground border-border">
  Automatic theme adaptation
</div>
```

---

## Common Patterns

### 1. **Loading States**

```html
<!-- Skeleton loading -->
<div class="animate-pulse">
  <div class="bg-gray-300 h-4 rounded w-3/4 mb-2"></div>
  <div class="bg-gray-300 h-4 rounded w-1/2"></div>
</div>

<!-- Spinner -->
<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
```

### 2. **Form Layouts**

```html
<!-- Stacked form -->
<form class="space-y-6">
  <div class="space-y-2">
    <label class="text-sm font-medium">Email</label>
    <input
      class="w-full h-10 px-3 rounded-md border border-input bg-background"
    />
  </div>
  <div class="space-y-2">
    <label class="text-sm font-medium">Password</label>
    <input
      type="password"
      class="w-full h-10 px-3 rounded-md border border-input bg-background"
    />
  </div>
  <button
    class="w-full h-10 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
  >
    Submit
  </button>
</form>

<!-- Grid form -->
<form class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div class="space-y-2">
    <label class="text-sm font-medium">First Name</label>
    <input
      class="w-full h-10 px-3 rounded-md border border-input bg-background"
    />
  </div>
  <div class="space-y-2">
    <label class="text-sm font-medium">Last Name</label>
    <input
      class="w-full h-10 px-3 rounded-md border border-input bg-background"
    />
  </div>
  <div class="md:col-span-2">
    <button
      class="h-10 px-6 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
    >
      Submit
    </button>
  </div>
</form>
```

### 3. **Navigation Patterns**

```html
<!-- Header navigation -->
<nav class="border-b bg-background">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <div class="flex items-center">
        <img class="h-8 w-8" src="/logo.svg" alt="Logo" />
        <div class="hidden md:flex items-center space-x-8 ml-10">
          <a href="#" class="text-foreground hover:text-primary">Home</a>
          <a href="#" class="text-muted-foreground hover:text-foreground"
            >About</a
          >
          <a href="#" class="text-muted-foreground hover:text-foreground"
            >Contact</a
          >
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <button
          class="h-10 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Sign In
        </button>
      </div>
    </div>
  </div>
</nav>

<!-- Sidebar navigation -->
<aside class="w-64 bg-card border-r">
  <nav class="p-4 space-y-2">
    <a
      href="#"
      class="flex items-center space-x-3 p-2 rounded-md hover:bg-accent"
    >
      <Icon class="h-5 w-5" />
      <span>Dashboard</span>
    </a>
    <a
      href="#"
      class="flex items-center space-x-3 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
    >
      <Icon class="h-5 w-5" />
      <span>Settings</span>
    </a>
  </nav>
</aside>
```

### 4. **Card Layouts**

```html
<!-- Stats card -->
<div class="bg-card rounded-lg border p-6">
  <div class="flex items-center justify-between">
    <div>
      <p class="text-sm font-medium text-muted-foreground">Total Users</p>
      <p class="text-3xl font-bold">1,234</p>
    </div>
    <div
      class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"
    >
      <Icon class="h-6 w-6 text-primary" />
    </div>
  </div>
  <div class="mt-4 flex items-center text-sm">
    <span class="text-green-600 font-medium">+12%</span>
    <span class="text-muted-foreground ml-2">from last month</span>
  </div>
</div>

<!-- Content card -->
<article class="bg-card rounded-lg border overflow-hidden">
  <img class="w-full h-48 object-cover" src="/image.jpg" alt="Article" />
  <div class="p-6">
    <div class="flex items-center gap-2 text-sm text-muted-foreground mb-2">
      <time>Dec 15, 2024</time>
      <span>•</span>
      <span>5 min read</span>
    </div>
    <h3 class="text-xl font-semibold mb-2">Article Title</h3>
    <p class="text-muted-foreground mb-4">Article excerpt...</p>
    <a href="#" class="text-primary hover:underline font-medium"
      >Read more -></a
    >
  </div>
</article>
```

### 5. **Advanced Animations**

```html
<!-- Hover effects -->
<div class="transform transition-transform hover:scale-105 hover:shadow-lg">
  Hover to scale
</div>

<!-- Fade transitions -->
<div class="opacity-0 transition-opacity duration-300 hover:opacity-100">
  Fade on hover
</div>

<!-- Slide animations -->
<div
  class="transform translate-x-full transition-transform duration-300 ease-in-out data-[state=open]:translate-x-0"
>
  Slide animation
</div>

<!-- Custom keyframes (in globals.css) -->
<div class="animate-pulse">Pulsing element</div>
```

### 6. **Complex Grid Layouts**

```html
<!-- Dashboard grid -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
  <!-- Main content -->
  <div class="lg:col-span-8 space-y-6">
    <div class="bg-card p-6 rounded-lg border">Main content area</div>
  </div>

  <!-- Sidebar -->
  <div class="lg:col-span-4 space-y-6">
    <div class="bg-card p-6 rounded-lg border">Sidebar content</div>
  </div>
</div>

<!-- Masonry-like layout -->
<div class="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
  <div class="break-inside-avoid bg-card p-6 rounded-lg border">
    Card 1 content
  </div>
  <div class="break-inside-avoid bg-card p-6 rounded-lg border">
    Card 2 content (different height)
  </div>
</div>
```

---

## Troubleshooting

### Common Issues

#### 1. **Styles Not Applying**

```bash
# Check if Tailwind is scanning your files
# In tailwind.config.js, ensure content paths are correct:
content: [
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  './app/**/*.{js,ts,jsx,tsx,mdx}',
]
```

#### 2. **Dark Mode Not Working**

```html
<!-- Ensure dark class is on html element -->
<html class="dark">
  <!-- Content -->
</html>

<!-- Or use JavaScript to toggle -->
<script>
  document.documentElement.classList.toggle("dark")
</script>
```

#### 3. **Custom Colors Not Working**

```javascript
// In tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        "custom-blue": "#1e40af",
      },
    },
  },
}
```

#### 4. **Responsive Classes Not Working**

```html
<!-- Correct: Mobile-first approach -->
<div class="text-sm md:text-base lg:text-lg">
  Mobile: small, Tablet: base, Desktop: large
</div>

<!-- Wrong: Desktop-first won't work as expected -->
<div class="text-lg md:text-base sm:text-sm">This won't work correctly</div>
```

#### 5. **Z-index Issues**

```html
<!-- Use Tailwind's z-index scale -->
<div class="relative">
  <div class="absolute z-10">Above</div>
  <div class="absolute z-20">Even higher</div>
  <div class="absolute z-50">Modal level</div>
</div>
```

---

## Performance Tips

### 1. **Purge Unused Styles**

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Be specific about paths
  ],
  // This automatically removes unused styles in production
}
```

### 2. **Use JIT Mode**

```javascript
// JIT (Just-In-Time) is default in Tailwind v3+
// Benefits: Faster builds, smaller CSS files, on-demand generation
```

### 3. **Extract Components**

```tsx
// Instead of repeating long class strings
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-card text-card-foreground rounded-lg border shadow-sm ${className}`}
  >
    {children}
  </div>
)
```

---

## Debug Tools

### Browser DevTools

```html
<!-- Use data attributes for easier debugging -->
<div data-component="UserCard" class="bg-card p-4">User content</div>
```

### VS Code Extensions

- **Tailwind CSS IntelliSense**: Auto-completion and syntax highlighting
- **Headwind**: Sorts Tailwind classes automatically
- **Tailwind Docs**: Quick access to documentation

### Online Tools

- **Tailwind Play**: https://play.tailwindcss.com
- **Tailwind Builder**: Component builder with live preview
- **Color Palette Generator**: For custom color schemes

---

## Additional Resources

### Official Documentation

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind UI Components](https://tailwindui.com)

### Project-Specific Resources

- [shadcn/ui Components](https://ui.shadcn.com) - Our component design system
- [Tailwind Config](../tailwind.config.js) - Project configuration
- [Global Styles](../app/globals.css) - Base styles and CSS variables

---

## Quick Reference

### Animation Classes

```html
animate-pulse
<!-- Pulsing animation -->
animate-spin
<!-- Rotating animation -->
animate-bounce
<!-- Bouncing animation -->
transition-all
<!-- Smooth transitions -->
hover:scale-105
<!-- Scale on hover -->
hover:shadow-lg
<!-- Shadow on hover -->
```

### Layout Helpers

```html
container
<!-- Responsive container -->
mx-auto
<!-- Center horizontally -->
sr-only
<!-- Screen reader only -->
not-sr-only
<!-- Visible to screen readers -->
invisible
<!-- Hidden but takes space -->
```

### Interactive States

```html
hover:
<!-- Hover state -->
focus:
<!-- Focus state -->
active:
<!-- Active state -->
disabled:
<!-- Disabled state -->
group-hover:
<!-- Parent hover state -->
peer-focus:
<!-- Sibling focus state -->
```

---

**Back to basics:** [TAILWIND-CSS-GUIDE.md](TAILWIND-CSS-GUIDE.md)
