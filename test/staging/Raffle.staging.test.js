const { getNamedAccounts, deployments, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("Raffle Staging Test", async function () {
          let raffle, raffleEntranceFee, deployer

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
          })

          describe("fulfillRandomWords", function () {
              it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async function () {
                  const startingTimeStamp = await raffle.getLastTimeStamp()
                  const accounts = await ethers.getSigners()

                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fired!")
                          try {
                              const lastWinner = await raffle.getLastWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await raffle.getLastTimeStamp()
                              const raffleEndingBalance = await ethers.provider.getBalance(
                                  raffle.address,
                              )

                              // Assertions
                              // Verify players array has been reset
                              await expect(raffle.getPlayer(0)).to.be.reverted
                              // Verify the lastWinner is account[0]
                              assert.equal(lastWinner.toString(), accounts[0].address)
                              // verify raffleState is "OPEN"
                              assert.equal(raffleState.toString(), "0")
                              // verify that winner has received all the ether in the raffle
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(raffleStartingBalance).toString(),
                              )
                              assert.equal(raffleEndingBalance.toString(), "0")
                              assert(endingTimeStamp > startingTimeStamp)
                              resolve()
                          } catch (e) {
                              console.log(e)
                              reject(e)
                          }
                      })

                      // Enter the raffle
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      const raffleStartingBalance = await ethers.provider.getBalance(raffle.address)
                      const winnerStartingBalance = await accounts[0].getBalance()
                  })
              })
          })
      })
