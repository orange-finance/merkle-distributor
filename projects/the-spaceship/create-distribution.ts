import fetch from 'cross-fetch'
import { z } from 'zod'
import { mockDuneFetch } from './mock'

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
        wethLatestShareRatio: z.number(),
      })
    ),
  }),
})

const mileStone1 = '25000000000000000000000' // 25,000 ARB
const m1RankLimit = 50

const mileStone2 = '12500000000000000000000' // 12,500 ARB

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
  const url = `https://api.dune.com/api/v1/query/3409435/results`

  // TODO: uncomment this line to use real data
  // const { result } = await duneFetch(url, meta)
  const { result } = await mockDuneFetch(url, meta)

  const total: bigint = result.rows.reduce((acc: bigint, row: Row) => (acc += BigInt(row.points)), BigInt(0))

  const claims = result.rows.map((row: Row) => {
    let bnEarnings = BigInt(0)

    const claim = {
      user: row.user,
      earnings: '',
      reason: '',
    }

    if (row.rank <= m1RankLimit) {
      bnEarnings += BigInt(mileStone1) / BigInt(m1RankLimit)
    }

    bnEarnings += (BigInt(mileStone2) * BigInt(row.points)) / total

    claim.earnings = bnEarnings.toString()

    return claim
  })

  console.log(JSON.stringify(claims))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
