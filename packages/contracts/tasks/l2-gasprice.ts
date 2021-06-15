/* Imports: External */
import { ethers } from 'ethers'
import { task } from 'hardhat/config'
import * as types from 'hardhat/internal/core/params/argumentTypes'
import GasPriceOracleArtifact from '../artifacts-ovm/contracts/optimistic-ethereum/OVM/predeploys/OVM_GasPriceOracle.sol/OVM_GasPriceOracle.json'
import { predeploys } from '../src/predeploys'

const CONTRACTS_RPC_URL = process.env.CONTRACTS_RPC_URL
const CONTRACTS_DEPLOYER_KEY = process.env.CONTRACTS_DEPLOYER_KEY

task('set-l2-gasprice')
  .addOptionalParam(
    'l2GasPrice',
    'Gas Price to set on L2',
    0,
    types.int
  )
  .setAction(async (args, hre: any, runSuper) => {
    const provider = new ethers.providers.JsonRpcProvider(CONTRACTS_RPC_URL)
    const signer = new ethers.Wallet(CONTRACTS_DEPLOYER_KEY).connect(provider)

    const GasPriceOracle = new ethers.Contract(
      predeploys.OVM_GasPriceOracle,
      GasPriceOracleArtifact.abi,
      provider
    )

    const gasPrice = await GasPriceOracle.callStatic.gasPrice()
    console.log(`Gas Price is currently ${gasPrice.toString()}`)
    console.log(`Setting Gas Price to ${args.l2GasPrice}`)

    const tx = await GasPriceOracle
      .connect(signer)
      .setGasPrice(args.l2GasPrice, {gasPrice: 0})

    const receipt = await tx.wait()

    console.log('Success!')
  })
