'use client'

import { Check, Copy, Shield, Smartphone } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { QRData } from '../hooks/useTwoFactorAuth'

interface SetupStepProps {
  onNext: () => void
  onClose: () => void
  isLoading: boolean
}

export function SetupStep({ onNext, onClose, isLoading }: SetupStepProps): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-4">
        <Shield className="h-16 w-16 text-blue-600 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold">Ativar Autenticação de Dois Fatores</h3>
          <p className="text-muted-foreground mt-2">
            Adicione uma camada extra de segurança à sua conta usando um aplicativo autenticador.
          </p>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Você vai precisar de:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Um aplicativo autenticador (Google Authenticator, Authy, etc.)</li>
          <li>• Acesso ao seu telefone</li>
        </ul>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="button" onClick={onNext} disabled={isLoading}>
          {isLoading ? 'Preparando...' : 'Continuar'}
        </Button>
      </div>
    </div>
  )
}

interface QRCodeStepProps {
  qrData: QRData | null
  secretCopied: boolean
  onCopySecret: () => void
  onNext: () => void
  onClose: () => void
  isLoading: boolean
}

export function QRCodeStep({
  qrData,
  secretCopied,
  onCopySecret,
  onNext,
  onClose,
  isLoading,
}: QRCodeStepProps): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-4">
        <Smartphone className="h-16 w-16 text-blue-600 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold">Escaneie o QR Code</h3>
          <p className="text-muted-foreground mt-2">
            Use seu aplicativo autenticador para escanear este código QR
          </p>
        </div>
      </div>

      {qrData !== null && qrData !== undefined && (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg border">
              <Image
                src={`data:image/png;base64,${qrData.qr_code}`}
                alt="QR Code para 2FA"
                width={192}
                height={192}
                className="w-48 h-48"
              />
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <Label className="text-sm font-medium">Chave manual (caso não consiga escanear):</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input value={qrData.secret} readOnly className="font-mono text-sm" />
              <Button
                variant="secondary"
                type="button"
                size="sm"
                onClick={onCopySecret}
                className="flex items-center gap-2"
              >
                {secretCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {secretCopied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="button" onClick={onNext} disabled={isLoading}>
          Continuar
        </Button>
      </div>
    </div>
  )
}

interface VerifyStepProps {
  verificationCode: string
  onCodeChange: (code: string) => void
  onVerify: () => void
  onClose: () => void
  isLoading: boolean
  error: string | null
}

export function VerifyStep({
  verificationCode,
  onCodeChange,
  onVerify,
  onClose,
  isLoading,
  error,
}: VerifyStepProps): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-4">
        <Shield className="h-16 w-16 text-green-600 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold">Digite o código de verificação</h3>
          <p className="text-muted-foreground mt-2">
            Digite o código de 6 dígitos do seu aplicativo autenticador
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="verification-code">Código de verificação</Label>
          <Input
            id="verification-code"
            type="text"
            placeholder="000000"
            value={verificationCode}
            onChange={e => onCodeChange(e.target.value)}
            className="text-center text-2xl tracking-widest font-mono"
            maxLength={6}
          />
        </div>

        {error !== null && error !== undefined && error !== '' && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="button" onClick={onVerify} disabled={isLoading}>
          {isLoading ? 'Verificando...' : 'Verificar e Ativar'}
        </Button>
      </div>
    </div>
  )
}

interface DisableStepProps {
  verificationCode: string
  onCodeChange: (code: string) => void
  onDisable: () => void
  onClose: () => void
  isLoading: boolean
  error: string | null
}

export function DisableStep({
  verificationCode,
  onCodeChange,
  onDisable,
  onClose,
  isLoading,
  error,
}: DisableStepProps): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-4">
        <Shield className="h-16 w-16 text-red-600 mx-auto" />
        <div>
          <h3 className="text-lg font-semibold">Desativar Autenticação de Dois Fatores</h3>
          <p className="text-muted-foreground mt-2">
            Digite o código do seu aplicativo autenticador para confirmar
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="disable-code">Código de verificação</Label>
          <Input
            id="disable-code"
            type="text"
            placeholder="000000"
            value={verificationCode}
            onChange={e => onCodeChange(e.target.value)}
            className="text-center text-2xl tracking-widest font-mono"
            maxLength={6}
          />
        </div>

        {error !== null && error !== undefined && error !== '' && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            Desativar 2FA reduzirá a segurança da sua conta
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button variant="destructive" type="button" onClick={onDisable} disabled={isLoading}>
          {isLoading ? 'Desativando...' : 'Desativar 2FA'}
        </Button>
      </div>
    </div>
  )
}
