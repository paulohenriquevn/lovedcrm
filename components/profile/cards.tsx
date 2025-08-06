'use client'

import { Loader2, Save, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'

import { ProfileFormFields, PasswordFormFields, ProfileSelectField } from './form-fields'

import type {
  ProfileUser,
  ProfileFormHook,
  PasswordFormHook,
  ProfileFormData,
  PasswordFormData,
  PasswordVisibilityState,
  SelectOption,
} from '@/types/profile-forms'

// Submit button component
function SubmitButton({
  isLoading,
  loadingText,
  defaultText,
}: {
  isLoading: boolean
  loadingText: string
  defaultText: string
}): JSX.Element {
  return (
    <Button variant="default" size="default" type="submit" disabled={isLoading}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {defaultText}
        </>
      )}
    </Button>
  )
}

// Account information card (read-only)
export function AccountInfoCard({ user }: { user: ProfileUser }): JSX.Element {
  return (
    <Card className="w-full rounded-lg border bg-card text-card-foreground shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Informações da Conta
        </CardTitle>
        <CardDescription>
          Informações básicas da sua conta que não podem ser alteradas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="email-info" className="text-sm font-medium text-gray-500">
            Email
          </label>
          <div id="email-info" className="mt-1 text-sm text-gray-900">
            {user.email}
          </div>
        </div>
        <div>
          <label htmlFor="status-info" className="text-sm font-medium text-gray-500">
            Status da Conta
          </label>
          <div id="status-info" className="mt-1">
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
              Ativa
            </span>
            {user.is_email_verified === true && (
              <span className="ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                Email Verificado
              </span>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="member-since" className="text-sm font-medium text-gray-500">
            Membro desde
          </label>
          <div id="member-since" className="mt-1 text-sm text-gray-900">
            {new Date(user.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Profile form card
export function ProfileFormCard({
  form,
  isLoading,
  onSubmit,
  timezoneOptions,
  languageOptions,
}: {
  form: ProfileFormHook
  isLoading: boolean
  onSubmit: (data: ProfileFormData) => void
  timezoneOptions: SelectOption[]
  languageOptions: SelectOption[]
}): JSX.Element {
  return (
    <Card className="w-full rounded-lg border bg-card text-card-foreground shadow-sm">
      <CardHeader>
        <CardTitle>Informações Pessoais</CardTitle>
        <CardDescription>Atualize suas informações pessoais e preferências</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={e => void form.handleSubmit(onSubmit)(e)} className="space-y-4">
            <ProfileFormFields form={form} isLoading={isLoading} />
            <div className="grid grid-cols-2 gap-4">
              <ProfileSelectField
                form={form}
                name="timezone"
                label="Fuso Horário"
                placeholder="Selecione o fuso horário"
                options={timezoneOptions}
                isLoading={isLoading}
              />
              <ProfileSelectField
                form={form}
                name="language"
                label="Idioma"
                placeholder="Selecione o idioma"
                options={languageOptions}
                isLoading={isLoading}
              />
            </div>
            <SubmitButton
              isLoading={isLoading}
              loadingText="Salvando..."
              defaultText="Salvar Alterações"
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// Password change card
export function PasswordChangeCard({
  form,
  isLoading,
  passwordVisibility,
  onSubmit,
}: {
  form: PasswordFormHook
  isLoading: boolean
  passwordVisibility: PasswordVisibilityState
  onSubmit: (data: PasswordFormData) => void
}): JSX.Element {
  const passwordConfigs = {
    current: {
      name: 'currentPassword' as const,
      label: 'Senha Atual',
      placeholder: 'Digite sua senha atual',
    },
    new: {
      name: 'newPassword' as const,
      label: 'Nova Senha',
      placeholder: '8+ chars, A-Z, a-z, 0-9',
    },
    confirm: {
      name: 'confirmPassword' as const,
      label: 'Confirmar Nova Senha',
      placeholder: 'Confirme sua nova senha',
    },
  }

  return (
    <Card className="w-full rounded-lg border bg-card text-card-foreground shadow-sm">
      <CardHeader>
        <CardTitle>Alterar Senha</CardTitle>
        <CardDescription>Atualize sua senha para manter sua conta segura</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={e => void form.handleSubmit(onSubmit)(e)} className="space-y-4">
            <PasswordFormFields
              form={form}
              isLoading={isLoading}
              passwordVisibility={passwordVisibility}
              passwordConfigs={passwordConfigs}
            />
            <SubmitButton
              isLoading={isLoading}
              loadingText="Alterando Senha..."
              defaultText="Alterar Senha"
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
