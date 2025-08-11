/**
 * Hook for scroll-triggered animations
 * Provides viewport detection and animation variants for Framer Motion
 */

'use client'

import { useInView, type Variants } from 'framer-motion'
import { useRef } from 'react'

export function useScrollAnimation(once = true, margin = '-100px') {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin })

  return { ref, isInView }
}

// Animation variants for consistent scroll animations
export const scrollAnimationVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1], // Custom easing
    },
  },
}

// Stagger variants for multiple elements
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

// Hero specific animations
export type HeroAnimations = {
  badge: Variants
  title: Variants
  subtitle: Variants
  buttons: Variants
  trustIndicators: Variants
  mockup: Variants
}

export const heroAnimations: HeroAnimations = {
  badge: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
    },
  },
  title: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 },
    },
  },
  subtitle: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.4 },
    },
  },
  buttons: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1], delay: 0.6 },
    },
  },
  trustIndicators: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, delay: 0.8 },
    },
  },
  mockup: {
    hidden: { opacity: 0, scale: 0.9, y: 60 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 1.0 },
    },
  },
}

// Card hover animations
export const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  hover: {
    scale: 1.02,
    boxShadow: '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

// Enhanced button interaction variants
export const buttonPressVariants: Variants = {
  rest: {
    scale: 1,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  hover: {
    scale: 1.05,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  press: {
    scale: 0.95,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: {
      duration: 0.1,
      ease: [0.42, 0, 0.58, 1],
    },
  },
}

// Enhanced card hover variants with subtle animations
export const enhancedCardHoverVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    transition: {
      duration: 0.2,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

// Badge hover animation
export const badgeHoverVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.1,
    rotate: [0, -1, 1, 0],
    transition: {
      duration: 0.3,
      ease: [0.42, 0, 0.58, 1],
    },
  },
}

// Icon bounce animation
export const iconBounceVariants: Variants = {
  rest: { y: 0 },
  hover: {
    y: [0, -2, 0],
    transition: {
      duration: 0.4,
      repeat: Infinity,
      repeatType: 'loop' as const,
    },
  },
}

// Magnetic hover effect for interactive elements
export const magneticHoverVariants: Variants = {
  rest: { x: 0, y: 0 },
  hover: {
    x: [0, 1, -1, 0],
    y: [0, -0.5, 0.5, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatType: 'reverse' as const,
    },
  },
}
