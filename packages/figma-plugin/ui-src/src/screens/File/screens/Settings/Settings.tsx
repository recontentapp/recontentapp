import { useState } from 'react'
import { Details } from './components/Details'
import { UpdateLanguage } from './components/UpdateLanguage'

interface SettingsProps {
  onRequestSync: () => void
}

export const Settings = ({ onRequestSync }: SettingsProps) => {
  const [isUpdatingLanguage, setIsUpdatingLanguage] = useState(false)

  return isUpdatingLanguage ? (
    <UpdateLanguage
      onRequestSync={onRequestSync}
      onClose={() => setIsUpdatingLanguage(false)}
    />
  ) : (
    <Details onRequestLanguageChange={() => setIsUpdatingLanguage(true)} />
  )
}
