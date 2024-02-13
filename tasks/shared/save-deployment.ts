import fs from 'fs'
import path from 'path'

type Deployment = {
  address: string
  constructorArgs: any[]
}

export const saveDeployment = async (
  chain: number,
  pathFromRoot: string,
  filename: string,
  key: string,
  deployment: Deployment
) => {
  const deploymentPath = path.join(pathFromRoot, chain.toString())
  const deploymentFile = path.join(deploymentPath, `${filename}.json`)

  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath)
  }

  let deployments: Record<string, Deployment> = {}
  if (fs.existsSync(deploymentFile)) {
    deployments = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'))
  }

  deployments[key] = deployment

  fs.writeFileSync(deploymentFile, JSON.stringify(deployments, null, 2))
}
