/**
 * Footer Data - Constants and configuration data
 * Extracted to reduce main component complexity
 */

import { Instagram, Linkedin, Youtube, Facebook, Twitter, Shield, Award } from 'lucide-react'

import type { FooterSection, SocialLink, Certification } from './footer-utils'

export const footerSections: FooterSection[] = [
  {
    title: 'Produto',
    links: [
      { label: 'Funcionalidades', href: '#features' },
      { label: 'Preços', href: '#pricing' },
      { label: 'Integrações', href: '/integracoes' },
      { label: 'API', href: '/developers' },
      { label: 'Roadmap', href: '/roadmap' },
      { label: 'Status', href: 'https://status.lovedcrm.com.br', external: true },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Centro de Ajuda', href: '/ajuda' },
      { label: 'Blog', href: '/blog' },
      { label: 'Casos de Sucesso', href: '/cases' },
      { label: 'Templates', href: '/templates' },
      { label: 'Webinars', href: '/webinars' },
      { label: 'Downloads', href: '/downloads' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre Nós', href: '/sobre' },
      { label: 'Carreiras', href: '/carreiras' },
      { label: 'Imprensa', href: '/imprensa' },
      { label: 'Parceiros', href: '/parceiros' },
      { label: 'Afiliados', href: '/afiliados' },
      { label: 'Contato', href: '/contato' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Termos de Uso', href: '/termos' },
      { label: 'Política de Privacidade', href: '/privacidade' },
      { label: 'LGPD', href: '/lgpd' },
      { label: 'Cookies', href: '/cookies' },
      { label: 'SLA', href: '/sla' },
      { label: 'Segurança', href: '/seguranca' },
    ],
  },
]

export const socialLinks: SocialLink[] = [
  {
    icon: Instagram,
    href: 'https://instagram.com/lovedcrm',
    label: 'Instagram',
    color: 'hover:text-pink-600',
  },
  {
    icon: Linkedin,
    href: 'https://linkedin.com/company/lovedcrm',
    label: 'LinkedIn',
    color: 'hover:text-blue-700',
  },
  {
    icon: Youtube,
    href: 'https://youtube.com/@lovedcrm',
    label: 'YouTube',
    color: 'hover:text-red-600',
  },
  {
    icon: Facebook,
    href: 'https://facebook.com/lovedcrm',
    label: 'Facebook',
    color: 'hover:text-blue-600',
  },
  {
    icon: Twitter,
    href: 'https://twitter.com/lovedcrm',
    label: 'Twitter',
    color: 'hover:text-blue-400',
  },
]

export const certifications: Certification[] = [
  { name: 'LGPD', description: 'Compliance total', icon: Shield },
  { name: 'ISO 27001', description: 'Segurança certificada', icon: Award },
  { name: 'SOC 2', description: 'Auditoria aprovada', icon: Shield },
]
