# The Spaceship Airdrop

## 1. Generate the merkle tree

```bash
yarn generate-merkle-root -i projects/spaceship/prod/distribution.json
```

this will show the merkle tree information to the console. copy the `merkleRoot` value to use in the next step.

it's recommended to save the merkle tree information to a file for future reference.
file: `projects/spaceship/prod/merkle-tree.json`

## 2. Deploy the contract

change the `merkleRoot` value to the one generated in the previous step.

```bash
yarn deploy:merkle-distributor --network arb --env prod --token 0x912CE59144191C1204E64559FE8253a0e49E6548 --merkle-root <merkleRoot>
```
