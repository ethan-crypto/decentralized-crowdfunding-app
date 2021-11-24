export const ether = (n) => daiToken(n);

export const EVM_REVERT = 'VM Exception while processing transaction: revert'

export const futureTime = (seconds) => {
  return (+Math.floor(new Date().getTime()/1000.0) + +seconds)
} 
export const toWei = (num) => web3.utils.toWei(num.toString(), "ether")

export const fromWei = (num) => web3.utils.fromWei(num.toString())

export const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}
export const mainnetDai = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
export const mainnetWeth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
export const ropstenDai = "0x57aC66399420f7C99F546A5a7C00e0D0Ff2679E1"
export const ropstenWeth = "0xc778417e063141139fce010982780140aa0cd5ab"