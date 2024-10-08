# LTIPP Airdrop

## 1. Prepare the distribution file

```bash
yarn ltipp:generate-distribution
```

this will print the distribution information to the console. copy the output to a file for future reference.

## 2. Generate the merkle tree

```bash
yarn generate-merkle-root -i projects/ltipp/prod/distribution.json
```

this will show the merkle tree information to the console. copy the `merkleRoot` value to use in the next step.

it's recommended to save the merkle tree information to a file for future reference.
file: `projects/ltipp/prod/merkle-tree.json`

## 3. Deploy the contract

change the `merkleRoot` value to the one generated in the previous step.

```bash
yarn deploy:merkle-distributor --network arb --env prod --token 0x912CE59144191C1204E64559FE8253a0e49E6548 --merkle-root <merkleRoot> --end-time
<timestamp>
```
