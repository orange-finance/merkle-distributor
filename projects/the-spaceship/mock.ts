import { BigNumber, ethers } from 'ethers'
import { DuneResponse } from './create-distribution'
import crypto from 'crypto'
import { randBigNumber } from './rand'

const EXPECTED_MAX_POINT = 5e9 // 5 billion points. assume that a user deposited 2000 ETH during approx a month

export async function mockDuneFetch(
  url: string,
  meta: Record<string, string>,
  count: number = 100
): Promise<DuneResponse> {
  // const randomPoints = Array.from({ length: count }, (_, i) => randBig(20)).sort((a, b) => Number(b - a))
  const randomPoints = Array.from({ length: count }, (_, i) => randBigNumber(EXPECTED_MAX_POINT, 18)).sort((a, b) =>
    b.sub(a).gt(0) ? 1 : -1
  )
  // const total = randomPoints.reduce((acc, curr) => acc + curr, BigInt(0))
  const total = randomPoints.reduce((acc, curr) => acc.add(curr), BigNumber.from(0))

  console.log({ total })

  return {
    result: {
      metadata: {
        row_count: 100,
      },
      rows: randomPoints.map((points, i) => ({
        points: points.toString(),
        rank: i + 1,
        user: '0x' + crypto.randomBytes(20).toString('hex'),
        wethLatestShareRatio: -1, // we don't need this for now. set to invalid value
      })),
    },
  }
}

function randBig(bytes: number): bigint {
  const seed = Math.floor(Math.random() * bytes)

  const hex = crypto.randomBytes(seed).toString('hex')

  return hex ? BigInt('0x' + hex) : BigInt(0)
}

mockDuneFetch('https://api.dune.com/api/v1/query/3409435/results', {}).then((res) => {
  console.log(res.result.rows)
})
