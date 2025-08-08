/**
 * Section Loading States
 * Professional skeleton loaders for landing page sections
 */

'use client'

import { motion } from 'framer-motion'

import { Skeleton } from '@/components/ui/skeleton'

interface SectionLoadingProps {
  type?: 'hero' | 'features' | 'testimonials' | 'pricing' | 'faq'
  className?: string
}

interface SkeletonProps {
  className?: string
  variants: {
    hidden: { opacity: number }
    visible: {
      opacity: number
      transition: {
        duration: number
        staggerChildren: number
      }
    }
  }
  itemVariants: {
    hidden: { opacity: number; y: number }
    visible: { opacity: number; y: number }
  }
}

function HeroLoadingSkeleton({ className, variants, itemVariants }: SkeletonProps): JSX.Element {
  return (
    <motion.div
      className={`py-20 px-4 text-center ${className}`}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={itemVariants}>
          <Skeleton className="h-8 w-96 mx-auto mb-6" />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Skeleton className="h-16 w-full max-w-4xl mx-auto mb-6" />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Skeleton className="h-6 w-full max-w-3xl mx-auto mb-8" />
        </motion.div>

        <motion.div variants={itemVariants} className="flex gap-4 justify-center mb-12">
          <Skeleton className="h-14 w-48" />
          <Skeleton className="h-14 w-44" />
        </motion.div>

        <motion.div variants={itemVariants}>
          <Skeleton className="w-full max-w-5xl mx-auto aspect-[16/10]" />
        </motion.div>
      </div>
    </motion.div>
  )
}

function FeaturesLoadingSkeleton({
  className,
  variants,
  itemVariants,
}: SkeletonProps): JSX.Element {
  return (
    <motion.div
      className={`py-20 px-4 ${className}`}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={itemVariants} className="text-center mb-16">
          <Skeleton className="h-6 w-48 mx-auto mb-4" />
          <Skeleton className="h-12 w-96 mx-auto mb-6" />
          <Skeleton className="h-6 w-full max-w-3xl mx-auto" />
        </motion.div>

        <motion.div variants={variants} className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <motion.div key={i} variants={itemVariants}>
              <Skeleton className="h-80 w-full" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

function TestimonialsLoadingSkeleton({
  className,
  variants,
  itemVariants,
}: SkeletonProps): JSX.Element {
  return (
    <motion.div
      className={`py-20 px-4 ${className}`}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={itemVariants} className="text-center mb-16">
          <Skeleton className="h-6 w-48 mx-auto mb-4" />
          <Skeleton className="h-12 w-96 mx-auto mb-6" />
        </motion.div>

        <motion.div variants={variants} className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <motion.div key={i} variants={itemVariants}>
              <div className="p-6 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-4 mt-6">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

function PricingLoadingSkeleton({ className, variants, itemVariants }: SkeletonProps): JSX.Element {
  return (
    <motion.div
      className={`py-20 px-4 ${className}`}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={itemVariants} className="text-center mb-16">
          <Skeleton className="h-6 w-48 mx-auto mb-4" />
          <Skeleton className="h-12 w-96 mx-auto mb-6" />
        </motion.div>

        <motion.div variants={variants} className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <motion.div key={i} variants={itemVariants}>
              <div className="p-8 space-y-4 border rounded-lg">
                <Skeleton className="h-12 w-12 mx-auto" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-16 w-24 mx-auto" />
                <Skeleton className="h-12 w-full" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map(j => (
                    <Skeleton key={j} className="h-4 w-full" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

function DefaultLoadingSkeleton({ className, variants, itemVariants }: SkeletonProps): JSX.Element {
  return (
    <motion.div
      className={`py-20 px-4 ${className}`}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      <div className="max-w-7xl mx-auto">
        <motion.div variants={itemVariants}>
          <Skeleton className="h-64 w-full" />
        </motion.div>
      </div>
    </motion.div>
  )
}

export function SectionLoading({ type = 'features', className }: SectionLoadingProps): JSX.Element {
  const variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const commonProps = { className, variants, itemVariants }

  switch (type) {
    case 'hero': {
      return <HeroLoadingSkeleton {...commonProps} />
    }
    case 'features': {
      return <FeaturesLoadingSkeleton {...commonProps} />
    }
    case 'testimonials': {
      return <TestimonialsLoadingSkeleton {...commonProps} />
    }
    case 'pricing': {
      return <PricingLoadingSkeleton {...commonProps} />
    }
    default: {
      return <DefaultLoadingSkeleton {...commonProps} />
    }
  }
}

// Loading overlay for images
export function ImageLoading({ className }: { className?: string }): JSX.Element {
  return (
    <motion.div
      className={`absolute inset-0 flex items-center justify-center bg-muted/20 ${className}`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex space-x-2">
        <motion.div
          className="w-3 h-3 bg-primary rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0 }}
        />
        <motion.div
          className="w-3 h-3 bg-primary rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
        />
        <motion.div
          className="w-3 h-3 bg-primary rounded-full"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
        />
      </div>
    </motion.div>
  )
}
