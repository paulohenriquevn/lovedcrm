# Tailwind CSS Core Guide

> **Essential Tailwind CSS utilities and patterns for our Multi-Tenant SaaS project**

## **PRINCÍPIOS FUNDAMENTAIS - EXTREMAMENTE IMPORTANTES**

### **KISS, YAGNI, DRY - NUNCA QUEBRAR**

- **KISS (Keep It Simple, Stupid)**: **SEMPRE** escolher a solução mais simples que funciona
- **YAGNI (You Aren't Gonna Need It)**: **NUNCA** implementar funcionalidades "para o futuro"
- **DRY (Don't Repeat Yourself)**: **SEMPRE** reutilizar código existente antes de criar novo
- ** CRITICAL**: Quebrar estes princípios é considerado falha crítica no desenvolvimento

## Table of Contents

- [Overview](#overview)
- [Project Configuration](#project-configuration)
- [Core Concepts](#core-concepts)
- [Utility Classes Reference](#utility-classes-reference)
- [Responsive Design](#responsive-design)
- [Dark Mode](#dark-mode)
- [Color System](#color-system)
- [Layout & Flexbox](#layout--flexbox)
- [Spacing System](#spacing-system)
- [Typography](#typography)

> ** For advanced patterns**: See [TAILWIND-ADVANCED.md](TAILWIND-ADVANCED.md)

---

## Overview

**Tailwind CSS v3.4+** is a utility-first CSS framework that provides low-level utility classes to build custom designs directly in your markup.

### Key Benefits in Our Project

- **Zero Runtime**: CSS generated at build time
- **Component-First**: Perfect integration with shadcn/ui
- **Design System**: Consistent spacing, colors, and typography
- **Dark Mode**: Native theme switching support
- **Responsive**: Mobile-first breakpoint system
- **Customizable**: Extensive theme configuration
- **Performance**: Only used utilities are included

### Philosophy: Utility-First

```html
<!-- Traditional CSS approach -->
<div class="chat-notification">
  <div class="chat-notification-logo-wrapper">
    <img
      class="chat-notification-logo"
      src="/img/logo.svg"
      alt="ChitChat Logo"
    />
  </div>
  <div class="chat-notification-content">
    <h4 class="chat-notification-title">ChitChat</h4>
    <p class="chat-notification-message">You have a new message!</p>
  </div>
</div>

<!-- Tailwind utility-first approach -->
<div
  class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg flex items-center space-x-4"
>
  <div class="shrink-0">
    <img class="h-12 w-12" src="/img/logo.svg" alt="ChitChat Logo" />
  </div>
  <div>
    <div class="text-xl font-medium text-black">ChitChat</div>
    <p class="text-slate-500">You have a new message!</p>
  </div>
</div>
```

---

## Project Configuration

### Configuration (`tailwind.config.js`)

```javascript
const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./containers/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

### Global Styles (`app/globals.css`)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 84% 4.9%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 94.1%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

---

## Core Concepts

### 1. **Utility-First Approach**

Instead of writing custom CSS, compose designs using utility classes:

```html
<!-- Bad: Custom CSS -->
<div class="custom-card">Content</div>

<!-- Good: Utility classes -->
<div class="bg-white rounded-lg shadow-md p-6">Content</div>
```

### 2. **Mobile-First Responsive Design**

Tailwind uses a mobile-first approach where unprefixed utilities take effect on all screen sizes:

```html
<!-- Base: Mobile first, then larger screens -->
<div class="text-base md:text-lg lg:text-xl">Responsive text size</div>
```

### 3. **State Variants**

Handle different states with variant prefixes:

```html
<button
  class="bg-blue-500 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
>
  Interactive Button
</button>
```

---

## Utility Classes Reference

### Display Classes

```html
<!-- Block & Inline -->
<div class="block">Block element</div>
<span class="inline">Inline element</span>
<div class="inline-block">Inline-block element</div>

<!-- Flex -->
<div class="flex">Flexbox container</div>
<div class="inline-flex">Inline flexbox</div>

<!-- Grid -->
<div class="grid">Grid container</div>
<div class="inline-grid">Inline grid</div>

<!-- Hidden -->
<div class="hidden">Completely hidden</div>
<div class="sr-only">Screen reader only</div>
```

### Position Classes

```html
<!-- Static positioning (default) -->
<div class="static">Static positioning</div>

<!-- Relative positioning -->
<div class="relative">Relative positioning</div>

<!-- Absolute positioning -->
<div class="absolute top-0 left-0">Absolute positioning</div>

<!-- Fixed positioning -->
<div class="fixed top-4 right-4">Fixed positioning</div>

<!-- Sticky positioning -->
<div class="sticky top-0">Sticky positioning</div>
```

### Sizing Classes

```html
<!-- Width -->
<div class="w-1/2">50% width</div>
<div class="w-full">100% width</div>
<div class="w-screen">100vw width</div>
<div class="w-96">384px width (24rem)</div>

<!-- Height -->
<div class="h-64">256px height (16rem)</div>
<div class="h-screen">100vh height</div>
<div class="h-full">100% height</div>

<!-- Min/Max sizing -->
<div class="min-w-0 max-w-xs">Constrained width</div>
<div class="min-h-screen max-h-96">Constrained height</div>
```

---

## Responsive Design

### Breakpoint System

```javascript
// Tailwind breakpoints
sm: '640px',   // Small devices
md: '768px',   // Medium devices
lg: '1024px',  // Large devices
xl: '1280px',  // Extra large devices
2xl: '1536px'  // 2X large devices
```

### Mobile-First Examples

```html
<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Responsive text -->
<h1 class="text-2xl md:text-4xl lg:text-6xl font-bold">Responsive Heading</h1>

<!-- Responsive spacing -->
<div class="p-4 md:p-6 lg:p-8">Responsive padding</div>

<!-- Responsive visibility -->
<div class="hidden md:block">Hidden on mobile, visible on desktop</div>
```

---

## Dark Mode

### Implementation Strategy

Our project uses **class-based dark mode** with `next-themes`:

```typescript
// Theme toggle component
'use client'
import { useTheme } from 'next-themes'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      Toggle Theme
    </button>
  )
}
```

### Dark Mode Patterns

```html
<!-- Background colors -->
<div class="bg-white dark:bg-gray-900">
  <p class="text-gray-900 dark:text-gray-100">Content that adapts to theme</p>
</div>

<!-- Borders -->
<div class="border border-gray-200 dark:border-gray-700">
  Dark mode aware borders
</div>

<!-- Buttons -->
<button
  class="bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 dark:hover:bg-blue-700"
>
  Dark mode button
</button>

<!-- Images -->
<img class="block dark:hidden" src="/logo-light.png" alt="Light logo" />
<img class="hidden dark:block" src="/logo-dark.png" alt="Dark logo" />
```

### Dark Mode Best Practices

```html
<!--  Good: Consistent contrast -->
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  High contrast text
</div>

<!--  Good: Semantic colors -->
<div class="bg-background text-foreground">Uses CSS custom properties</div>

<!--  Avoid: Inconsistent theming -->
<div class="bg-white text-black dark:bg-gray-800">
  <!-- Missing dark text color -->
</div>
```

---

## Color System

### Default Color Palette

```html
<!-- Gray scale -->
<div class="bg-gray-50">Lightest gray</div>
<div class="bg-gray-100">Very light gray</div>
<div class="bg-gray-500">Medium gray</div>
<div class="bg-gray-900">Very dark gray</div>

<!-- Primary colors -->
<div class="bg-blue-500">Blue</div>
<div class="bg-red-500">Red</div>
<div class="bg-green-500">Green</div>
<div class="bg-yellow-500">Yellow</div>
<div class="bg-purple-500">Purple</div>
<div class="bg-pink-500">Pink</div>
<div class="bg-indigo-500">Indigo</div>
```

### Color Usage Patterns

```html
<!-- Text colors -->
<p class="text-gray-600">Muted text</p>
<p class="text-gray-900">Primary text</p>
<p class="text-blue-600">Link text</p>
<p class="text-red-600">Error text</p>
<p class="text-green-600">Success text</p>

<!-- Background colors -->
<div class="bg-blue-50 text-blue-900">Light blue background</div>
<div class="bg-red-50 text-red-900">Light red background</div>

<!-- Border colors -->
<div class="border border-gray-300">Default border</div>
<div class="border border-blue-300">Blue border</div>
```

### Project-Specific Color System

```html
<!-- CSS custom properties (preferred) -->
<div class="bg-background text-foreground">Uses theme colors</div>

<div class="bg-primary text-primary-foreground">Primary button style</div>

<div class="bg-secondary text-secondary-foreground">Secondary content</div>

<div class="bg-muted text-muted-foreground">Muted content</div>
```

---

## Layout & Flexbox

### Flexbox Fundamentals

```html
<!-- Flex container -->
<div class="flex">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Flex direction -->
<div class="flex flex-col">Vertical layout</div>
<div class="flex flex-row">Horizontal layout (default)</div>
<div class="flex flex-col-reverse">Reverse vertical</div>
<div class="flex flex-row-reverse">Reverse horizontal</div>
```

### Flex Alignment

```html
<!-- Justify content (main axis) -->
<div class="flex justify-start">Left aligned</div>
<div class="flex justify-center">Center aligned</div>
<div class="flex justify-end">Right aligned</div>
<div class="flex justify-between">Space between</div>
<div class="flex justify-around">Space around</div>

<!-- Align items (cross axis) -->
<div class="flex items-start">Top aligned</div>
<div class="flex items-center">Center aligned</div>
<div class="flex items-end">Bottom aligned</div>
<div class="flex items-stretch">Stretch to fill</div>
```

### Common Flex Patterns

```html
<!-- Centered content -->
<div class="flex items-center justify-center min-h-screen">
  <div>Perfectly centered</div>
</div>

<!-- Header layout -->
<header class="flex items-center justify-between p-4">
  <div class="flex items-center space-x-4">
    <img src="/logo.png" alt="Logo" class="h-8" />
    <h1 class="text-xl font-bold">Brand</h1>
  </div>
  <nav class="flex space-x-4">
    <a href="#" class="text-blue-600 hover:text-blue-800">Home</a>
    <a href="#" class="text-blue-600 hover:text-blue-800">About</a>
  </nav>
</header>

<!-- Card layout -->
<div class="flex flex-col space-y-4 p-6">
  <h2 class="text-lg font-semibold">Card Title</h2>
  <p class="text-gray-600 flex-1">Card content that grows</p>
  <div class="flex justify-end space-x-2">
    <button class="px-4 py-2 bg-gray-200 rounded">Cancel</button>
    <button class="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
  </div>
</div>
```

### CSS Grid

```html
<!-- Basic grid -->
<div class="grid grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>Responsive item</div>
</div>

<!-- Grid with different column sizes -->
<div class="grid grid-cols-4 gap-4">
  <div class="col-span-2">Takes 2 columns</div>
  <div>Takes 1 column</div>
  <div>Takes 1 column</div>
</div>
```

---

## Spacing System

### Spacing Scale

Tailwind uses a consistent spacing scale based on rem units:

```
0 = 0px
1 = 0.25rem = 4px
2 = 0.5rem = 8px
3 = 0.75rem = 12px
4 = 1rem = 16px
5 = 1.25rem = 20px
6 = 1.5rem = 24px
8 = 2rem = 32px
10 = 2.5rem = 40px
12 = 3rem = 48px
16 = 4rem = 64px
20 = 5rem = 80px
24 = 6rem = 96px
```

### Padding Classes

```html
<!-- All sides -->
<div class="p-4">Padding all sides</div>

<!-- Individual sides -->
<div class="pt-4">Padding top</div>
<div class="pr-4">Padding right</div>
<div class="pb-4">Padding bottom</div>
<div class="pl-4">Padding left</div>

<!-- Axis -->
<div class="px-4">Padding horizontal (left + right)</div>
<div class="py-4">Padding vertical (top + bottom)</div>
```

### Margin Classes

```html
<!-- All sides -->
<div class="m-4">Margin all sides</div>

<!-- Individual sides -->
<div class="mt-4">Margin top</div>
<div class="mr-4">Margin right</div>
<div class="mb-4">Margin bottom</div>
<div class="ml-4">Margin left</div>

<!-- Axis -->
<div class="mx-4">Margin horizontal</div>
<div class="my-4">Margin vertical</div>

<!-- Auto margins -->
<div class="mx-auto">Center with auto margins</div>
```

### Gap Classes (for Flex/Grid)

```html
<!-- Flex gap -->
<div class="flex gap-4">
  <div>Item with gap</div>
  <div>Item with gap</div>
</div>

<!-- Grid gap -->
<div class="grid grid-cols-2 gap-4">
  <div>Grid item</div>
  <div>Grid item</div>
</div>

<!-- Different axis gaps -->
<div class="grid grid-cols-2 gap-x-4 gap-y-8">
  <div>Different X and Y gaps</div>
</div>
```

---

## Typography

### Font Sizes

```html
<p class="text-xs">Extra small text (12px)</p>
<p class="text-sm">Small text (14px)</p>
<p class="text-base">Base text (16px)</p>
<p class="text-lg">Large text (18px)</p>
<p class="text-xl">Extra large text (20px)</p>
<p class="text-2xl">2X large text (24px)</p>
<p class="text-3xl">3X large text (30px)</p>
<p class="text-4xl">4X large text (36px)</p>
```

### Font Weights

```html
<p class="font-thin">Thin text (100)</p>
<p class="font-light">Light text (300)</p>
<p class="font-normal">Normal text (400)</p>
<p class="font-medium">Medium text (500)</p>
<p class="font-semibold">Semibold text (600)</p>
<p class="font-bold">Bold text (700)</p>
<p class="font-extrabold">Extra bold text (800)</p>
<p class="font-black">Black text (900)</p>
```

### Text Styling

```html
<!-- Text alignment -->
<p class="text-left">Left aligned</p>
<p class="text-center">Center aligned</p>
<p class="text-right">Right aligned</p>
<p class="text-justify">Justified text</p>

<!-- Text decoration -->
<p class="underline">Underlined text</p>
<p class="line-through">Strikethrough text</p>
<p class="no-underline">Remove underline</p>

<!-- Text transform -->
<p class="uppercase">UPPERCASE TEXT</p>
<p class="lowercase">lowercase text</p>
<p class="capitalize">Capitalize Text</p>

<!-- Line height -->
<p class="leading-tight">Tight line height</p>
<p class="leading-normal">Normal line height</p>
<p class="leading-relaxed">Relaxed line height</p>
```

### Typography Hierarchy

```html
<!-- Heading hierarchy -->
<h1 class="text-4xl font-bold text-gray-900 mb-4">Main Title</h1>
<h2 class="text-3xl font-semibold text-gray-800 mb-3">Section Title</h2>
<h3 class="text-2xl font-medium text-gray-700 mb-2">Subsection</h3>
<h4 class="text-xl font-medium text-gray-600 mb-2">Sub-subsection</h4>

<!-- Body text -->
<p class="text-base text-gray-600 leading-relaxed mb-4">
  Regular paragraph text with good readability.
</p>

<!-- Small text -->
<p class="text-sm text-gray-500">Supporting or secondary information.</p>
```

---

## Quick Reference

### Most Used Classes

```html
<!-- Layout -->
flex, grid, block, hidden flex-1, w-full, h-full items-center, justify-center,
justify-between

<!-- Spacing -->
p-4, py-2, px-4, m-4, mx-auto space-x-4, space-y-4, gap-4

<!-- Colors -->
bg-white, bg-gray-100, bg-primary text-gray-900, text-muted-foreground
border-gray-200, border-input

<!-- Typography -->
text-base, text-lg, text-xl font-medium, font-semibold, font-bold

<!-- Responsive -->
sm:text-lg, md:grid-cols-2, lg:px-8 hidden md:block, md:flex

<!-- Interactive -->
hover:bg-gray-100, focus:outline-none disabled:opacity-50, cursor-pointer
```

---

** Continue with advanced patterns:** [TAILWIND-ADVANCED.md](TAILWIND-ADVANCED.md)
