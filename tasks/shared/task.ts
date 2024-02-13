import { ConfigurableTaskDefinition } from 'hardhat/types'

export const withEnvironParam = (task: ConfigurableTaskDefinition): ConfigurableTaskDefinition => {
  return task.addParam('env', 'The environment to deploy to')
}
