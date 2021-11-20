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
export const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
export const toWei = (num) => web3.utils.toWei(num.toString(), "ether")

export const fromWei = (num) => web3.utils.fromWei(num.toString())

export const formatFunds = (funds) => {
  const precision = 100
  funds = funds/DECIMALS
  funds = Math.round(funds * precision) / precision // Use 2 decimals

  return funds
}

export const daiToken = (n) => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), "wei")
  )
}
export const ether = n => daiToken(n)
export const formatBalance = (balance) => formatFunds(balance)

export const mainnetDai = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
export const mainnetWeth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
export const ropstenDai = "0x57aC66399420f7C99F546A5a7C00e0D0Ff2679E1"
export const ropstenWeth = "0xc778417e063141139fce010982780140aa0cd5ab"
