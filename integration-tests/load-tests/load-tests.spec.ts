import { expect } from 'chai'

/* Imports: External */
import { Contract, ContractFactory } from 'ethers'

/* Imports: Internal */
import { OptimismEnv } from '../test/shared/env'
import {
  executeRepeatedL1ToL2Transactions,
  executeRepeatedL2ToL1Transactions,
  executeRepeatedL2Transactions,
  executeRepeatedL1ToL2TransactionsParallel,
  executeRepeatedL2ToL1TransactionsParallel,
  executeRepeatedL2TransactionsParallel,
} from './load-test-helpers'

/* Imports: Artifacts */
import l1SimpleStorageJson from '../artifacts/contracts/SimpleStorage.sol/SimpleStorage.json'
import l2SimpleStorageJson from '../artifacts-ovm/contracts/SimpleStorage.sol/SimpleStorage.json'

describe('load tests', () => {
  let env: OptimismEnv
  before(async () => {
    env = await OptimismEnv.new()
  })

  let L2SimpleStorage: Contract
  let L1SimpleStorage: Contract
  beforeEach(async () => {
    const factory__L1SimpleStorage = new ContractFactory(
      l1SimpleStorageJson.abi,
      l1SimpleStorageJson.bytecode,
      env.l1Wallet
    )
    const factory__L2SimpleStorage = new ContractFactory(
      l2SimpleStorageJson.abi,
      l2SimpleStorageJson.bytecode,
      env.l2Wallet
    )
    L1SimpleStorage = await factory__L1SimpleStorage.deploy()
    await L1SimpleStorage.deployTransaction.wait()
    L2SimpleStorage = await factory__L2SimpleStorage.deploy()
    await L2SimpleStorage.deployTransaction.wait()
  })

  describe('L1 => L2 load tests', () => {
    const numTransactions = 10

    it(`${numTransactions} L1 => L2 transactions (serial)`, async () => {
      await executeRepeatedL1ToL2Transactions(
        env,
        {
          contract: L2SimpleStorage,
          functionName: 'setValue',
          functionParams: [`0x${'42'.repeat(32)}`],
        },
        numTransactions
      )

      expect((await L2SimpleStorage.totalCount()).toNumber()).to.equal(
        numTransactions
      )
    })

    it(`${numTransactions} L1 => L2 transactions (parallel)`, async () => {
      await executeRepeatedL1ToL2TransactionsParallel(
        env,
        {
          contract: L2SimpleStorage,
          functionName: 'setValue',
          functionParams: [`0x${'42'.repeat(32)}`],
        },
        numTransactions
      )

      expect((await L2SimpleStorage.totalCount()).toNumber()).to.equal(
        numTransactions
      )
    })
  })

  describe('L2 => L1 load tests', () => {
    const numTransactions = 10

    it(`${numTransactions} L2 => L1 transactions (serial)`, async () => {
      await executeRepeatedL2ToL1Transactions(
        env,
        {
          contract: L1SimpleStorage,
          functionName: 'setValue',
          functionParams: [`0x${'42'.repeat(32)}`],
        },
        numTransactions
      )

      expect((await L1SimpleStorage.totalCount()).toNumber()).to.equal(
        numTransactions
      )
    })

    it(`${numTransactions} L2 => L1 transactions (parallel)`, async () => {
      await executeRepeatedL2ToL1TransactionsParallel(
        env,
        {
          contract: L1SimpleStorage,
          functionName: 'setValue',
          functionParams: [`0x${'42'.repeat(32)}`],
        },
        numTransactions
      )

      expect((await L1SimpleStorage.totalCount()).toNumber()).to.equal(
        numTransactions
      )
    })
  })

  describe('L2 transaction load tests', () => {
    const numTransactions = 10

    it(`${numTransactions} L2 transactions (serial)`, async () => {
      await executeRepeatedL2Transactions(
        env,
        {
          contract: L2SimpleStorage,
          functionName: 'setValueNotXDomain',
          functionParams: [`0x${'42'.repeat(32)}`],
        },
        numTransactions
      )

      expect((await L2SimpleStorage.totalCount()).toNumber()).to.equal(
        numTransactions
      )
    })

    it(`${numTransactions} L2 transactions (parallel)`, async () => {
      await executeRepeatedL2TransactionsParallel(
        env,
        {
          contract: L2SimpleStorage,
          functionName: 'setValueNotXDomain',
          functionParams: [`0x${'42'.repeat(32)}`],
        },
        numTransactions
      )

      expect((await L2SimpleStorage.totalCount()).toNumber()).to.equal(
        numTransactions
      )
    })
  })
}).timeout(500000)
