

export const daiToken = (n) => {
  return new web3.utils.BN(
    web3.utils.toWei(n.toString(), 'ether')
  )
}

export const EVM_REVERT = 'VM Exception while processing transaction: revert'

export const futureTime = (seconds) => {
  return (+Math.floor(new Date().getTime()/1000.0) + +seconds)
} 
export const wait = (seconds) => {
  const milliseconds = seconds * 1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}