import { ActionType } from 'hardhat/types'
import { DeploymentArgs } from './shared/types'
import { saveDeployment } from './shared/save-deployment'
import { deployConfig } from './shared/config'
import { withEnvironParam } from './shared/task'
import { task } from 'hardhat/config'

type DeployMerkleDistributorTaskArgs = DeploymentArgs & {
  token: string
  merkleRoot: string
  endTime: number
}

const deployMerkleDistributorTask: ActionType<DeployMerkleDistributorTaskArgs> = async (args, hre) => {
  const chain = await hre.ethers.provider.getNetwork().then((n) => n.chainId)
  const { outDir } = deployConfig
  const { env, token, merkleRoot, endTime } = args

  const MerkleDistributor = await hre.ethers.getContractFactory('MerkleDistributorWithDeadline')

  const distributor = await MerkleDistributor.deploy(token, merkleRoot, endTime).then((c) => c.deployed())

  console.log(`MerkleDistributorWithDeadline deployed at ${distributor.address}`)

  await hre.run('verify:verify', {
    address: distributor.address,
    constructorArguments: [token, merkleRoot, endTime],
  })

  saveDeployment(chain, outDir, env, 'MerkleDistributorWithDeadline', {
    address: distributor.address,
    constructorArgs: [token, merkleRoot, endTime],
  })
}

withEnvironParam(task('deploy-merkle-distributor', 'Deploy a MerkleDistributor contract', deployMerkleDistributorTask))
  .addParam('token', 'The address of the token to be distributed')
  .addParam('merkleRoot', 'The merkle root of the distribution tree')
  .addParam('endTime', 'The time at which the distributor will no longer be able to distribute tokens')
