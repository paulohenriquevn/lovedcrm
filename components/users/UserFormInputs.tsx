import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// Full name input component
export function FullNameInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}): JSX.Element {
  return (
    <div>
      <Label htmlFor="fullName">Nome completo</Label>
      <Input id="fullName" type="text" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

// Phone input component
export function PhoneInput({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}): JSX.Element {
  return (
    <div>
      <Label htmlFor="phone">Telefone</Label>
      <Input id="phone" type="tel" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  )
}
