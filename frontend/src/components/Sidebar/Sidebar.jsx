import { GameModeSelector } from './GameModeSelector'
import { FormationDisplay } from './FormationDisplay'
import { CurrentSetup } from './CurrentSetup'
import { AccountSection } from './AccountSection'

export function Sidebar({
  mode,
  roleCounts,
  currentUser,
  selectedPlayers,
  captainId,
  viceCaptainId,
  validateLoading,
  validationResult,
  validationError,
  transferMeta,
  transferMetaLoading,
  transferMetaError,
  transferPolicy,
  transferPolicyLoading,
  transferPolicyError,
  applyLoading,
  applyMessage,
  onModeChange,
  onCaptainChange,
  onViceCaptainChange,
  onValidate,
  onApplyTransfers,
  onLogout,
}) {
  return (
    <aside className="space-y-6 rounded-3xl border border-[#e4ddd2] bg-white p-5 shadow-card">
      <GameModeSelector mode={mode} onModeChange={onModeChange} />

      <FormationDisplay roleCounts={roleCounts} />

      <CurrentSetup mode={mode} roleCounts={roleCounts} />

      <AccountSection
        currentUser={currentUser}
        selectedPlayers={selectedPlayers}
        captainId={captainId}
        viceCaptainId={viceCaptainId}
        validateLoading={validateLoading}
        validationResult={validationResult}
        validationError={validationError}
        transferMeta={transferMeta}
        transferMetaLoading={transferMetaLoading}
        transferMetaError={transferMetaError}
        transferPolicy={transferPolicy}
        transferPolicyLoading={transferPolicyLoading}
        transferPolicyError={transferPolicyError}
        applyLoading={applyLoading}
        applyMessage={applyMessage}
        onCaptainChange={onCaptainChange}
        onViceCaptainChange={onViceCaptainChange}
        onValidate={onValidate}
        onApplyTransfers={onApplyTransfers}
        onLogout={onLogout}
      />
    </aside>
  )
}
