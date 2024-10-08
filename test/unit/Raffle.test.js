const { getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Test", async function () {
        let raffle, vrfCoordinatorV2_5Mock
        const chainId = network.config.chainId

        beforeEach(async function () {
            const { deployer } = await getNamedAccounts()
            await deployments.fixture(["all"])
            raffle = await ethers.getContract("Raffle", deployer)
            vrfCoordinatorV2_5Mock = await ethers.getContract("VRFCoordinatorV2_5Mock")
        })

        describe("constructor", function () {
            it("initializes the raffle correctly", async function () {
                const raffleState = await raffle.getRaffleState()
                const interval = await raffle.getInterval()
                assert.equal(raffleState.toString(), "0")
                assert.equal(interval.toString(), networkConfig[chainId]["interval"])
            })
        })
})