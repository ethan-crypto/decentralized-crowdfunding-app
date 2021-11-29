export const GREEN = 'success'
export const RED = 'danger'
export const ORANGE = 'warning'
export const GREY = 'secondary'
export const BLUE = 'primary'
export const DARK_GREY = 'dark'
export const DECIMALS = (10**18)

export const EVM_REVERT = 'VM Exception while processing transaction: revert'

export const futureTime = (seconds) => {
  return (+Math.floor(new Date().getTime()/1000.0) + +seconds)
} 

export const formatFunds = (funds) => {
  const precision = 100
  funds = funds/DECIMALS
  funds = Math.round(funds * precision) / precision // Use 2 decimals

  return funds
}

export const formatCost = (funds) => {
  const precision = 100000
  funds = funds/DECIMALS
  funds = Math.round(funds * precision) / precision // Use 6 decimals

  return funds
}

export const formatBalance = (balance) => formatFunds(balance)

