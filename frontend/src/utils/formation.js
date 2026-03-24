// Formation-related utilities

export const calculateFormation = (roleCounts) => {
  return `${roleCounts.WK}-${roleCounts.BAT}-${roleCounts.AR}-${roleCounts.BOWL}`
}

export const validateFormationRoles = (selectedIds, players, roleRules) => {
  const roleCounts = { WK: 0, BAT: 0, AR: 0, BOWL: 0 }

  for (const id of selectedIds) {
    const player = players.find((p) => p.id === id)
    if (player) {
      roleCounts[player.role] += 1
    }
  }

  return roleCounts
}

export const generateValidRoleCombinations = (roleRules) => {
  const combinations = []

  for (let wk = roleRules.WK.min; wk <= roleRules.WK.max; wk += 1) {
    for (let bat = roleRules.BAT.min; bat <= roleRules.BAT.max; bat += 1) {
      for (let ar = roleRules.AR.min; ar <= roleRules.AR.max; ar += 1) {
        for (let bowl = roleRules.BOWL.min; bowl <= roleRules.BOWL.max; bowl += 1) {
          if (wk + bat + ar + bowl === 11) {
            combinations.push({ WK: wk, BAT: bat, AR: ar, BOWL: bowl })
          }
        }
      }
    }
  }

  return combinations
}
