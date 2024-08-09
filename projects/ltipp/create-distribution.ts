import fetch from 'cross-fetch'
import { z } from 'zod'
import { ethers } from 'ethers'
import Decimal from 'decimal.js'

const OrchardResponse = z.object({
  scores: z
    .object({
      wallet: z.string(),
      score: z.number(),
    })
    .array(),
})

type OrchardResponse = z.infer<typeof OrchardResponse>

Decimal.set({ precision: 50 })

const mileStone1Bonus = new Decimal('75000') // 75,000 ARB
const mileStone2Bonus = new Decimal('150000') // 150,000 ARB

const mileStone1Achieved = true
const mileStone2Achieved = false

async function orchardFetch(url: string, meta: Record<string, string>): Promise<OrchardResponse> {
  return fetch(url, {
    headers: meta,
  })
    .then((res) => res.json())
    .then((v) => {
      return OrchardResponse.parse(v)
    })
}

const baseUrl = process.env.ORCHARD_URL

async function main() {
  const queries = new URLSearchParams()
  queries.set('start', '2024-08-01T00:00:00Z')
  queries.set('end', '2024-09-01T00:00:00Z')

  const url = `${baseUrl}/api/scores?${queries.toString()}`

  const { scores } = await orchardFetch(url, {
    'content-type': 'application/json',
  })

  const total = scores.reduce((acc: Decimal, score) => acc.plus(new Decimal(score.score)), new Decimal(0))

  const claims = scores
    .map((score) => {
      let earnings = new Decimal(0)

      const claim = {
        address: score.wallet,
        earnings: '',
        reasons: '',
      }

      if (mileStone1Achieved) {
        const numerator = mileStone1Bonus.times(score.score).toDP(18)
        earnings = numerator.div(total).toDP(18, Decimal.ROUND_DOWN)
      }

      if (mileStone2Achieved) {
        const numerator = mileStone2Bonus.times(score.score).toDP(18)
        earnings = numerator.div(total).toDP(18, Decimal.ROUND_DOWN)
      }

      console.log({ wallet: score.wallet, earnings })

      const bnEarnings = BigInt(earnings.mul(10 ** 18).toFixed(0))

      claim.earnings = ethers.utils.hexZeroPad(ethers.utils.hexValue(bnEarnings), 32)

      return claim
    })
    .filter((claim) => claim.earnings !== ethers.constants.HashZero)

  const totalEarnings = claims.reduce((acc: bigint, claim) => acc + BigInt(claim.earnings), BigInt(0))

  if (mileStone1Achieved && !mileStone2Achieved) {
    if (totalEarnings > BigInt(mileStone1Bonus.mul(10 ** 18).toFixed(0))) {
      console.log('🚨 Calculation error: Total earnings is greater than mileStone1Bonus')
      console.log({ totalEarnings })
      process.exit(1)
    }
  }

  if (mileStone2Achieved) {
    if (totalEarnings > BigInt(mileStone2Bonus.mul(10 ** 18).toFixed(0))) {
      console.log('🚨 Calculation error: Total earnings is greater than mileStone2Bonus')
      console.log({ totalEarnings })
      process.exit(1)
    }
  }

  console.log({ totalEarnings })
  console.log({ totalEarnings: totalEarnings / BigInt(10 ** 18) })

  console.log(JSON.stringify(claims))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
