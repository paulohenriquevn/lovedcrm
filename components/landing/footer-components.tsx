/**
 * Footer Components - Extracted sub-components
 * Reduces main component complexity and improves maintainability
 */

'use client'

import { Heart, MapPin, Mail, Phone, Clock, ExternalLink, Globe, ArrowUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { socialLinks, certifications } from './footer-data'
import { scrollToTop, handleNewsletterSignup, type FooterSection } from './footer-utils'

interface FooterBrandSectionProps {
  socialLinks: typeof socialLinks
}

export function FooterBrandSection({ socialLinks }: FooterBrandSectionProps): JSX.Element {
  return (
    <div className="lg:col-span-2">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-primary rounded-lg flex items-center justify-center">
          <Heart className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <span className="text-xl font-bold text-white">Loved</span>
          <span className="text-xl font-bold text-primary">CRM</span>
        </div>
      </div>

      <p className="text-muted-foreground mb-6 leading-relaxed">
        O único CRM desenvolvido especificamente para agências digitais brasileiras. WhatsApp
        integrado, IA em português e pipeline otimizado para o mercado brasileiro.
      </p>

      {/* Contact Info */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="h-4 w-4 text-primary" />
          <span>São Paulo, SP - Brasil</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Phone className="h-4 w-4 text-primary" />
          <span>+55 (11) 9 9999-9999</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Mail className="h-4 w-4 text-primary" />
          <span>contato@lovedcrm.com.br</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Clock className="h-4 w-4 text-primary" />
          <span>Suporte: Seg-Sex 9h-18h (BRT)</span>
        </div>
      </div>

      {/* Social Links */}
      <div className="flex gap-3">
        {socialLinks.map(social => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`h-10 w-10 bg-muted rounded-lg flex items-center justify-center transition-colors ${social.color}`}
            aria-label={social.label}
          >
            <social.icon className="h-5 w-5" />
          </a>
        ))}
      </div>
    </div>
  )
}

interface FooterLinksGridProps {
  sections: FooterSection[]
}

export function FooterLinksGrid({ sections }: FooterLinksGridProps): JSX.Element {
  return (
    <>
      {sections.map(section => (
        <div key={section.title} className="lg:col-span-1">
          <h4 className="font-semibold text-white mb-4">{section.title}</h4>
          <ul className="space-y-3">
            {section.links.map(link => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={link.external === true ? '_blank' : undefined}
                  rel={link.external === true ? 'noopener noreferrer' : undefined}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                >
                  {link.label}
                  {link.external === true ? <ExternalLink className="h-3 w-3" /> : null}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  )
}

export function NewsletterSection(): JSX.Element {
  return (
    <Card className="bg-card border border-border shadow-sm mb-12">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Newsletter Exclusiva para Agências
            </h4>
            <p className="text-muted-foreground text-sm">
              Dicas semanais, cases de sucesso e novidades do CRM. Conteúdo exclusivo para gestores
              de agências digitais.
            </p>
          </div>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="seu.email@agencia.com.br"
              className="px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[250px]"
            />
            <Button onClick={handleNewsletterSignup}>Assinar</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface FooterBottomSectionProps {
  currentYear: number
}

export function FooterBottomSection({ currentYear }: FooterBottomSectionProps): JSX.Element {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
      {/* Left: Copyright & Brazil */}
      <div className="flex items-center gap-6">
        <div className="text-sm text-muted-foreground">
          © {currentYear} Loved CRM. Todos os direitos reservados.
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-6 bg-gradient-to-r from-green-500 via-yellow-500 to-blue-500 rounded-sm" />
          <span className="text-sm text-muted-foreground">
            Feito por{' '}
            <a
              href="https://www.linkedin.com/in/paulohenriquevn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 hover:text-violet-700 transition-colors underline"
            >
              paulohenriquevn
            </a>
          </span>
        </div>
      </div>

      {/* Center: Certifications */}
      <div className="flex items-center gap-4">
        {certifications.map(cert => (
          <div key={cert.name} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
            <cert.icon className="h-4 w-4 text-emerald-400" />
            <div>
              <div className="text-xs font-semibold text-white">{cert.name}</div>
              <div className="text-xs text-muted-foreground">{cert.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Right: Language & Back to Top */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Globe className="h-4 w-4" />
          <span>Português (BR)</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={scrollToTop}
          className="text-muted-foreground hover:text-primary"
        >
          <ArrowUp className="h-4 w-4 mr-1" />
          Topo
        </Button>
      </div>
    </div>
  )
}
