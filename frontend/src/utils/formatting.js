// String formatting utilities

export const createNameFromEmail = (email) => {
  const local = (email.split('@')[0] || '').trim()
  if (!local) return 'New FPL User'

  const cleaned = local.replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim()
  if (!cleaned) return 'New FPL User'

  return cleaned
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export const createPhoneFromEmail = (email) => {
  const chars = email.replace(/\D/g, '')
  return `9${(chars + '0123456789').slice(0, 9)}`
}
