# shadcn/ui - Complete LLM-Friendly Documentation

**IMPORTANTE:** Seja EXTREMAMENTE HONESTO SEMPRE em relação à situação do projeto. Nunca inicie algo antes de ter 95% de certeza. Não faça nenhuma alteração antes que você tenha 95% de confiança sobre o que deve ser construído. Faça perguntas até ter certeza absoluta.

> **Ultimate reference guide for shadcn/ui components in our Multi-Tenant SaaS project**

## Table of Contents

- [Overview](#overview)
- [Project Integration](#project-integration)
- [Installation & Setup](#installation--setup)
- [Component Categories](#component-categories)
- [Core Components](#core-components)
- [Layout Components](#layout-components)
- [Form Components](#form-components)
- [Navigation Components](#navigation-components)
- [Feedback Components](#feedback-components)
- [Data Display Components](#data-display-components)
- [Utility Components](#utility-components)
- [Advanced Components](#advanced-components)
- [Theming & Customization](#theming--customization)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## Overview

**shadcn/ui** is a collection of beautiful, accessible, and customizable React components built on top of **Radix UI** and styled with **Tailwind CSS**. It's not a traditional component library but rather copy-and-paste components that you own and control.

### Key Features

- **Copy & Paste**: Own your components, not installed as dependencies
- **Accessible**: Built on Radix UI primitives with WAI-ARIA compliance
- **Customizable**: Full control over styling and behavior
- **TypeScript**: Written in TypeScript with full type safety
- **Tailwind CSS**: Styled with utility classes
- **Dark Mode**: Native dark mode support
- **React Server Components**: Compatible with Next.js App Router

### Philosophy

Unlike traditional libraries, shadcn/ui provides:

- **Source Code**: Copy exact implementation to your project
- **Full Control**: Modify components to fit your needs
- **No Dependencies**: Avoid version conflicts and bundle bloat
- **Consistency**: Unified design system across components

---

## Project Integration

### Current Setup in Our Project

```bash
# Our project structure
components/
├── ui/                    # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── select.tsx
│   └── ...
├── forms/                 # Custom form components
├── layout/                # Layout components
└── providers/             # Context providers
```

### Configuration Files

```json
// components.json - shadcn/ui configuration
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Integration with Our Stack

- **Next.js App Router**: Server Components support
- **TypeScript**: Full type safety
- **Tailwind CSS**: Semantic color system
- **Multi-tenancy**: Organization-aware components
- **Dark Mode**: Theme switching capability
- **i18n**: Internationalization ready

---

## Installation & Setup

### CLI Installation

```bash
# Install shadcn/ui CLI
npx shadcn@latest init

# Add individual components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input

# Add multiple components
npx shadcn@latest add button card input select dialog
```

### Manual Installation

```bash
# Install dependencies
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react

# Install Tailwind CSS plugins
npm install tailwindcss-animate
```

### Utils Setup

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

---

## Component Categories

### 1. **Core Components**

Essential UI elements for basic interactions:

- Button, Badge, Avatar, Separator

### 2. **Layout Components**

Structure and organization:

- Card, Sheet, Dialog, Tabs, Accordion

### 3. **Form Components**

Input and data collection:

- Input, Textarea, Select, Checkbox, Radio Group, Switch, Form

### 4. **Navigation Components**

User navigation and orientation:

- Navigation Menu, Breadcrumb, Menubar, Pagination, Sidebar

### 5. **Feedback Components**

User feedback and notifications:

- Alert, Sonner (Toast), Progress, Skeleton

### 6. **Data Display Components**

Information presentation:

- Table, Data Table, Calendar, Chart

### 7. **Utility Components**

Supporting functionality:

- Aspect Ratio, Scroll Area, Resizable, Command

### 8. **Advanced Components**

Complex interactions:

- Combobox, Date Picker, Carousel, Drawer

---

## Core Components

### Button

**Purpose**: Displays a button or a component that looks like a button

**Installation**: `npx shadcn@latest add button`

```tsx
import { Button } from "@/components/ui/button"

// Basic usage
<Button>Click me</Button>

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"></Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>

// With icons
<Button>
  <Mail className="mr-2 h-4 w-4" />
  Login with Email
</Button>

// As child (polymorphic)
<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
```

**API Reference**:

```typescript
interface ButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
  className?: string
  disabled?: boolean
  loading?: boolean
}
```

### Badge

**Purpose**: Displays a badge or a component that looks like a badge

**Installation**: `npx shadcn@latest add badge`

```tsx
import { Badge } from "@/components/ui/badge"

// Basic usage
<Badge>New</Badge>

// Variants
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>

// Custom styling
<Badge className="bg-green-100 text-green-800">Success</Badge>

// With icons
<Badge>
  <Check className="w-3 h-3 mr-1" />
  Verified
</Badge>

// Usage in our project (role badges)
<Badge variant={badgeVariants.owner}>Owner</Badge>
<Badge variant={badgeVariants.admin}>Admin</Badge>
<Badge variant={badgeVariants.member}>Member</Badge>
```

### Avatar

**Purpose**: An image element with a fallback for representing the user

**Installation**: `npx shadcn@latest add avatar`

```tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Basic usage
<Avatar>
  <AvatarImage src="/avatars/01.png" alt="@shadcn" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>

// Different sizes
<Avatar className="h-8 w-8">
  <AvatarImage src="/avatars/01.png" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>

<Avatar className="h-12 w-12">
  <AvatarImage src="/avatars/01.png" />
  <AvatarFallback>CN</AvatarFallback>
</Avatar>

// Stacked avatars
<div className="flex -space-x-2">
  <Avatar className="border-2 border-background">
    <AvatarImage src="/avatars/01.png" />
    <AvatarFallback>CN</AvatarFallback>
  </Avatar>
  <Avatar className="border-2 border-background">
    <AvatarImage src="/avatars/02.png" />
    <AvatarFallback>JD</AvatarFallback>
  </Avatar>
</div>

// Usage in our project
<Avatar className={componentSizes.avatar.md}>
  <AvatarImage src={user.avatar} alt={user.name} />
  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
</Avatar>
```

### Separator

**Purpose**: Visually or semantically separates content

**Installation**: `npx shadcn@latest add separator`

```tsx
import { Separator } from "@/components/ui/separator"

// Horizontal separator
;<div>
  <div className="space-y-1">
    <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
    <p className="text-sm text-muted-foreground">
      An open-source UI component library.
    </p>
  </div>
  <Separator className="my-4" />
  <div className="flex h-5 items-center space-x-4 text-sm">
    <div>Blog</div>
    <Separator orientation="vertical" />
    <div>Docs</div>
    <Separator orientation="vertical" />
    <div>Source</div>
  </div>
</div>
```

---

## Layout Components

### Card

**Purpose**: Displays a card with header, content, and footer

**Installation**: `npx shadcn@latest add card`

```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Basic usage
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card Description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card Content</p>
  </CardContent>
  <CardFooter>
    <p>Card Footer</p>
  </CardFooter>
</Card>

// Stats card pattern (used in our project)
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
    <DollarSign className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$45,231.89</div>
    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
  </CardContent>
</Card>

// Settings card pattern
<Card>
  <CardHeader>
    <CardTitle>Notifications</CardTitle>
    <CardDescription>
      Configure how you receive notifications.
    </CardDescription>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* Form content */}
  </CardContent>
  <CardFooter className="border-t px-6 py-4">
    <Button>Save preferences</Button>
  </CardFooter>
</Card>
```

### Dialog

**Purpose**: A window overlaid on either the primary window or another dialog window

**Installation**: `npx shadcn@latest add dialog`

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Basic usage
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Edit Profile</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input id="name" value="Pedro Duarte" className="col-span-3" />
      </div>
    </div>
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Confirmation dialog pattern
<Dialog>
  <DialogTrigger asChild>
    <Button variant="destructive">Delete Account</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you absolutely sure?</DialogTitle>
      <DialogDescription>
        This action cannot be undone. This will permanently delete your
        account and remove your data from our servers.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Usage in our project (organization member invite)
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button>Invite Team Member</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Invite Team Member</DialogTitle>
      <DialogDescription>
        Send an invitation to join your organization.
      </DialogDescription>
    </DialogHeader>
    <InviteUserForm onSuccess={() => setIsOpen(false)} />
  </DialogContent>
</Dialog>
```

### Sheet

**Purpose**: Extends the Dialog component to display content that complements the main content of the screen

**Installation**: `npx shadcn@latest add sheet`

```tsx
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

// Basic usage
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline">Open</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Edit profile</SheetTitle>
      <SheetDescription>
        Make changes to your profile here. Click save when you're done.
      </SheetDescription>
    </SheetHeader>
    <div className="grid gap-4 py-4">
      {/* Content */}
    </div>
  </SheetContent>
</Sheet>

// Different sides
<Sheet>
  <SheetTrigger>Open Left</SheetTrigger>
  <SheetContent side="left">
    {/* Content */}
  </SheetContent>
</Sheet>

<Sheet>
  <SheetTrigger>Open Right</SheetTrigger>
  <SheetContent side="right">
    {/* Content */}
  </SheetContent>
</Sheet>

// Custom sizes
<Sheet>
  <SheetTrigger>Open Large</SheetTrigger>
  <SheetContent className="w-[400px] sm:w-[540px]">
    {/* Content */}
  </SheetContent>
</Sheet>

// Usage in our project (mobile menu)
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="md:hidden">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="left" className="w-64">
    <nav className="space-y-4">
      {navigationItems.map((item) => (
        <a key={item.href} href={item.href} className="block py-2">
          {item.label}
        </a>
      ))}
    </nav>
  </SheetContent>
</Sheet>
```

### Tabs

**Purpose**: A set of layered sections of content—known as tab panels—that are displayed one at a time

**Installation**: `npx shadcn@latest add tabs`

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Basic usage
<Tabs defaultValue="account" className="w-[400px]">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>
          Make changes to your account here. Click save when you're done.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input id="name" defaultValue="Pedro Duarte" />
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save changes</Button>
      </CardFooter>
    </Card>
  </TabsContent>
  <TabsContent value="password">
    <Card>
      <CardHeader>
        <CardTitle>Password</CardTitle>
        <CardDescription>
          Change your password here. After saving, you'll be logged out.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="current">Current password</Label>
          <Input id="current" type="password" />
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save password</Button>
      </CardFooter>
    </Card>
  </TabsContent>
</Tabs>

// Vertical tabs
<Tabs defaultValue="account" orientation="vertical">
  <TabsList className="grid w-full grid-rows-2">
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  {/* Content */}
</Tabs>

// Usage in our project (settings navigation)
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList className="grid w-full grid-cols-3">
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="team">Team</TabsTrigger>
    <TabsTrigger value="billing">Billing</TabsTrigger>
  </TabsList>
  <TabsContent value="general">
    <GeneralSettings />
  </TabsContent>
  <TabsContent value="team">
    <TeamSettings />
  </TabsContent>
  <TabsContent value="billing">
    <BillingSettings />
  </TabsContent>
</Tabs>
```

### Accordion

**Purpose**: A vertically stacked set of interactive headings that each reveal a section of content

**Installation**: `npx shadcn@latest add accordion`

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Basic usage (single collapsible)
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>
      Yes. It comes with default styles that matches the other components.
    </AccordionContent>
  </AccordionItem>
</Accordion>

// Multiple expandable
<Accordion type="multiple">
  <AccordionItem value="item-1">
    <AccordionTrigger>Can I expand multiple items?</AccordionTrigger>
    <AccordionContent>
      Yes, when type is set to "multiple".
    </AccordionContent>
  </AccordionItem>
</Accordion>

// Usage in our project (FAQ section)
<Accordion type="single" collapsible className="w-full">
  {faqs.map((faq, index) => (
    <AccordionItem key={index} value={`item-${index}`}>
      <AccordionTrigger>{faq.question}</AccordionTrigger>
      <AccordionContent>{faq.answer}</AccordionContent>
    </AccordionItem>
  ))}
</Accordion>
```

---

## Form Components

### Input

**Purpose**: Displays a form input field or a component that looks like an input field

**Installation**: `npx shadcn@latest add input`

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Basic usage
<Input />
<Input type="email" placeholder="Email" />

// With label
<div className="grid w-full max-w-sm items-center gap-1.5">
  <Label htmlFor="email">Email</Label>
  <Input type="email" id="email" placeholder="Email" />
</div>

// Different types
<Input type="password" placeholder="Password" />
<Input type="file" />
<Input type="search" placeholder="Search..." />

// Disabled state
<Input disabled placeholder="Disabled input" />

// With button
<div className="flex w-full max-w-sm items-center space-x-2">
  <Input type="email" placeholder="Email" />
  <Button type="submit">Subscribe</Button>
</div>

// Usage in our project (with form validation)
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input placeholder="Enter your email" {...field} />
      </FormControl>
      <FormDescription>We'll never share your email.</FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

// Custom styling with shadcn/ui
<Input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2" />
```

### Textarea

**Purpose**: Displays a form textarea or a component that looks like a textarea

**Installation**: `npx shadcn@latest add textarea`

```tsx
import { Textarea } from "@/components/ui/textarea"

// Basic usage
<Textarea />
<Textarea placeholder="Type your message here." />

// With label
<div className="grid w-full gap-1.5">
  <Label htmlFor="message">Your message</Label>
  <Textarea placeholder="Type your message here." id="message" />
</div>

// Disabled state
<Textarea disabled placeholder="Disabled textarea" />

// Custom rows
<Textarea placeholder="Type your message here." rows={4} />

// Usage in our project
<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Description</FormLabel>
      <FormControl>
        <Textarea
          placeholder="Tell us about your organization"
          className="resize-none"
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Select

**Purpose**: Displays a list of options for the user to pick from—triggered by a button

**Installation**: `npx shadcn@latest add select`

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Basic usage
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apple">Apple</SelectItem>
    <SelectItem value="banana">Banana</SelectItem>
    <SelectItem value="blueberry">Blueberry</SelectItem>
  </SelectContent>
</Select>

// With groups
<Select>
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="Select a timezone" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>North America</SelectLabel>
      <SelectItem value="est">Eastern Standard Time (EST)</SelectItem>
      <SelectItem value="cst">Central Standard Time (CST)</SelectItem>
    </SelectGroup>
    <SelectGroup>
      <SelectLabel>Europe</SelectLabel>
      <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
      <SelectItem value="cet">Central European Time (CET)</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>

// With form
<FormField
  control={form.control}
  name="role"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Role</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="member">Member</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>

// Usage in our project (role selector)
<Select value={selectedRole} onValueChange={setSelectedRole}>
  <SelectTrigger>
    <SelectValue placeholder="Select member role" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="admin">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4" />
        <span>Admin</span>
      </div>
    </SelectItem>
    <SelectItem value="member">
      <div className="flex items-center gap-2">
        <User className="h-4 w-4" />
        <span>Member</span>
      </div>
    </SelectItem>
  </SelectContent>
</Select>
```

### Checkbox

**Purpose**: A control that allows the user to toggle between checked and not checked

**Installation**: `npx shadcn@latest add checkbox`

```tsx
import { Checkbox } from "@/components/ui/checkbox"

// Basic usage
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label
    htmlFor="terms"
    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
  >
    Accept terms and conditions
  </label>
</div>

// With form
<FormField
  control={form.control}
  name="notifications"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>Email notifications</FormLabel>
        <FormDescription>
          Receive emails about your account activity.
        </FormDescription>
      </div>
    </FormItem>
  )}
/>

// Multiple checkboxes
const items = [
  { id: "recents", label: "Recents" },
  { id: "home", label: "Home" },
] as const

<FormField
  control={form.control}
  name="items"
  render={() => (
    <FormItem>
      <FormLabel>Select items</FormLabel>
      {items.map((item) => (
        <FormField
          key={item.id}
          control={form.control}
          name="items"
          render={({ field }) => {
            return (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value?.includes(item.id)}
                    onCheckedChange={(checked) => {
                      return checked
                        ? field.onChange([...field.value, item.id])
                        : field.onChange(
                            field.value?.filter(
                              (value) => value !== item.id
                            )
                          )
                    }}
                  />
                </FormControl>
                <FormLabel className="font-normal">
                  {item.label}
                </FormLabel>
              </FormItem>
            )
          }}
        />
      ))}
    </FormItem>
  )}
/>
```

### Switch

**Purpose**: A control that allows the user to toggle between checked and not checked

**Installation**: `npx shadcn@latest add switch`

```tsx
import { Switch } from "@/components/ui/switch"

// Basic usage
<div className="flex items-center space-x-2">
  <Switch id="airplane-mode" />
  <Label htmlFor="airplane-mode">Airplane Mode</Label>
</div>

// With form
<FormField
  control={form.control}
  name="marketing_emails"
  render={({ field }) => (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <FormLabel className="text-base">Marketing emails</FormLabel>
        <FormDescription>
          Receive emails about new products, features, and more.
        </FormDescription>
      </div>
      <FormControl>
        <Switch
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
    </FormItem>
  )}
/>

// Usage in our project (settings)
<div className="space-y-4">
  <div className="flex items-center justify-between">
    <div className="space-y-0.5">
      <Label className="text-base">Email Notifications</Label>
      <p className="text-sm text-muted-foreground">
        Receive email notifications for organization updates
      </p>
    </div>
    <Switch
      checked={emailNotifications}
      onCheckedChange={setEmailNotifications}
    />
  </div>
</div>
```

### Radio Group

**Purpose**: A set of checkable buttons—known as radio buttons—where no more than one of the buttons can be checked at a time

**Installation**: `npx shadcn@latest add radio-group`

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Basic usage
<RadioGroup defaultValue="option-one">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-one" id="option-one" />
    <Label htmlFor="option-one">Option One</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option-two" id="option-two" />
    <Label htmlFor="option-two">Option Two</Label>
  </div>
</RadioGroup>

// With form
<FormField
  control={form.control}
  name="type"
  render={({ field }) => (
    <FormItem className="space-y-3">
      <FormLabel>Notify me about...</FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={field.onChange}
          defaultValue={field.value}
          className="flex flex-col space-y-1"
        >
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="all" />
            </FormControl>
            <FormLabel className="font-normal">
              All new messages
            </FormLabel>
          </FormItem>
          <FormItem className="flex items-center space-x-3 space-y-0">
            <FormControl>
              <RadioGroupItem value="mentions" />
            </FormControl>
            <FormLabel className="font-normal">
              Direct messages and mentions
            </FormLabel>
          </FormItem>
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Form

**Purpose**: Forms with validation using React Hook Form and Zod

**Installation**: `npx shadcn@latest add form`

```tsx
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// Define schema
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

// Form component
function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="mail@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}

// Usage in our project (organization settings)
const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  description: z.string().optional(),
})

function OrganizationSettingsForm() {
  const form = useForm<z.infer<typeof organizationSchema>>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization?.name || "",
      description: organization?.description || "",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormDescription>
                Optional description for your organization
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Save changes"}
        </Button>
      </form>
    </Form>
  )
}
```

---

## Navigation Components

### Navigation Menu

**Purpose**: A collection of links for navigating websites

**Installation**: `npx shadcn@latest add navigation-menu`

```tsx
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu"

// Basic usage
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Getting started</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
          <li className="row-span-3">
            <NavigationMenuLink asChild>
              <a
                className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                href="/"
              >
                <div className="mb-2 mt-4 text-lg font-medium">
                  shadcn/ui
                </div>
                <p className="text-sm leading-tight text-muted-foreground">
                  Beautifully designed components built with Radix UI and
                  Tailwind CSS.
                </p>
              </a>
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>

// Usage in our project (main navigation)
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <Link href="/dashboard" legacyBehavior passHref>
        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
          Dashboard
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Team</NavigationMenuTrigger>
      <NavigationMenuContent>
        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
          <li>
            <NavigationMenuLink asChild>
              <Link href="/team" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                <div className="text-sm font-medium leading-none">Members</div>
                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                  Manage your team members and their roles
                </p>
              </Link>
            </NavigationMenuLink>
          </li>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>
```

### Breadcrumb

**Purpose**: Displays the path to the current resource using a hierarchy of links

**Installation**: `npx shadcn@latest add breadcrumb`

```tsx
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

// Basic usage
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/components">Components</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>

// With ellipsis
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbEllipsis />
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/docs/components">Components</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>

// Usage in our project
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/team">Team</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Members</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

### Pagination

**Purpose**: Navigation for paginated content

**Installation**: `npx shadcn@latest add pagination`

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Basic usage
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>
        2
      </PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>

// Usage in our project (data table pagination)
<div className="flex items-center justify-between px-2">
  <div className="flex-1 text-sm text-muted-foreground">
    {table.getFilteredSelectedRowModel().rows.length} of{" "}
    {table.getFilteredRowModel().rows.length} row(s) selected.
  </div>
  <div className="flex items-center space-x-6 lg:space-x-8">
    <div className="flex items-center space-x-2">
      <p className="text-sm font-medium">Rows per page</p>
      <Select
        value={`${table.getState().pagination.pageSize}`}
        onValueChange={(value) => {
          table.setPageSize(Number(value))
        }}
      >
        <SelectTrigger className="h-8 w-[70px]">
          <SelectValue placeholder={table.getState().pagination.pageSize} />
        </SelectTrigger>
        <SelectContent side="top">
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <SelectItem key={pageSize} value={`${pageSize}`}>
              {pageSize}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
      Page {table.getState().pagination.pageIndex + 1} of{" "}
      {table.getPageCount()}
    </div>
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        className="hidden h-8 w-8 p-0 lg:flex"
        onClick={() => table.setPageIndex(0)}
        disabled={!table.getCanPreviousPage()}
      >
        <span className="sr-only">Go to first page</span>
        <DoubleArrowLeftIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={() => table.previousPage()}
        disabled={!table.getCanPreviousPage()}
      >
        <span className="sr-only">Go to previous page</span>
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={() => table.nextPage()}
        disabled={!table.getCanNextPage()}
      >
        <span className="sr-only">Go to next page</span>
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        className="hidden h-8 w-8 p-0 lg:flex"
        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
        disabled={!table.getCanNextPage()}
      >
        <span className="sr-only">Go to last page</span>
        <DoubleArrowRightIcon className="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>
```

---

## Feedback Components

### Alert

**Purpose**: Displays a callout for user attention

**Installation**: `npx shadcn@latest add alert`

```tsx
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

// Basic usage
<Alert>
  <Terminal className="h-4 w-4" />
  <AlertTitle>Heads up!</AlertTitle>
  <AlertDescription>
    You can add components and dependencies to your app using the cli.
  </AlertDescription>
</Alert>

// Variants
<Alert variant="default">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Note</AlertTitle>
  <AlertDescription>This is a default alert.</AlertDescription>
</Alert>

<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Your session has expired. Please log in again.
  </AlertDescription>
</Alert>

// Usage in our project (form validation feedback)
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
)}

{success && (
  <Alert className="border-green-200 bg-green-50 text-green-800">
    <CheckCircle className="h-4 w-4" />
    <AlertTitle>Success</AlertTitle>
    <AlertDescription>Your changes have been saved.</AlertDescription>
  </Alert>
)}
```

### Sonner (Toast)

**Purpose**: A succinct message that is displayed temporarily

**Installation**: `npx shadcn@latest add sonner`

```tsx
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"

// Setup (add to layout)
;<Toaster />

// Basic usage
toast("Event has been created")

// With description
toast("Event has been created", {
  description: "Sunday, December 03, 2023 at 9:00 AM",
})

// With action
toast("Event has been created", {
  action: {
    label: "Undo",
    onClick: () => console.log("Undo"),
  },
})

// Different types
toast.success("Changes saved successfully")
toast.error("Something went wrong")
toast.warning("Warning message")
toast.info("Information message")

// Custom styling
toast("Custom message", {
  className: "my-classname",
  style: {
    background: "red",
  },
})

// Usage in our project
// Success toast
const handleSave = async () => {
  try {
    await saveSettings()
    toast.success("Settings saved", {
      description: "Your preferences have been updated",
    })
  } catch (error) {
    toast.error("Failed to save settings", {
      description: "Please try again later",
    })
  }
}

// Member invitation
const handleInvite = async (email: string) => {
  try {
    await inviteMember(email)
    toast.success("Invitation sent", {
      description: `Invited ${email} to join your organization`,
      action: {
        label: "View team",
        onClick: () => router.push("/team"),
      },
    })
  } catch (error) {
    toast.error("Failed to send invitation")
  }
}
```

### Progress

**Purpose**: Displays an indicator showing the completion progress of a task

**Installation**: `npx shadcn@latest add progress`

```tsx
import { Progress } from "@/components/ui/progress"

// Basic usage
<Progress value={33} />

// With label
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Progress</span>
    <span>33%</span>
  </div>
  <Progress value={33} />
</div>

// Different sizes
<Progress value={50} className="h-2" />
<Progress value={75} className="h-3" />

// Usage in our project (upload progress)
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Uploading {fileName}</span>
    <span>{uploadProgress}%</span>
  </div>
  <Progress value={uploadProgress} />
</div>

// Multi-step form progress
<div className="space-y-2">
  <div className="flex justify-between text-sm text-muted-foreground">
    <span>Step {currentStep} of {totalSteps}</span>
  </div>
  <Progress value={(currentStep / totalSteps) * 100} />
</div>
```

### Skeleton

**Purpose**: Use to show a placeholder while content is loading

**Installation**: `npx shadcn@latest add skeleton`

```tsx
import { Skeleton } from "@/components/ui/skeleton"

// Basic usage
<div className="flex items-center space-x-4">
  <Skeleton className="h-12 w-12 rounded-full" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
</div>

// Card skeleton
<div className="flex flex-col space-y-3">
  <Skeleton className="h-[125px] w-[250px] rounded-xl" />
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
</div>

// Usage in our project (loading states)
// Dashboard cards loading
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {Array.from({ length: 4 }).map((_, i) => (
    <Card key={i}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[120px] mb-2" />
        <Skeleton className="h-3 w-[160px]" />
      </CardContent>
    </Card>
  ))}
</div>

// Table loading
<div className="space-y-3">
  {Array.from({ length: 5 }).map((_, i) => (
    <div key={i} className="flex items-center space-x-4">
      <Skeleton className="h-8 w-8 rounded-full" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[100px]" />
      <Skeleton className="h-4 w-[80px]" />
    </div>
  ))}
</div>
```

---

## Data Display Components

### Table

**Purpose**: A responsive table component

**Installation**: `npx shadcn@latest add table`

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Basic usage
<Table>
  <TableCaption>A list of your recent invoices.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead className="w-[100px]">Invoice</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Method</TableHead>
      <TableHead className="text-right">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">INV001</TableCell>
      <TableCell>Paid</TableCell>
      <TableCell>Credit Card</TableCell>
      <TableCell className="text-right">$250.00</TableCell>
    </TableRow>
  </TableBody>
  <TableFooter>
    <TableRow>
      <TableCell colSpan={3}>Total</TableCell>
      <TableCell className="text-right">$2,500.00</TableCell>
    </TableRow>
  </TableFooter>
</Table>

// Usage in our project (team members table)
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Member</TableHead>
      <TableHead>Role</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Joined</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {members.map((member) => (
      <TableRow key={member.id}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={member.avatar} />
              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{member.name}</div>
              <div className="text-sm text-muted-foreground">{member.email}</div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={badgeVariants[member.role]}>
            {member.role}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge variant={member.active ? "default" : "secondary"}>
            {member.active ? "Active" : "Inactive"}
          </Badge>
        </TableCell>
        <TableCell>{format(new Date(member.createdAt), "MMM d, yyyy")}</TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => editMember(member.id)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => removeMember(member.id)}>
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Data Table

**Purpose**: Powerful table and datagrids built using TanStack Table

**Installation**: `npx shadcn@latest add data-table`

This is a more complex component that requires multiple steps. Here's a simplified version:

```tsx
"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

// Define columns
const columns: ColumnDef<Payment>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "amount",
    header: "Amount",
  },
]

// Usage
<DataTable columns={columns} data={data} />
```

---

## Utility Components

### Aspect Ratio

**Purpose**: Displays content within a desired ratio

**Installation**: `npx shadcn@latest add aspect-ratio`

```tsx
import { AspectRatio } from "@/components/ui/aspect-ratio"

// Basic usage
<div className="w-[450px]">
  <AspectRatio ratio={16 / 9}>
    <img
      src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd"
      alt="Photo by Drew Beamer"
      className="rounded-md object-cover"
    />
  </AspectRatio>
</div>

// Different ratios
<AspectRatio ratio={1 / 1}>
  {/* Square */}
</AspectRatio>

<AspectRatio ratio={4 / 3}>
  {/* 4:3 aspect ratio */}
</AspectRatio>

// Usage in our project (image uploads)
<AspectRatio ratio={16 / 9} className="bg-muted">
  {imageUrl ? (
    <img src={imageUrl} alt="Uploaded image" className="rounded-md object-cover" />
  ) : (
    <div className="flex items-center justify-center h-full">
      <ImageIcon className="h-12 w-12 text-muted-foreground" />
    </div>
  )}
</AspectRatio>
```

### Scroll Area

**Purpose**: Augments native scroll functionality for custom, cross-browser styling

**Installation**: `npx shadcn@latest add scroll-area`

```tsx
import { ScrollArea } from "@/components/ui/scroll-area"

// Basic usage
<ScrollArea className="h-72 w-48 rounded-md border">
  <div className="p-4">
    <h4 className="mb-4 text-sm font-medium leading-none">Tags</h4>
    {tags.map((tag) => (
      <div key={tag} className="text-sm">
        {tag}
      </div>
    ))}
  </div>
</ScrollArea>

// Horizontal scroll
<ScrollArea className="w-96 whitespace-nowrap rounded-md border">
  <div className="flex w-max space-x-4 p-4">
    {artworks.map((artwork) => (
      <figure key={artwork.artist} className="shrink-0">
        <div className="overflow-hidden rounded-md">
          <img
            src={artwork.art}
            alt={`Photo by ${artwork.artist}`}
            className="aspect-[3/4] h-fit w-fit object-cover"
            width={300}
            height={400}
          />
        </div>
        <figcaption className="pt-2 text-xs text-muted-foreground">
          Photo by{" "}
          <span className="font-semibold text-foreground">
            {artwork.artist}
          </span>
        </figcaption>
      </figure>
    ))}
  </div>
</ScrollArea>

// Usage in our project (sidebar navigation)
<ScrollArea className="flex-1">
  <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
    {navigationItems.map((item) => (
      <Link
        key={item.href}
        href={item.href}
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <item.icon className="h-4 w-4" />
        {item.title}
      </Link>
    ))}
  </nav>
</ScrollArea>
```

### Command

**Purpose**: Fast, composable, unstyled command menu for React

**Installation**: `npx shadcn@latest add command`

```tsx
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

// Basic usage
<Command>
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>
        <Calendar className="mr-2 h-4 w-4" />
        <span>Calendar</span>
      </CommandItem>
      <CommandItem>
        <Smile className="mr-2 h-4 w-4" />
        <span>Search Emoji</span>
      </CommandItem>
      <CommandItem>
        <Calculator className="mr-2 h-4 w-4" />
        <span>Calculator</span>
      </CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Settings">
      <CommandItem>
        <User className="mr-2 h-4 w-4" />
        <span>Profile</span>
        <CommandShortcut>⌘P</CommandShortcut>
      </CommandItem>
      <CommandItem>
        <CreditCard className="mr-2 h-4 w-4" />
        <span>Billing</span>
        <CommandShortcut>⌘B</CommandShortcut>
      </CommandItem>
      <CommandItem>
        <Settings className="mr-2 h-4 w-4" />
        <span>Settings</span>
        <CommandShortcut>⌘S</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>

// Usage in our project (search/command palette)
<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button
      variant="outline"
      className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
    >
      <Search className="mr-2 h-4 w-4" />
      Search...
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  </DialogTrigger>
  <DialogContent className="p-0">
    <Command>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => router.push('/team/invite')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Team Member
          </CommandItem>
          <CommandItem onSelect={() => router.push('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            Organization Settings
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => router.push('/dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => router.push('/team')}>
            <Users className="mr-2 h-4 w-4" />
            Team
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  </DialogContent>
</Dialog>
```

---

## Theming & Customization

### CSS Variables

Our project uses CSS variables for theming:

```css
/* app/globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 10% 3.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  /* ... dark theme values */
}
```

### Custom Components

You can customize any component by modifying its source:

```tsx
// components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Add custom variant
        success: "bg-green-600 text-white hover:bg-green-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // Add custom size
        xl: "h-12 rounded-lg px-10 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Creating Custom Components

```tsx
// components/ui/custom-card.tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const customCardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "",
        highlighted: "border-primary bg-primary/5",
        warning: "border-yellow-200 bg-yellow-50",
      },
      size: {
        default: "p-6",
        sm: "p-4",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface CustomCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof customCardVariants> {}

const CustomCard = React.forwardRef<HTMLDivElement, CustomCardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(customCardVariants({ variant, size, className }))}
      {...props}
    />
  )
)
CustomCard.displayName = "CustomCard"

export { CustomCard, customCardVariants }
```

---

## Best Practices

### 1. **Component Composition**

```tsx
//  Good: Compose complex components from primitives
const UserCard = ({ user }: { user: User }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <Badge variant={badgeVariants[user.role]}>{user.role}</Badge>
    </CardContent>
  </Card>
)

//  Avoid: Creating monolithic components
const UserCard = ({ user }) => (
  <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
    {/* All styling inline */}
  </div>
)
```

### 2. **Consistent Spacing**

```tsx
//  Good: Use consistent spacing with Tailwind classes
<div className="space-y-6">
  <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
  <div className="space-y-4">
    <FormField />
    <FormField />
  </div>
</div>

//  Avoid: Random spacing values
<div className="space-y-3">
  <h2 className="text-xl">Settings</h2>
  <div className="space-y-1.5">
    <FormField />
    <FormField />
  </div>
</div>
```

### 3. **Proper Error Handling**

```tsx
//  Good: Comprehensive error states
const UserForm = () => {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Settings</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
```

### 4. **Accessibility First**

```tsx
//  Good: Proper ARIA labels and semantic HTML
;<Dialog>
  <DialogTrigger asChild>
    <Button aria-label="Open user settings">
      <Settings className="h-4 w-4" />
      <span className="sr-only">Open settings</span>
    </Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>User Settings</DialogTitle>
      <DialogDescription>
        Manage your account preferences and privacy settings.
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>

//  Good: Focus management
const [open, setOpen] = useState(false)

useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      setOpen(open => !open)
    }
  }
  document.addEventListener("keydown", handleKeyDown)
  return () => document.removeEventListener("keydown", handleKeyDown)
}, [])
```

### 5. **Performance Optimization**

```tsx
//  Good: Lazy load heavy components
const DataTable = lazy(() => import("@/components/ui/data-table"))
const Chart = lazy(() => import("@/components/ui/chart"))

const Dashboard = () => (
  <div>
    <Suspense fallback={<Skeleton className="h-[400px]" />}>
      <DataTable />
    </Suspense>
    <Suspense fallback={<Skeleton className="h-[300px]" />}>
      <Chart />
    </Suspense>
  </div>
)

//  Good: Memoize expensive operations
const expensiveData = useMemo(() => {
  return processLargeDataset(rawData)
}, [rawData])

const columns = useMemo<ColumnDef<User>[]>(
  () => [
    {
      accessorKey: "name",
      header: "Name",
    },
    // ... other columns
  ],
  []
)
```

---

## Common Patterns

### 1. **Loading States**

```tsx
// Universal loading pattern
const LoadingCard = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-20 w-full" />
    </CardContent>
  </Card>
)

// Usage
{
  loading ? <LoadingCard /> : <UserCard user={user} />
}
```

### 2. **Form Validation**

```tsx
// Standard form pattern with validation
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "member"]),
})

const UserForm = () => {
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "member",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* More fields */}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### 3. **Data Display**

```tsx
// Stats cards pattern
const StatsCard = ({ title, value, change, icon: Icon }: StatsCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">
        <span className={cn(
          "font-medium",
          change >= 0 ? "text-green-600" : "text-red-600"
        )}>
          {change >= 0 ? "+" : ""}{change}%
        </span>
        {" "}from last month
      </p>
    </CardContent>
  </Card>
)

// Usage
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <StatsCard
    title="Total Revenue"
    value="$45,231.89"
    change={20.1}
    icon={DollarSign}
  />
  <StatsCard
    title="Subscriptions"
    value="+2350"
    change={180.1}
    icon={Users}
  />
</div>
```

### 4. **Confirmation Dialogs**

```tsx
// Reusable confirmation dialog
interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  confirmText?: string
  variant?: "default" | "destructive"
}

const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  variant = "default"
}: ConfirmDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          variant={variant}
          onClick={() => {
            onConfirm()
            onOpenChange(false)
          }}
        >
          {confirmText}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)

