#! /usr/bin/env bash

npx hardhat deploy-merkle-distributor \
    --network arb \
    --env prod \
    --token 0x912ce59144191c1204e64559fe8253a0e49e6548 \
    --end-time 1725195600 \
    --merkle-root 0x9608cd37c344b9a394507250674f97ab79a83355d1684cc26054822e06b2868f
