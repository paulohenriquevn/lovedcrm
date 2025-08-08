'use client'

import { Menu, Zap, ArrowRight } from 'lucide-react'
import Link, { LinkProps } from 'next/link'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps): JSX.Element {
  const router = useRouter()
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(String(href))
        onOpenChange?.(false)
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  )
}

const MobileMenuTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>((props, ref) => {
  return (
    <Button
      ref={ref}
      variant="ghost"
      className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
      {...props}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle Menu</span>
    </Button>
  )
})

MobileMenuTrigger.displayName = 'MobileMenuTrigger'

function MobileMenuContent({ setOpen }: { setOpen: (open: boolean) => void }): JSX.Element {
  const tAuth = useTranslations('auth')

  return (
    <>
      {/* Brand Header */}
      <MobileLink
        href="/"
        className="flex items-center mb-6 hover:opacity-80 transition-opacity"
        onOpenChange={setOpen}
      >
        <div className="h-8 w-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg">Loved CRM</span>
        <Badge className="ml-2 bg-violet-100 text-violet-700 border-violet-200 text-xs">BETA</Badge>
      </MobileLink>

      <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10">
        <div className="flex flex-col space-y-4 px-2">
          {/* Navigation Links */}
          <div className="space-y-3">
            <MobileLink
              href="#funcionalidades"
              onOpenChange={setOpen}
              className="block py-2 px-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
            >
              Funcionalidades
            </MobileLink>
            <MobileLink
              href="#precos"
              onOpenChange={setOpen}
              className="block py-2 px-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
            >
              Preços
            </MobileLink>
            <MobileLink
              href="#depoimentos"
              onOpenChange={setOpen}
              className="block py-2 px-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
            >
              Depoimentos
            </MobileLink>
            <MobileLink
              href="#faq"
              onOpenChange={setOpen}
              className="block py-2 px-3 text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
            >
              FAQ
            </MobileLink>
          </div>

          {/* Divider */}
          <hr className="border-border my-4" />

          {/* CTA Buttons */}
          <div className="flex flex-col space-y-3 px-2">
            <MobileLink href="/auth/login" onOpenChange={setOpen}>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-primary hover:bg-muted"
              >
                {tAuth('login.title')}
              </Button>
            </MobileLink>
            <MobileLink href="/auth/register" onOpenChange={setOpen}>
              <Button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                {tAuth('register.title')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </MobileLink>
          </div>
        </div>
      </ScrollArea>
    </>
  )
}

export function MobileNav(): JSX.Element {
  const [open, setOpen] = React.useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <MobileMenuTrigger />
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 w-80">
        <MobileMenuContent setOpen={setOpen} />
      </SheetContent>
    </Sheet>
  )
}
