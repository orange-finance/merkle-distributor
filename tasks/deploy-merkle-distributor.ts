import { ActionType } from 'hardhat/types'
import { DeploymentArgs } from './shared/types'
import { saveDeployment } from './shared/save-deployment'
import { deployConfig } from './shared/config'
import { withEnvironParam } from './shared/task'
import { task } from 'hardhat/config'

type DeployMerkleDistributorTaskArgs = DeploymentArgs & {
  token: string
  merkleRoot: string
}

const deployMerkleDistributorTask: ActionType<DeployMerkleDistributorTaskArgs> = async (args, hre) => {
  const chain = await hre.ethers.provider.getNetwork().then((n) => n.chainId)
  const { outDir } = deployConfig
  const { env, token, merkleRoot } = args

  const MerkleDistributor = await hre.ethers.getContractFactory('MerkleDistributor')

  const distributor = await MerkleDistributor.deploy(token, merkleRoot).then((c) => c.deployed())

  console.log(`MerkleDistributor deployed at ${distributor.address}`)

  saveDeployment(chain, outDir, env, 'MerkleDistributor', {
    address: distributor.address,
    constructorArgs: [token, merkleRoot],
  })
}

withEnvironParam(task('deploy-merkle-distributor', 'Deploy a MerkleDistributor contract', deployMerkleDistributorTask))
  .addParam('token', 'The address of the token to be distributed')
  .addParam('merkleRoot', 'The merkle root of the distribution tree')
