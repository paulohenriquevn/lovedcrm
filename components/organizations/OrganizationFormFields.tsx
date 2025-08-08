import { Globe, Building } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Organization } from '@/types/organization'

interface FormFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabled: boolean
  icon?: React.ReactNode
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  icon,
}: FormFieldProps): JSX.Element {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">
        {icon !== null && icon !== undefined ? (
          <span className="inline-flex items-center mr-2">{icon}</span>
        ) : null}
        {label}
      </Label>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  )
}

interface TextareaFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabled: boolean
  rows?: number
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  rows = 3,
}: TextareaFieldProps): JSX.Element {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <Textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
      />
    </div>
  )
}

interface OrganizationNameFieldProps {
  value: string
  onChange: (value: string) => void
  disabled: boolean
}

export function OrganizationNameField({
  value,
  onChange,
  disabled,
}: OrganizationNameFieldProps): JSX.Element {
  return (
    <FormField
      label="Nome da Organização"
      value={value}
      onChange={onChange}
      placeholder="Digite o nome da organização"
      disabled={disabled}
      icon={<Building className="h-4 w-4" />}
    />
  )
}

interface OrganizationDescriptionFieldProps {
  value: string
  onChange: (value: string) => void
  disabled: boolean
}

export function OrganizationDescriptionField({
  value,
  onChange,
  disabled,
}: OrganizationDescriptionFieldProps): JSX.Element {
  return (
    <TextareaField
      label="Descrição"
      value={value}
      onChange={onChange}
      placeholder="Descreva sua organização (opcional)"
      disabled={disabled}
      rows={3}
    />
  )
}

interface OrganizationWebsiteFieldProps {
  value: string
  onChange: (value: string) => void
  disabled: boolean
}

export function OrganizationWebsiteField({
  value,
  onChange,
  disabled,
}: OrganizationWebsiteFieldProps): JSX.Element {
  return (
    <FormField
      label="Website"
      value={value}
      onChange={onChange}
      placeholder="https://exemplo.com"
      disabled={disabled}
      icon={<Globe className="h-4 w-4" />}
    />
  )
}

interface OrganizationSlugFieldProps {
  organization: Organization
}

export function OrganizationSlugField({ organization }: OrganizationSlugFieldProps): JSX.Element {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">Identificador Único</Label>
      <div className="bg-muted flex items-center justify-between p-2 border border-border rounded-md">
        <span className="text-muted-foreground">{organization.slug}</span>
        <span className="text-xs text-muted-foreground ml-2">Somente leitura</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Este identificador é usado nas URLs e não pode ser alterado.
      </p>
    </div>
  )
}
