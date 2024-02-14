import { BigNumber } from 'ethers'

export function randBigNumber(max: number, unit: number): BigNumber {
  return BigNumber.from(Math.floor(Math.random() * max)).mul(BigNumber.from(10).pow(unit))
}
