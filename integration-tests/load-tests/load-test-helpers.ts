/* Imports: External */
import { ethers } from 'ethers'

/* Imports: Internal */
import { OptimismEnv } from '../test/shared/env'
import { sleep } from '../test/shared/utils'
import { Direction } from '../test/shared/watcher-utils'

interface TransactionParams {
  contract: ethers.Contract
  functionName: string
  functionParams: any[]
}

export const executeL1ToL2Transactions = async (
  env: OptimismEnv,
  txs: TransactionParams[]
) => {
  for (const tx of txs) {
    const signer = ethers.Wallet.createRandom().connect(env.l1Wallet.provider)
    const receipt = await env.l1Messenger
      .connect(signer)
      .sendMessage(
        tx.contract.address,
        tx.contract.interface.encodeFunctionData(
          tx.functionName,
          tx.functionParams
        ),
        8000000,
        {
          gasPrice: 0,
        }
      )

    await env.waitForXDomainTransaction(receipt, Direction.L1ToL2)
  }
}

export const executeL2ToL1Transactions = async (
  env: OptimismEnv,
  txs: TransactionParams[]
) => {
  for (const tx of txs) {
    const signer = ethers.Wallet.createRandom().connect(env.l2Wallet.provider)
    const receipt = await env.l2Messenger
      .connect(signer)
      .sendMessage(
        tx.contract.address,
        tx.contract.interface.encodeFunctionData(
          tx.functionName,
          tx.functionParams
        ),
        8000000,
        {
          gasPrice: 0,
        }
      )

    await env.waitForXDomainTransaction(receipt, Direction.L2ToL1)
  }
}

export const executeL2Transactions = async (
  env: OptimismEnv,
  txs: TransactionParams[]
) => {
  for (const tx of txs) {
    const signer = ethers.Wallet.createRandom().connect(env.l2Wallet.provider)
    const result = await tx.contract
      .connect(signer)
      .functions[tx.functionName](...tx.functionParams, {
        gasPrice: 0,
      })
    await result.wait()
  }
}

export const executeRepeatedL1ToL2Transactions = async (
  env: OptimismEnv,
  tx: TransactionParams,
  count: number
) => {
  await executeL1ToL2Transactions(
    env,
    [...Array(count).keys()].map(() => {
      return tx
    })
  )
}

export const executeRepeatedL2ToL1Transactions = async (
  env: OptimismEnv,
  tx: TransactionParams,
  count: number
) => {
  await executeL2ToL1Transactions(
    env,
    [...Array(count).keys()].map(() => {
      return tx
    })
  )
}

export const executeRepeatedL2Transactions = async (
  env: OptimismEnv,
  tx: TransactionParams,
  count: number
) => {
  await executeL2Transactions(
    env,
    [...Array(count).keys()].map(() => {
      return tx
    })
  )
}

export const executeL1ToL2TransactionsParallel = async (
  env: OptimismEnv,
  txs: TransactionParams[]
) => {
  await Promise.all(
    txs.map(async (tx) => {
      const signer = ethers.Wallet.createRandom().connect(env.l1Wallet.provider)
      const receipt = await env.l1Messenger
        .connect(signer)
        .sendMessage(
          tx.contract.address,
          tx.contract.interface.encodeFunctionData(
            tx.functionName,
            tx.functionParams
          ),
          8000000,
          {
            gasPrice: 0,
          }
        )

      // Sleeping here is important because it can take a bit of time for all of the transactions
      // to be processed on L2. If we don't sleep, then we can trigger an edge-case in the watcher.
      // Issue has been reported here: https://github.com/ethereum-optimism/optimism/issues/1018
      // Sleep can be removed once this issue is fixed.
      await sleep(1000)
      await env.waitForXDomainTransaction(receipt, Direction.L1ToL2)
    })
  )
}

export const executeL2ToL1TransactionsParallel = async (
  env: OptimismEnv,
  txs: TransactionParams[]
) => {
  await Promise.all(
    txs.map(async (tx) => {
      const signer = ethers.Wallet.createRandom().connect(env.l2Wallet.provider)
      const receipt = await env.l2Messenger
        .connect(signer)
        .sendMessage(
          tx.contract.address,
          tx.contract.interface.encodeFunctionData(
            tx.functionName,
            tx.functionParams
          ),
          8000000,
          {
            gasPrice: 0,
          }
        )

      await env.waitForXDomainTransaction(receipt, Direction.L2ToL1)
    })
  )
}

export const executeL2TransactionsParallel = async (
  env: OptimismEnv,
  txs: TransactionParams[]
) => {
  await Promise.all(
    txs.map(async (tx) => {
      const signer = ethers.Wallet.createRandom().connect(env.l2Wallet.provider)
      const result = await tx.contract
        .connect(signer)
        .functions[tx.functionName](...tx.functionParams, {
          gasPrice: 0,
        })
      await result.wait()
    })
  )
}

export const executeRepeatedL1ToL2TransactionsParallel = async (
  env: OptimismEnv,
  tx: TransactionParams,
  count: number
) => {
  await executeL1ToL2TransactionsParallel(
    env,
    [...Array(count).keys()].map(() => {
      return tx
    })
  )
}

export const executeRepeatedL2ToL1TransactionsParallel = async (
  env: OptimismEnv,
  tx: TransactionParams,
  count: number
) => {
  await executeL2ToL1TransactionsParallel(
    env,
    [...Array(count).keys()].map(() => {
      return tx
    })
  )
}

export const executeRepeatedL2TransactionsParallel = async (
  env: OptimismEnv,
  tx: TransactionParams,
  count: number
) => {
  await executeL2TransactionsParallel(
    env,
    [...Array(count).keys()].map(() => {
      return tx
    })
  )
}
