'use client'

import { useParams } from 'next/navigation'

import { InviteActions, useInviteLogic } from './components/InviteActions'
import { InviteInfo } from './components/InviteInfo'
import { ConditionalStateRenderer } from './components/InviteStates'
import { useInviteData, formatDate, formatRole } from './components/utils'

export default function AcceptInvitePage(): JSX.Element | null {
  const params = useParams()
  const token = params.token as string

  const { inviteInfo, loading, error } = useInviteData(token)
  const { result } = useInviteLogic(token, inviteInfo)

  // Show loading/error/success states first
  const stateComponent = ConditionalStateRenderer({ loading, error, result })
  if (stateComponent) {
    return stateComponent
  }

  // Show invite content only if we have valid invite info
  if (!inviteInfo) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="space-y-6">
          <InviteInfo inviteInfo={inviteInfo} formatDate={formatDate} formatRole={formatRole} />

          <InviteActions token={token} inviteInfo={inviteInfo} />
        </div>
      </div>
    </div>
  )
}