// Usage
<ConfirmDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  title="Delete User"
  description="Are you sure you want to delete this user? This action cannot be undone."
  onConfirm={() => deleteUser(userId)}
  confirmText="Delete"
  variant="destructive"
/>
```

---

## Troubleshooting

### Common Issues

#### 1. **Styles Not Applying**

```bash
# Make sure Tailwind is configured correctly
# Check tailwind.config.js includes shadcn components
content: [
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  // ...
]

# Ensure CSS variables are defined
# Check app/globals.css has the required variables
```

#### 2. **TypeScript Errors**

```bash
# Install required types
npm install @types/react @types/react-dom

# Make sure tsconfig.json includes proper paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

#### 3. **Component Not Found**

```bash
# Make sure component is installed
npx shadcn@latest add button

# Check import path
import { Button } from "@/components/ui/button" //
import { Button } from "shadcn/ui" //
```

#### 4. **Dark Mode Issues**

```tsx
// Make sure dark mode is configured in tailwind.config.js
module.exports = {
  darkMode: ["class"], //
  // or
  darkMode: "media", // System preference
}

// Ensure dark class is toggled on html element
document.documentElement.classList.toggle("dark")
```

### Debug Tips

1. **Use React DevTools**: Inspect component props and state
2. **Check Console**: Look for hydration mismatches
3. **Validate HTML**: Ensure semantic structure
4. **Test Accessibility**: Use screen readers and keyboard navigation
5. **Performance**: Use React Profiler for optimization

