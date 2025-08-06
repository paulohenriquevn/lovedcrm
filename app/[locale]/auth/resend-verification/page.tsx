'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { authService } from '@/services/auth'

const resendFormSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
})

type ResendFormData = z.infer<typeof resendFormSchema>

// Success state component
function EmailSentState(): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl">Email Enviado!</CardTitle>
          <CardDescription>
            Se o email existir e não estiver verificado, você receberá um link de verificação.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-3">
            <Link href="/auth/login">
              <Button className="w-full">Ir para Login</Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Voltar ao Início
              </Button>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            Não esquece de verificar sua caixa de spam!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Resend form component
function ResendForm({
  form,
  onSubmit,
  isLoading,
}: {
  form: ReturnType<typeof useForm<ResendFormData>>
  onSubmit: (data: ResendFormData) => Promise<void>
  isLoading: boolean
}): JSX.Element {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/20">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Mail className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl">Reenviar Verificação</CardTitle>
          <CardDescription>
            Digite seu email para receber um novo link de verificação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={e => void form.handleSubmit(onSubmit)(e)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Reenviar Verificação
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <Link href="/auth/login" className="font-medium text-primary hover:underline">
              Voltar para Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResendVerificationPage(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()

  const form = useForm<ResendFormData>({
    resolver: zodResolver(resendFormSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ResendFormData): Promise<void> => {
    setIsLoading(true)

    try {
      await authService.resendVerification(data.email)

      setEmailSent(true)
      toast({
        title: 'Email enviado!',
        description: 'Se o email existir, você receberá um link de verificação.',
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao enviar email'
      toast({
        title: 'Erro ao enviar email',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return <EmailSentState />
  }

  return <ResendForm form={form} onSubmit={onSubmit} isLoading={isLoading} />
}
