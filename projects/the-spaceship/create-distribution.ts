import fetch from 'cross-fetch'
import { z } from 'zod'
import { mockDuneFetch } from './test/dune'
import { ethers } from 'ethers'

export type Row = z.infer<typeof duneSchema>['result']['rows'][number]

export type DuneResponse = z.infer<typeof duneSchema>

const duneSchema = z.object({
  result: z.object({
    metadata: z.object({
      row_count: z.number(),
    }),
    rows: z.array(
      z.object({
        points: z.string(),
        rank: z.number(),
        user: z.string(),
      })
    ),
  }),
})

const mileStone1 = '20000000000000000000000' // 20,000 ARB
const m1RankLimit = 50

const mileStone2 = '10000000000000000000000' // 10,000 ARB

async function duneFetch(url: string, meta: Record<string, string>): Promise<DuneResponse> {
  return fetch(url, {
    headers: meta,
  })
    .then((res) => res.json())
    .then(duneSchema.parse)
}

async function main() {
  const meta = {
    'x-dune-api-key': process.env.DUNE_API_KEY ?? '',
  }
  const url = `https://api.dune.com/api/v1/query/3723093/results`

  const { result } = await duneFetch(url, meta)
  // const { result } = await mockDuneFetch(url, meta)

  const total: bigint = result.rows.reduce((acc: bigint, row: Row) => (acc += BigInt(row.points)), BigInt(0))

  const claims = result.rows
    .map((row: Row) => {
      let bnEarnings = BigInt(0)

      const claim = {
        address: row.user,
        earnings: '',
        reasons: '',
      }

      if (row.rank <= m1RankLimit) {
        bnEarnings += BigInt(mileStone1) / BigInt(m1RankLimit)
      }

      // milestone 2 not reached, so we don't need to calculate earnings for milestone 2
      // bnEarnings += (BigInt(mileStone2) * BigInt(row.points)) / total

      claim.earnings = ethers.utils.hexZeroPad(ethers.utils.hexValue(bnEarnings), 32)

      return claim
    })
    .filter((claim) => claim.earnings !== ethers.constants.HashZero)

  console.log(JSON.stringify(claims))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
