import { expect } from 'chai'

/* Imports: External */
import { ethers, Contract, ContractFactory } from 'ethers'
import { remove0x } from '@eth-optimism/core-utils'

/* Imports: Internal */
import { OptimismEnv } from './shared/env'
import { Direction } from './shared/watcher-utils'
import l1SimpleStorageJson from '../artifacts/contracts/SimpleStorage.sol/SimpleStorage.json'
import l2SimpleStorageJson from '../artifacts-ovm/contracts/SimpleStorage.sol/SimpleStorage.json'

describe.skip('load tests', () => {
  let env: OptimismEnv
  before(async () => {
    env = await OptimismEnv.new()
  })

  let L2SimpleStorage: Contract
  let L1SimpleStorage: Contract
  beforeEach(async () => {
    const factory__L2SimpleStorage = new ContractFactory(
      l2SimpleStorageJson.abi,
      l2SimpleStorageJson.bytecode,
      env.l2Wallet
    )
    const factory__L1SimpleStorage = new ContractFactory(
      l1SimpleStorageJson.abi,
      l1SimpleStorageJson.bytecode,
      env.l1Wallet
    )
    L1SimpleStorage = await factory__L1SimpleStorage.deploy()
    await L1SimpleStorage.deployTransaction.wait()
    L2SimpleStorage = await factory__L2SimpleStorage.deploy()
    await L2SimpleStorage.deployTransaction.wait()
  })

  describe('L1 => L2 load tests', () => {
    const numTransactions = 100

    it(`should be able to handle a load of ${numTransactions} L1 => L2 transactions (serial)`, async () => {
      for (let i = 0; i < numTransactions; i++) {
        const value = ethers.utils.keccak256(
          ethers.BigNumber.from(i).toHexString()
        )

        const transaction = await env.l1Messenger.sendMessage(
          L2SimpleStorage.address,
          L2SimpleStorage.interface.encodeFunctionData('setValue', [value]),
          5000000
        )

        await env.waitForXDomainTransaction(transaction, Direction.L1ToL2)

        expect(await L2SimpleStorage.msgSender()).to.equal(
          env.l2Messenger.address
        )
        expect(await L2SimpleStorage.xDomainSender()).to.equal(
          env.l1Wallet.address
        )
        expect(await L2SimpleStorage.value()).to.equal(value)
        expect((await L2SimpleStorage.totalCount()).toNumber()).to.equal(i + 1)
      }
    }).timeout(300000)

    it(`should be able to handle a load of ${numTransactions} L1 => L2 transactions (parallel-ish)`, async () => {
      const transactions = []

      for (let i = 0; i < numTransactions; i++) {
        const value = ethers.utils.keccak256(
          ethers.BigNumber.from(i).toHexString()
        )
        const transaction = await env.l1Messenger.sendMessage(
          L2SimpleStorage.address,
          L2SimpleStorage.interface.encodeFunctionData('setValue', [value]),
          5000000
        )

        transactions.push(transaction)
      }

      for (let i = 0; i < numTransactions; i++) {
        const transaction = transactions[i]
        await env.waitForXDomainTransaction(transaction, Direction.L1ToL2)
      }

      expect((await L2SimpleStorage.totalCount()).toNumber()).to.equal(
        numTransactions
      )
    }).timeout(300000)
  })

  describe('L2 => L1 load tests', () => {
    const numTransactions = 100

    it(`should be able to handle a load of ${numTransactions} L2 => L1 transactions (serial)`, async () => {
      for (let i = 0; i < numTransactions; i++) {
        const value = ethers.utils.keccak256(
          ethers.BigNumber.from(i).toHexString()
        )

        const transaction = await env.l2Messenger.sendMessage(
          L1SimpleStorage.address,
          L1SimpleStorage.interface.encodeFunctionData('setValue', [value]),
          5000000
        )

        await env.waitForXDomainTransaction(transaction, Direction.L1ToL2)

        expect(await L1SimpleStorage.msgSender()).to.equal(
          env.l1Messenger.address
        )
        expect(await L1SimpleStorage.xDomainSender()).to.equal(
          env.l2Wallet.address
        )
        expect(await L1SimpleStorage.value()).to.equal(value)
        expect((await L1SimpleStorage.totalCount()).toNumber()).to.equal(i + 1)
      }
    }).timeout(300000)

    it(`should be able to handle a load of ${numTransactions} L2 => L2 transactions (parallel-ish)`, async () => {
      const transactions = []

      for (let i = 0; i < numTransactions; i++) {
        const value = ethers.utils.keccak256(
          ethers.BigNumber.from(i).toHexString()
        )
        const transaction = await env.l2Messenger.sendMessage(
          L1SimpleStorage.address,
          L1SimpleStorage.interface.encodeFunctionData('setValue', [value]),
          5000000
        )

        transactions.push(transaction)
      }

      for (let i = 0; i < numTransactions; i++) {
        const transaction = transactions[i]
        await env.waitForXDomainTransaction(transaction, Direction.L2ToL1)
      }

      expect((await L1SimpleStorage.totalCount()).toNumber()).to.equal(
        numTransactions
      )
    }).timeout(300000)
  })

  describe('L2 transaction load tests', () => {
    const numTransactions = 100

    it(`should be able to handle a load of ${numTransactions} L2 transactions (serial)`, async () => {
      for (let i = 0; i < numTransactions; i++) {
        const value = ethers.utils.keccak256(
          ethers.BigNumber.from(i).toHexString()
        )

        const transaction = await L2SimpleStorage.setValueNotXDomain(value)
        await transaction.wait()

        expect(await L2SimpleStorage.msgSender()).to.equal(env.l2Wallet.address)
        expect(await L2SimpleStorage.value()).to.equal(value)
        expect((await L2SimpleStorage.totalCount()).toNumber()).to.equal(i + 1)
      }
    })

    it(`should be able to handle a load of ${numTransactions} L2 transactions (parallel-ish)`, async () => {
      const transactions = []

      for (let i = 0; i < numTransactions; i++) {
        const value = ethers.utils.keccak256(
          ethers.BigNumber.from(i).toHexString()
        )
        const wallet = new ethers.Wallet(
          `${value}${remove0x(value)}`,
          env.l2Wallet.provider
        )
        const transaction = await L2SimpleStorage.connect(
          wallet
        ).setValueNotXDomain(value, {
          gasPrice: 0,
        })
        transactions.push(transaction)
      }

      for (let i = 0; i < numTransactions; i++) {
        const transaction = transactions[i]
        await transaction.wait()
      }

      expect((await L2SimpleStorage.totalCount()).toNumber()).to.equal(
        numTransactions
      )
    })
  })
})
