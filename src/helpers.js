export const DECIMALS = (10**18)

export const EVM_REVERT = 'VM Exception while processing transaction: revert'

export const futureTime = (seconds) => {
  return (Math.floor(new Date().getTime()/1000.0) + seconds)
} 
export const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}



export const formatFunds = (funds) => {
  const precision = 100
  funds = funds/DECIMALS
  funds = Math.round(funds * precision) / precision // Use 2 decimals

  return funds
}