### Migration Guide

When updating shadcn/ui components:

```bash
# Check for updates
npx shadcn@latest diff

# Update specific component
npx shadcn@latest add button --overwrite

# Update all components
npx shadcn@latest add --all --overwrite
```

---

## Additional Resources

### Official Documentation

- [shadcn/ui Docs](https://ui.shadcn.com/)
- [Radix UI Primitives](https://radix-ui.com/primitives)
- [Tailwind CSS](https://tailwindcss.com/)

### Tools & Extensions

- [shadcn/ui CLI](https://ui.shadcn.com/docs/cli)
- [Radix UI VSCode Extension](https://marketplace.visualstudio.com/items?itemName=PuruVJ.vscode-radix-ui-snippets)
- [Component Preview](https://ui.shadcn.com/examples)

### Community Resources

- [shadcn/ui Examples](https://ui.shadcn.com/examples)
- [Community Components](https://github.com/shadcn-ui/ui/discussions)
- [Themes Gallery](https://ui.shadcn.com/themes)

---

## Quick Reference

### Installation Commands

```bash
# Install CLI
npx shadcn@latest init

# Add components
npx shadcn@latest add button card input select dialog form table

# Update components
npx shadcn@latest add button --overwrite
```

### Most Used Components

```tsx
// Essential imports
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
```

### Component Patterns

```tsx
// Button variants
<Button variant="default | destructive | outline | secondary | ghost | link" />

// Form field pattern
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// Card pattern
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

---

**Status: Complete Documentation**

Esta documentação abrangente cobre todos os componentes shadcn/ui disponíveis, suas APIs, padrões de uso, e integração específica com nosso projeto Multi-Tenant SaaS. Use como referência definitiva para desenvolvimento consistente e acessível.
