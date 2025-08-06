/**
 * Footer - Landing Page Loved CRM
 * Footer completo otimizado para agências digitais brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { 
  Heart,
  MapPin,
  Mail,
  Phone,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  MessageSquare,
  ExternalLink,
  Shield,
  Award,
  Globe,
  ArrowUp
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'


const footerSections = [
  {
    title: "Produto",
    links: [
      { label: "Funcionalidades", href: "#features" },
      { label: "Preços", href: "#pricing" },
      { label: "Integrações", href: "/integracoes" },
      { label: "API", href: "/developers" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "Status", href: "https://status.lovedcrm.com.br", external: true }
    ]
  },
  {
    title: "Recursos",
    links: [
      { label: "Centro de Ajuda", href: "/ajuda" },
      { label: "Blog", href: "/blog" },
      { label: "Casos de Sucesso", href: "/cases" },
      { label: "Templates", href: "/templates" },
      { label: "Webinars", href: "/webinars" },
      { label: "Downloads", href: "/downloads" }
    ]
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre Nós", href: "/sobre" },
      { label: "Carreiras", href: "/carreiras" },
      { label: "Imprensa", href: "/imprensa" },
      { label: "Parceiros", href: "/parceiros" },
      { label: "Afiliados", href: "/afiliados" },
      { label: "Contato", href: "/contato" }
    ]
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de Uso", href: "/termos" },
      { label: "Política de Privacidade", href: "/privacidade" },
      { label: "LGPD", href: "/lgpd" },
      { label: "Cookies", href: "/cookies" },
      { label: "SLA", href: "/sla" },
      { label: "Segurança", href: "/seguranca" }
    ]
  }
]

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/lovedcrm", label: "Instagram", color: "hover:text-pink-600" },
  { icon: Linkedin, href: "https://linkedin.com/company/lovedcrm", label: "LinkedIn", color: "hover:text-blue-700" },
  { icon: Youtube, href: "https://youtube.com/@lovedcrm", label: "YouTube", color: "hover:text-red-600" },
  { icon: Facebook, href: "https://facebook.com/lovedcrm", label: "Facebook", color: "hover:text-blue-600" },
  { icon: Twitter, href: "https://twitter.com/lovedcrm", label: "Twitter", color: "hover:text-blue-400" }
]

const certifications = [
  { name: "LGPD", description: "Compliance total", icon: Shield },
  { name: "ISO 27001", description: "Segurança certificada", icon: Award },
  { name: "SOC 2", description: "Auditoria aprovada", icon: Shield }
]

declare global {
  function gtag(...args: any[]): void
}

export function Footer() {
  const currentYear = new Date().getFullYear()

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleNewsletterSignup = () => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'newsletter_signup', { source: 'footer' })
    }
  }

  return (
    <footer className="bg-background text-foreground">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="grid lg:grid-cols-6 gap-8 mb-12">
          
          {/* Brand Section */}
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
              O único CRM desenvolvido especificamente para agências digitais brasileiras. 
              WhatsApp integrado, IA em português e pipeline otimizado para o mercado brasileiro.
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
              {socialLinks.map((social, index) => (
                <a
                  key={index}
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

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="lg:col-span-1">
              <h4 className="font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      {link.label}
                      {link.external ? <ExternalLink className="h-3 w-3" /> : null}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <Card className="bg-card border border-border shadow-sm mb-12">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Newsletter Exclusiva para Agências
                </h4>
                <p className="text-muted-foreground text-sm">
                  Dicas semanais, cases de sucesso e novidades do CRM. 
                  Conteúdo exclusivo para gestores de agências digitais.
                </p>
              </div>
              <div className="flex gap-3">
                <input
                  type="email"
                  placeholder="seu.email@agencia.com.br"
                  className="px-4 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-w-[250px]"
                />
                <Button onClick={handleNewsletterSignup}>
                  Assinar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="mb-8 bg-muted" />

        {/* Bottom Section */}
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
            {certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
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

      </div>
    </footer>
  )
}