// Game configuration constants
export const modeOptions = ['Classic', 'H2H', 'Turbo']

export const roleTabs = [
  { label: 'Selected', value: 'SELECTED' },
  { label: 'Ball', value: 'BOWL' },
  { label: 'Bat', value: 'BAT' },
  { label: 'All Rounder', value: 'AR' },
  { label: 'WK', value: 'WK' },
]

export const roleRules = {
  WK: { min: 1, max: 4 },
  BAT: { min: 3, max: 6 },
  AR: { min: 1, max: 4 },
  BOWL: { min: 3, max: 6 },
}

export const roleKeys = ['WK', 'BAT', 'AR', 'BOWL']

export const budgetCap = 100

export const registerDefaults = {
  email: '',
  password: '',
  confirmPassword: '',
}

export const defaultLoginForm = {
  email: 'manager1@newfpl.local',
  password: 'ManagerPass123',
}
