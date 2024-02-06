import { ActionType } from 'hardhat/types'
import { task } from 'hardhat/config'
import { DeploymentArgs } from './shared/types'
import { saveDeployment } from './shared/save-deployment'
import { deployConfig } from './shared/config'
import { withEnvironParam } from './shared/task'

type DeployTestERC20TaskArgs = DeploymentArgs & {
  name: string
  symbol: string
  amountToMint: string
}

const deployTestErc20Task: ActionType<DeployTestERC20TaskArgs> = async (args, hre) => {
  const chain = await hre.ethers.provider.getNetwork().then((n) => n.chainId)
  const { outDir } = deployConfig
  const { env, name, symbol, amountToMint } = args

  const Token = await hre.ethers.getContractFactory('TestERC20')

  const bnMint = hre.ethers.BigNumber.from(amountToMint)

  const token = await Token.deploy(name, symbol, bnMint).then((c) => c.deployed())

  console.log(`TestERC20 deployed at ${token.address}`)

  saveDeployment(chain, outDir, env, 'TestERC20', {
    address: token.address,
    constructorArgs: [name, symbol, bnMint.toString()],
  })
}

withEnvironParam(task('deploy-test-erc20', 'Deploy a TestERC20 token', deployTestErc20Task))
  .addParam('name', 'The name of the token')
  .addParam('symbol', 'The symbol of the token')
  .addParam('amountToMint', 'The amount of tokens to mint')
