// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require('SupplyChain')
const { expect } = require('chai')
const { expectEvent } = require('@openzeppelin/test-helpers')

contract('SupplyChain', function(accounts) {
    // Declare few constants and assign a few sample accounts generated by ganache-cli
    var sku = 1
    var upc = 1
    const ownerID = accounts[0]
    const originFarmerID = accounts[1]
    const originFarmName = "John Doe"
    const originFarmInformation = "Yarray Valley"
    const originFarmLatitude = "-38.239770"
    const originFarmLongitude = "144.341490"
    var productID = sku + upc
    const productNotes = "Best beans for Espresso"
    const productPrice = web3.utils.toWei('1', "ether")
    const retailPrice = web3.utils.toWei('1.5', "ether") // +20% margin of retailer
    var itemState = 1
    const distributorID = accounts[2]
    const retailerID = accounts[3]
    const consumerID = accounts[4]
    const unknownActor = accounts[5]
    const emptyAddress = '0x0000000000000000000000000000000000000000'

    ///Available Accounts
    ///==================
    ///(0) 0x27d8d15cbc94527cadf5ec14b69519ae23288b95
    ///(1) 0x018c2dabef4904ecbd7118350a0c54dbeae3549a
    ///(2) 0xce5144391b4ab80668965f2cc4f2cc102380ef0a
    ///(3) 0x460c31107dd048e34971e57da2f99f659add4f02
    ///(4) 0xd37b7b8c62be2fdde8daa9816483aebdbd356088
    ///(5) 0x27f184bdc0e7a931b507ddd689d76dba10514bcb
    ///(6) 0xfe0df793060c49edca5ac9c104dd8e3375349978
    ///(7) 0xbd58a85c96cc6727859d853086fe8560bc137632
    ///(8) 0xe07b5ee5f738b2f87f88b99aac9c64ff1e0c7917
    ///(9) 0xbd3ff2e3aded055244d66544c9c059fa0851da44

    console.log("ganache-cli accounts used here...")
    console.log("Contract Owner: accounts[0] ", accounts[0])
    console.log("Farmer: accounts[1] ", accounts[1])
    console.log("Distributor: accounts[2] ", accounts[2])
    console.log("Retailer: accounts[3] ", accounts[3])
    console.log("Consumer: accounts[4] ", accounts[4])

    describe("Main test", () => {
        beforeEach(async () => {
            supplyChain = await SupplyChain.new()

            const owner = await supplyChain.owner()
            expect(owner, 'Owner of the contract is not correct').to.equal(ownerID)
            // assign roles
            await supplyChain.assignFarmerRole(originFarmerID, { from: ownerID })
            await supplyChain.assignDistributorRole(distributorID, { from: ownerID })
            await supplyChain.assignConsumerRole(consumerID, { from: ownerID })
            await supplyChain.assignRetailerRole(retailerID, { from: ownerID })
        })

        // 1st Test
        it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async () => {
            const response = await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })

            // check event
            expectEvent(response, 'Harvested', { upc: upc.toString() })

            // Retrieve the just now saved item from blockchain by calling function fetchItem()
            const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
            const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)
            // Verify the result set
            expect(resultBufferOne[0].toString(), 'Error: Invalid item SKU').to.equal(sku.toString())
            expect(resultBufferOne[1].toString(), 'Error: Invalid item UPC').to.equal(upc.toString())
            expect(resultBufferOne[2], 'Error: Missing or Invalid ownerID').to.equal(originFarmerID)
            expect(resultBufferOne[3], 'Error: Missing or Invalid originFarmerID').to.equal(originFarmerID)
            expect(resultBufferOne[4], 'Error: Missing or Invalid originFarmName').to.equal(originFarmName)
            expect(resultBufferOne[5], 'Error: Missing or Invalid originFarmInformation').to.equal(originFarmInformation)
            expect(resultBufferOne[6], 'Error: Missing or Invalid originFarmLatitude').to.equal(originFarmLatitude)
            expect(resultBufferOne[7], 'Error: Missing or Invalid originFarmLongitude').to.equal(originFarmLongitude)
            expect(resultBufferTwo[2].toString(), 'Error: Invalid productID').to.equal(productID.toString())
            expect(resultBufferTwo[3].toString(), 'Error: Invalid productNotes').to.equal(productNotes.toString())
            expect(resultBufferTwo[4].toString(), 'Error: Invalid productPrice').to.equal('0')
            expect(resultBufferTwo[5].toString(), 'Error: Invalid item State').to.equal(itemState.toString())
            expect(resultBufferTwo[6].toString(), 'Error: Invalid distributor address').to.equal(emptyAddress)
            expect(resultBufferTwo[7].toString(), 'Error: Invalid retailer address').to.equal(emptyAddress)
            expect(resultBufferTwo[8].toString(), 'Error: Invalid consumer address').to.equal(emptyAddress)
            expect(resultBufferTwo[9].toString(), 'Error: Invalid retail price').to.equal('0')
        })

        // 2nd Test
        it("Testing smart contract function processItem() that allows a farmer to process coffee", async () => {
            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
            const response = await supplyChain.processItem(upc, { from: originFarmerID })
            itemState = 2

            // check event
            expectEvent(response, 'Processed', { upc: upc.toString() })

            // Retrieve the just now saved item from blockchain by calling function fetchItem()
            const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
            const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)
            // Verify the result set
            expect(resultBufferOne[0].toString(), 'Error: Invalid item SKU').to.equal(sku.toString())
            expect(resultBufferOne[1].toString(), 'Error: Invalid item UPC').to.equal(upc.toString())
            expect(resultBufferOne[2], 'Error: Missing or Invalid ownerID').to.equal(originFarmerID)
            expect(resultBufferOne[3], 'Error: Missing or Invalid originFarmerID').to.equal(originFarmerID)
            expect(resultBufferOne[4], 'Error: Missing or Invalid originFarmName').to.equal(originFarmName)
            expect(resultBufferOne[5], 'Error: Missing or Invalid originFarmInformation').to.equal(originFarmInformation)
            expect(resultBufferOne[6], 'Error: Missing or Invalid originFarmLatitude').to.equal(originFarmLatitude)
            expect(resultBufferOne[7], 'Error: Missing or Invalid originFarmLongitude').to.equal(originFarmLongitude)
            expect(resultBufferTwo[2].toString(), 'Error: Invalid productID').to.equal(productID.toString())
            expect(resultBufferTwo[3].toString(), 'Error: Invalid productNotes').to.equal(productNotes.toString())
            expect(resultBufferTwo[4].toString(), 'Error: Invalid productPrice').to.equal('0')
            expect(resultBufferTwo[5].toString(), 'Error: Invalid item State').to.equal(itemState.toString())
            expect(resultBufferTwo[6].toString(), 'Error: Invalid distributor address').to.equal(emptyAddress)
            expect(resultBufferTwo[7].toString(), 'Error: Invalid retailer address').to.equal(emptyAddress)
            expect(resultBufferTwo[8].toString(), 'Error: Invalid consumer address').to.equal(emptyAddress)
            expect(resultBufferTwo[9].toString(), 'Error: Invalid retail price').to.equal('0')

        })

        // 3rd Test
        it("Testing smart contract function packItem() that allows a farmer to pack coffee", async () => {
            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
            await supplyChain.processItem(upc, { from: originFarmerID })
            const response = await supplyChain.packItem(upc, { from: originFarmerID })
            itemState = 3

            // check event
            expectEvent(response, 'Packed', { upc: upc.toString() })

            // Retrieve the just now saved item from blockchain by calling function fetchItem()
            const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
            const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)
            // Verify the result set
            expect(resultBufferOne[0].toString(), 'Error: Invalid item SKU').to.equal(sku.toString())
            expect(resultBufferOne[1].toString(), 'Error: Invalid item UPC').to.equal(upc.toString())
            expect(resultBufferOne[2], 'Error: Missing or Invalid ownerID').to.equal(originFarmerID)
            expect(resultBufferOne[3], 'Error: Missing or Invalid originFarmerID').to.equal(originFarmerID)
            expect(resultBufferOne[4], 'Error: Missing or Invalid originFarmName').to.equal(originFarmName)
            expect(resultBufferOne[5], 'Error: Missing or Invalid originFarmInformation').to.equal(originFarmInformation)
            expect(resultBufferOne[6], 'Error: Missing or Invalid originFarmLatitude').to.equal(originFarmLatitude)
            expect(resultBufferOne[7], 'Error: Missing or Invalid originFarmLongitude').to.equal(originFarmLongitude)
            expect(resultBufferTwo[2].toString(), 'Error: Invalid productID').to.equal(productID.toString())
            expect(resultBufferTwo[3].toString(), 'Error: Invalid productNotes').to.equal(productNotes.toString())
            expect(resultBufferTwo[4].toString(), 'Error: Invalid productPrice').to.equal('0')
            expect(resultBufferTwo[5].toString(), 'Error: Invalid item State').to.equal(itemState.toString())
            expect(resultBufferTwo[6].toString(), 'Error: Invalid distributor address').to.equal(emptyAddress)
            expect(resultBufferTwo[7].toString(), 'Error: Invalid retailer address').to.equal(emptyAddress)
            expect(resultBufferTwo[8].toString(), 'Error: Invalid consumer address').to.equal(emptyAddress)
            expect(resultBufferTwo[9].toString(), 'Error: Invalid retail price').to.equal('0')

        })

        // 4th Test
        it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async () => {
            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
            await supplyChain.processItem(upc, { from: originFarmerID })
            await supplyChain.packItem(upc, { from: originFarmerID })
            const response = await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })

            itemState = 4

            // check event
            expectEvent(response, 'ForSale', { upc: upc.toString() })

            // Retrieve the just now saved item from blockchain by calling function fetchItem()
            const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
            const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)
            // Verify the result set
            expect(resultBufferOne[0].toString(), 'Error: Invalid item SKU').to.equal(sku.toString())
            expect(resultBufferOne[1].toString(), 'Error: Invalid item UPC').to.equal(upc.toString())
            expect(resultBufferOne[2], 'Error: Missing or Invalid ownerID').to.equal(originFarmerID)
            expect(resultBufferOne[3], 'Error: Missing or Invalid originFarmerID').to.equal(originFarmerID)
            expect(resultBufferOne[4], 'Error: Missing or Invalid originFarmName').to.equal(originFarmName)
            expect(resultBufferOne[5], 'Error: Missing or Invalid originFarmInformation').to.equal(originFarmInformation)
            expect(resultBufferOne[6], 'Error: Missing or Invalid originFarmLatitude').to.equal(originFarmLatitude)
            expect(resultBufferOne[7], 'Error: Missing or Invalid originFarmLongitude').to.equal(originFarmLongitude)
            expect(resultBufferTwo[2].toString(), 'Error: Invalid productID').to.equal(productID.toString())
            expect(resultBufferTwo[3].toString(), 'Error: Invalid productNotes').to.equal(productNotes.toString())
            expect(resultBufferTwo[4].toString(), 'Error: Invalid productPrice').to.equal(productPrice.toString())
            expect(resultBufferTwo[5].toString(), 'Error: Invalid item State').to.equal(itemState.toString())
            expect(resultBufferTwo[6].toString(), 'Error: Invalid distributor address').to.equal(emptyAddress)
            expect(resultBufferTwo[7].toString(), 'Error: Invalid retailer address').to.equal(emptyAddress)
            expect(resultBufferTwo[8].toString(), 'Error: Invalid consumer address').to.equal(emptyAddress)
            expect(resultBufferTwo[9].toString(), 'Error: Invalid retail price').to.equal('0')

        })

        // 5th Test
        it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async () => {
            const originalFarmerBalance = web3.utils.toBN(await web3.eth.getBalance(originFarmerID))
            const originalDistributorBalance = web3.utils.toBN(await web3.eth.getBalance(distributorID))

            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID, gasPrice: '0' })
            await supplyChain.processItem(upc, { from: originFarmerID, gasPrice: '0' })
            await supplyChain.packItem(upc, { from: originFarmerID, gasPrice: '0' })
            await supplyChain.sellItem(upc, productPrice, { from: originFarmerID, gasPrice: '0' })
            const response = await supplyChain.buyItem(upc, { from: distributorID, value: web3.utils.toWei('2', "ether"), gasPrice: '0' })

            const newFarmerBalance = web3.utils.toBN(await web3.eth.getBalance(originFarmerID))
            const newDistributorBalance = web3.utils.toBN(await web3.eth.getBalance(distributorID))
            const deltaBalancerFarmer = web3.utils.fromWei(newFarmerBalance.sub(originalFarmerBalance), 'ether')
            const deltaBalanceDistributor = web3.utils.fromWei(newDistributorBalance.sub(originalDistributorBalance), 'ether')

            // check balance
            expect(deltaBalancerFarmer, 'Error: Farmer didnt get the right transfer amount').to.equal('1')
            expect(deltaBalanceDistributor, 'Error: Farmer didnt get the right change').to.equal('-1')

            itemState = 5

            // check event
            expectEvent(response, 'Sold', { upc: upc.toString() })

            // Retrieve the just now saved item from blockchain by calling function fetchItem()
            const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
            const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)
            // Verify the result set
            expect(resultBufferOne[0].toString(), 'Error: Invalid item SKU').to.equal(sku.toString())
            expect(resultBufferOne[1].toString(), 'Error: Invalid item UPC').to.equal(upc.toString())
            expect(resultBufferOne[2], 'Error: Missing or Invalid ownerID').to.equal(distributorID)
            expect(resultBufferOne[3], 'Error: Missing or Invalid originFarmerID').to.equal(originFarmerID)
            expect(resultBufferOne[4], 'Error: Missing or Invalid originFarmName').to.equal(originFarmName)
            expect(resultBufferOne[5], 'Error: Missing or Invalid originFarmInformation').to.equal(originFarmInformation)
            expect(resultBufferOne[6], 'Error: Missing or Invalid originFarmLatitude').to.equal(originFarmLatitude)
            expect(resultBufferOne[7], 'Error: Missing or Invalid originFarmLongitude').to.equal(originFarmLongitude)
            expect(resultBufferTwo[2].toString(), 'Error: Invalid productID').to.equal(productID.toString())
            expect(resultBufferTwo[3].toString(), 'Error: Invalid productNotes').to.equal(productNotes.toString())
            expect(resultBufferTwo[4].toString(), 'Error: Invalid productPrice').to.equal(productPrice.toString())
            expect(resultBufferTwo[5].toString(), 'Error: Invalid item State').to.equal(itemState.toString())
            expect(resultBufferTwo[6].toString(), 'Error: Invalid distributor address').to.equal(distributorID)
            expect(resultBufferTwo[7].toString(), 'Error: Invalid retailer address').to.equal(emptyAddress)
            expect(resultBufferTwo[8].toString(), 'Error: Invalid consumer address').to.equal(emptyAddress)
            expect(resultBufferTwo[9].toString(), 'Error: Invalid retail price').to.equal('0')

        })

        // 6th Test
        it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async () => {
            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
            await supplyChain.processItem(upc, { from: originFarmerID })
            await supplyChain.packItem(upc, { from: originFarmerID })
            await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })
            await supplyChain.buyItem(upc, { from: distributorID, value: web3.utils.toWei('2', "ether") })
            const response = await supplyChain.shipItem(upc, { from: distributorID })

            itemState = 6

            // check event
            expectEvent(response, 'Shipped', { upc: upc.toString() })

            // Retrieve the just now saved item from blockchain by calling function fetchItem()
            const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
            const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)
            // Verify the result set
            expect(resultBufferOne[0].toString(), 'Error: Invalid item SKU').to.equal(sku.toString())
            expect(resultBufferOne[1].toString(), 'Error: Invalid item UPC').to.equal(upc.toString())
            expect(resultBufferOne[2], 'Error: Missing or Invalid ownerID').to.equal(distributorID)
            expect(resultBufferOne[3], 'Error: Missing or Invalid originFarmerID').to.equal(originFarmerID)
            expect(resultBufferOne[4], 'Error: Missing or Invalid originFarmName').to.equal(originFarmName)
            expect(resultBufferOne[5], 'Error: Missing or Invalid originFarmInformation').to.equal(originFarmInformation)
            expect(resultBufferOne[6], 'Error: Missing or Invalid originFarmLatitude').to.equal(originFarmLatitude)
            expect(resultBufferOne[7], 'Error: Missing or Invalid originFarmLongitude').to.equal(originFarmLongitude)
            expect(resultBufferTwo[2].toString(), 'Error: Invalid productID').to.equal(productID.toString())
            expect(resultBufferTwo[3].toString(), 'Error: Invalid productNotes').to.equal(productNotes.toString())
            expect(resultBufferTwo[4].toString(), 'Error: Invalid productPrice').to.equal(productPrice.toString())
            expect(resultBufferTwo[5].toString(), 'Error: Invalid item State').to.equal(itemState.toString())
            expect(resultBufferTwo[6].toString(), 'Error: Invalid distributor address').to.equal(distributorID)
            expect(resultBufferTwo[7].toString(), 'Error: Invalid retailer address').to.equal(emptyAddress)
            expect(resultBufferTwo[8].toString(), 'Error: Invalid consumer address').to.equal(emptyAddress)
            expect(resultBufferTwo[9].toString(), 'Error: Invalid retail price').to.equal('0')

        })

        // 7th Test
        it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async () => {
            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
            await supplyChain.processItem(upc, { from: originFarmerID })
            await supplyChain.packItem(upc, { from: originFarmerID })
            await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })
            await supplyChain.buyItem(upc, { from: distributorID, value: web3.utils.toWei('2', "ether") })
            await supplyChain.shipItem(upc, { from: distributorID })
            const response = await supplyChain.receiveItem(upc, { from: retailerID })

            itemState = 7

            // check event
            expectEvent(response, 'Received', { upc: upc.toString() })

            // Retrieve the just now saved item from blockchain by calling function fetchItem()
            const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
            const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)
            // Verify the result set
            expect(resultBufferOne[0].toString(), 'Error: Invalid item SKU').to.equal(sku.toString())
            expect(resultBufferOne[1].toString(), 'Error: Invalid item UPC').to.equal(upc.toString())
            expect(resultBufferOne[2], 'Error: Missing or Invalid ownerID').to.equal(retailerID)
            expect(resultBufferOne[3], 'Error: Missing or Invalid originFarmerID').to.equal(originFarmerID)
            expect(resultBufferOne[4], 'Error: Missing or Invalid originFarmName').to.equal(originFarmName)
            expect(resultBufferOne[5], 'Error: Missing or Invalid originFarmInformation').to.equal(originFarmInformation)
            expect(resultBufferOne[6], 'Error: Missing or Invalid originFarmLatitude').to.equal(originFarmLatitude)
            expect(resultBufferOne[7], 'Error: Missing or Invalid originFarmLongitude').to.equal(originFarmLongitude)
            expect(resultBufferTwo[2].toString(), 'Error: Invalid productID').to.equal(productID.toString())
            expect(resultBufferTwo[3].toString(), 'Error: Invalid productNotes').to.equal(productNotes.toString())
            expect(resultBufferTwo[4].toString(), 'Error: Invalid productPrice').to.equal(productPrice.toString())
            expect(resultBufferTwo[5].toString(), 'Error: Invalid item State').to.equal(itemState.toString())
            expect(resultBufferTwo[6].toString(), 'Error: Invalid distributor address').to.equal(distributorID)
            expect(resultBufferTwo[7].toString(), 'Error: Invalid retailer address').to.equal(retailerID)
            expect(resultBufferTwo[8].toString(), 'Error: Invalid consumer address').to.equal(emptyAddress)
            expect(resultBufferTwo[9].toString(), 'Error: Invalid retail price').to.equal(retailPrice)

        })

        // 8th Test
        it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async () => {
            const originalRetailerBalance = web3.utils.toBN(await web3.eth.getBalance(retailerID))
            const originalConsumerBalance = web3.utils.toBN(await web3.eth.getBalance(consumerID))


            await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID, gasPrice: '0' })
            await supplyChain.processItem(upc, { from: originFarmerID, gasPrice: '0' })
            await supplyChain.packItem(upc, { from: originFarmerID, gasPrice: '0' })
            await supplyChain.sellItem(upc, productPrice, { from: originFarmerID, gasPrice: '0' })
            await supplyChain.buyItem(upc, { from: distributorID, value: web3.utils.toWei('2', "ether"), gasPrice: '0' })
            await supplyChain.shipItem(upc, { from: distributorID, gasPrice: '0' })
            await supplyChain.receiveItem(upc, { from: retailerID, gasPrice: '0' })
            const response = await supplyChain.purchaseItem(upc, { from: consumerID, value: web3.utils.toWei('2', "ether"), gasPrice: '0' })

            itemState = 8

            const newretailerBalance = web3.utils.toBN(await web3.eth.getBalance(retailerID))
            const newConsumerBalance = web3.utils.toBN(await web3.eth.getBalance(consumerID))
            const deltaRetailerFarmer = web3.utils.fromWei(newretailerBalance.sub(originalRetailerBalance), 'ether')
            const deltaConsumerBalance = web3.utils.fromWei(newConsumerBalance.sub(originalConsumerBalance), 'ether')

            // check balance
            expect(deltaRetailerFarmer, 'Error: Farmer didnt get the right transfer amount').to.equal('1.5')
            expect(deltaConsumerBalance, 'Error: Farmer didnt get the right change').to.equal('-1.5')

            // check event
            expectEvent(response, 'Purchased', { upc: upc.toString() })

            // Retrieve the just now saved item from blockchain by calling function fetchItem()
            const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc)
            const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc)
            // Verify the result set
            expect(resultBufferOne[0].toString(), 'Error: Invalid item SKU').to.equal(sku.toString())
            expect(resultBufferOne[1].toString(), 'Error: Invalid item UPC').to.equal(upc.toString())
            expect(resultBufferOne[2], 'Error: Missing or Invalid ownerID').to.equal(consumerID)
            expect(resultBufferOne[3], 'Error: Missing or Invalid originFarmerID').to.equal(originFarmerID)
            expect(resultBufferOne[4], 'Error: Missing or Invalid originFarmName').to.equal(originFarmName)
            expect(resultBufferOne[5], 'Error: Missing or Invalid originFarmInformation').to.equal(originFarmInformation)
            expect(resultBufferOne[6], 'Error: Missing or Invalid originFarmLatitude').to.equal(originFarmLatitude)
            expect(resultBufferOne[7], 'Error: Missing or Invalid originFarmLongitude').to.equal(originFarmLongitude)
            expect(resultBufferTwo[2].toString(), 'Error: Invalid productID').to.equal(productID.toString())
            expect(resultBufferTwo[3].toString(), 'Error: Invalid productNotes').to.equal(productNotes.toString())
            expect(resultBufferTwo[4].toString(), 'Error: Invalid productPrice').to.equal(productPrice.toString())
            expect(resultBufferTwo[5].toString(), 'Error: Invalid item State').to.equal(itemState.toString())
            expect(resultBufferTwo[6].toString(), 'Error: Invalid distributor address').to.equal(distributorID)
            expect(resultBufferTwo[7].toString(), 'Error: Invalid retailer address').to.equal(retailerID)
            expect(resultBufferTwo[8].toString(), 'Error: Invalid consumer address').to.equal(consumerID)
            expect(resultBufferTwo[9].toString(), 'Error: Invalid retail price').to.equal(retailPrice)

        })

        describe("additional test", () => {
            let tx1, tx2, tx3, tx4, tx5, tx6, tx7, tx8
    
            beforeEach(async () => {
                let res1 = await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
                tx1 = res1.tx
                await supplyChain.recordHistory(upc, tx1, { from: originFarmerID })
    
                let res2 = await supplyChain.processItem(upc, { from: originFarmerID })
                tx2 = res2.tx
                await supplyChain.recordHistory(upc, tx2, { from: originFarmerID })
    
                let res3 = await supplyChain.packItem(upc, { from: originFarmerID })
                tx3 = res3.tx
                await supplyChain.recordHistory(upc, tx3, { from: originFarmerID })
    
                let res4 = await supplyChain.sellItem(upc, productPrice, { from: originFarmerID })
                tx4 = res4.tx
                await supplyChain.recordHistory(upc, tx4, { from: originFarmerID })
    
                let res5 = await supplyChain.buyItem(upc, { from: distributorID, value: web3.utils.toWei('2', "ether") })
                tx5 = res5.tx
                await supplyChain.recordHistory(upc, tx5, { from: distributorID })
    
                let res6 = await supplyChain.shipItem(upc, { from: distributorID })
                tx6 = res6.tx
                await supplyChain.recordHistory(upc, tx6, { from: distributorID })
    
                let res7 = await supplyChain.receiveItem(upc, { from: retailerID })
                tx7 = res7.tx
                await supplyChain.recordHistory(upc, tx7, { from: retailerID })
    
                let res8 = await supplyChain.purchaseItem(upc, { from: consumerID, value: web3.utils.toWei('2', "ether") })
                tx8 = res8.tx
                await supplyChain.recordHistory(upc, tx8, { from: consumerID })
            })
    
            // 9th Test
            it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async () => {
    
                const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc, { from: unknownActor })
                expect(resultBufferOne[0].toString(), 'Error: Invalid item SKU').to.equal(sku.toString())
                expect(resultBufferOne[1].toString(), 'Error: Invalid item UPC').to.equal(upc.toString())
                expect(resultBufferOne[2], 'Error: Missing or Invalid ownerID').to.equal(consumerID)
                expect(resultBufferOne[3], 'Error: Missing or Invalid originFarmerID').to.equal(originFarmerID)
                expect(resultBufferOne[4], 'Error: Missing or Invalid originFarmName').to.equal(originFarmName)
                expect(resultBufferOne[5], 'Error: Missing or Invalid originFarmInformation').to.equal(originFarmInformation)
                expect(resultBufferOne[6], 'Error: Missing or Invalid originFarmLatitude').to.equal(originFarmLatitude)
                expect(resultBufferOne[7], 'Error: Missing or Invalid originFarmLongitude').to.equal(originFarmLongitude)
    
            })
    
            // 10th Test
            it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async () => {
    
                const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc, { from: unknownActor })
                expect(resultBufferTwo[2].toString(), 'Error: Invalid productID').to.equal(productID.toString())
                expect(resultBufferTwo[3].toString(), 'Error: Invalid productNotes').to.equal(productNotes.toString())
                expect(resultBufferTwo[4].toString(), 'Error: Invalid productPrice').to.equal(productPrice.toString())
                expect(resultBufferTwo[5].toString(), 'Error: Invalid item State').to.equal(itemState.toString())
                expect(resultBufferTwo[6].toString(), 'Error: Invalid distributor address').to.equal(distributorID)
                expect(resultBufferTwo[7].toString(), 'Error: Invalid retailer address').to.equal(retailerID)
                expect(resultBufferTwo[8].toString(), 'Error: Invalid consumer address').to.equal(consumerID)
                expect(resultBufferTwo[9].toString(), 'Error: Invalid retail price').to.equal(retailPrice)
    
            })
    
    
            // 11 test check the SKU is incremented once a new item is harvested
            it("Testing SKU incremented once a new product is farmed", async () => {
                // farm again
                upc += upc
                await supplyChain.harvestItem(upc, originFarmerID, originFarmName, originFarmInformation, originFarmLatitude, originFarmLongitude, productNotes, { from: originFarmerID })
                sku += sku
                productID = sku + upc
    
                const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc, { from: unknownActor })
                expect(resultBufferOne[0].toString(), 'Error: Invalid item SKU').to.equal(sku.toString())
                expect(resultBufferOne[1].toString(), 'Error: Invalid item UPC').to.equal(upc.toString())
    
                const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc, { from: unknownActor })
                expect(resultBufferTwo[2].toString(), 'Error: Invalid productID').to.equal(productID.toString())
    
    
            })
    
            // 12 test all transactions have been recorded
            it("Testing that all transactionas have been recorded", async () => {
    
                let transactionHistory = await supplyChain.getItemHistory(upc)
    
                expect(transactionHistory.length, 'Transaction history must contain exactly one element').to.equal(8)
                expect(transactionHistory.includes(tx1), 'Transaction not found in history').to.equal(true)
                expect(transactionHistory.includes(tx2), 'Transaction not found in history').to.equal(true)
                expect(transactionHistory.includes(tx3), 'Transaction not found in history').to.equal(true)
                expect(transactionHistory.includes(tx4), 'Transaction not found in history').to.equal(true)
                expect(transactionHistory.includes(tx5), 'Transaction not found in history').to.equal(true)
                expect(transactionHistory.includes(tx6), 'Transaction not found in history').to.equal(true)
                expect(transactionHistory.includes(tx7), 'Transaction not found in history').to.equal(true)
                expect(transactionHistory.includes(tx8), 'Transaction not found in history').to.equal(true)
            })
        })
    })
});

