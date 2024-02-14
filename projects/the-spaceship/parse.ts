import { formatUnits } from 'ethers/lib/utils'

async function main() {
  const formatted = formatUnits(BigInt('123456789'), 18)

  console.log({ formatted })
}

main()
