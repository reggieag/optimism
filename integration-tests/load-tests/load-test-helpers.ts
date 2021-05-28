import { ethers } from 'ethers'
import { Contract } from '@ethersproject/contracts'
import { OptimismEnv } from '../test/shared/env'
import { Direction } from '../test/shared/watcher-utils'

interface TransactionParams {
  contract: Contract
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
    const result = await signer.sendTransaction({
      to: tx.contract.address,
      data: tx.contract.interface.encodeFunctionData(
        tx.functionName,
        tx.functionParams
      ),
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
      const result = await signer.sendTransaction({
        to: tx.contract.address,
        data: tx.contract.interface.encodeFunctionData(
          tx.functionName,
          tx.functionParams
        ),
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
