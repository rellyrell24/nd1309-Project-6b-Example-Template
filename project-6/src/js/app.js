import '../css/style.css'
import supplyChainArtifact from '../../build/contracts/SupplyChain.json'
import { readFarmerForm, readDistributorForm, readRetailerForm, readConsumerForm, bufferOneWriter, bufferTwoWriter, readHistoryForm } from './form-manager.js'


let timestampToHumanFormat = (timestamp) => {
     // timestamp from ETH is in seconds
    let date = new Date(timestamp * 1000)
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
}

let parseEvent = async (log) => {
    const { web3 } = App
    try {
        let blockNumber = log.blockNumber
        let block = await web3.eth.getBlock(blockNumber)
        let timestamp = block.timestamp
        let timestampInHumanFormat = timestampToHumanFormat(timestamp)
        let returnValues = log.returnValues

        $("#ftc-events").append('<li>' + timestampInHumanFormat + ' - ' + log.event + ' - ' + log.transactionHash + ' - ' + JSON.stringify(returnValues) + '</li>')
    } catch (error) {
        console.log('error while parsing event', error)
        throw new Error('Error parsing event')
    }
}


let App = {
    web3Provider: null,
    web3: null,
    meta: null,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    init: async function () {
        /// Setup access to blockchain
        await App.initWeb3()
        await App.initSupplyChain()
        await App.getMetaskAccountID()
        window.ethereum.on('accountsChanged', App.getMetaskAccountID)

        // button events
        App.bindEvents()

        // Get the tab with id="defaultOpen" and click on it
        $("#defaultOpen").click();
    },

    initWeb3: async function () {
        /// Find or Inject Web3 Provider
        /// Modern dapp browsers...
        console.log(window.ethereum)
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await ethereum
                    .request({ method: 'eth_requestAccounts' })
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
           throw new Error('Metamask not installed')
        }

        App.web3 = new Web3(App.web3Provider)
    },

    getMetaskAccountID: async function () {
        const { web3 } = App

        try {

            const accounts = await web3.eth.getAccounts()
            App.metamaskAccountID = accounts[0]
            App.meta.defaultAccount = accounts[0]
            $(".currentUser").html(accounts[0])
        } catch (error) {
            console.log('Error while retrieving current account:', error)
            return

        }
    },

    initSupplyChain: async function () {
        const { web3 } = App
        try {
            // get contract instance
            const networkId = await web3.eth.net.getId()
            const deployedNetwork = supplyChainArtifact.networks[networkId]
            console.log('networkid ', networkId)
            console.log('deployedNetwork address,', deployedNetwork.address)
            App.meta = await new web3.eth.Contract(
                supplyChainArtifact.abi,
                deployedNetwork.address,
            )

            let owner = await App.meta.methods.owner().call()

            console.log('contract owner init ', owner)
        } catch (error) {
            console.error("Could not connect to contract or chain.", error)
            return
        }
        await App.fetchEvents()
    },

    bindEvents: function () {
        $(document).on('click', App.handleButtonClick)
    },

    handleButtonClick: async function (event) {
        let className = $(event.target).attr('class')
        switch (className) {
            case 'tablink':
                event.preventDefault()
                let name =  $(event.target).attr('name')
                $('.tabcontent').css('display', 'none')

                $('#'+name).css('display', 'block')
                //$(elementId).style.display = "block"
                break

            case 'supply-chain':
                event.preventDefault()
                let processId = parseInt($(event.target).data('id'))
                switch (processId) {
                    case 1:
                        await App.harvestItem()
                        break
                    case 2:
                        await App.processItem()
                        break
                    case 3:
                        await App.packItem()
                        break
                    case 4:
                        await App.sellItem()
                        break
                    case 5:
                        await App.buyItem()
                        break
                    case 6:
                        await App.shipItem()
                        break
                    case 7:
                        await App.receiveItem()
                        break
                    case 8:
                        await App.purchaseItem()
                        break
                    case 9:
                        await App.fetchItemBufferOne()
                        await App.fetchItemBufferTwo()
                        break
                    case 10:
                        await App.getItemHistory()
                        break
                    default:
                        throw new Error(`Processid ${processId} not managed`)
                }

                break

            case 'btn-roleassignment':
                event.preventDefault()
                let selectedRole = $('#roles option:selected').val()
                let address = $('#address_role').val().trim()
                if (!!address === false) {
                    throw new Error('Address is role assignment cannot be empty!')
                }
                else {
                    console.log(`Assigning ${selectedRole} role to adress: ${address}`)
                }
                switch (selectedRole) {
                    case 'farmer':
                        App.assignFarmerRole(address)
                        break
                    case 'distributor':
                        App.assignDistributorRole(address)
                        break
                    case 'retailer':
                        App.assignRetailerRole(address)
                        break
                    case 'consumer':
                        App.assignConsumerRole(address)
                        break
                    default:
                        throw new Error(`Role ${selectedRole} not managed`)
                }
                break
            default:
                return

        }

    },

    harvestItem: async function () {
        const { harvestItem, recordHistory } = App.meta.methods
        let farmerDetails = readFarmerForm()
        try {
            let result = await harvestItem(farmerDetails.upc,
                App.metamaskAccountID,
                farmerDetails.originFarmName,
                farmerDetails.originFarmInformation,
                farmerDetails.originFarmLatitude,
                farmerDetails.originFarmLongitude,
                farmerDetails.productNotes).send({ from: App.metamaskAccountID })
            console.log('harvestItem', result)
            await recordHistory(farmerDetails.upc, result.transactionHash).send({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while harvesting item.', error)
            return
        }
    },

    processItem: async function () {
        const { processItem, recordHistory } = App.meta.methods
        let farmerDetails = readFarmerForm()

        try {
            let result = await processItem(farmerDetails.upc).send({ from: App.metamaskAccountID })
            console.log('processItem', result)
            await recordHistory(farmerDetails.upc, result.transactionHash).send({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while processing item.', error)
            return
        }
    },

    packItem: async function () {
        const { packItem, recordHistory } = App.meta.methods
        let farmerDetails = readFarmerForm()
        try {
            let result = await packItem(farmerDetails.upc).send({ from: App.metamaskAccountID })
            console.log('packItem', result)
            await recordHistory(farmerDetails.upc, result.transactionHash).send({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while packing item.', error)
            return
        }
    },

    sellItem: async function () {
        const { sellItem, recordHistory } = App.meta.methods
        let farmerDetails = readFarmerForm()
        const productPrice = App.web3.utils.toWei(farmerDetails.productPrice, "ether")
        try {
            let result = await sellItem(farmerDetails.upc, productPrice).send({ from: App.metamaskAccountID })
            console.log('sellItem', result)
            await recordHistory(farmerDetails.upc, result.transactionHash).send({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while selling item.', error)
            return
        }
    },

    buyItem: async function () {
        const { buyItem, recordHistory } = App.meta.methods
        let distributorDetails = readDistributorForm()
        const productPrice = App.web3.utils.toWei(distributorDetails.productPrice, "ether")

        try {
            let result = await buyItem(distributorDetails.upc).send({ from: App.metamaskAccountID, value: productPrice })
            console.log('buyItem', result)
            await recordHistory(distributorDetails.upc, result.transactionHash).send({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while buying item.', error)
            return
        }
    },

    shipItem: async function () {
        const { shipItem, recordHistory } = App.meta.methods
        let distributorDetails = readDistributorForm()

        try {
            let result = await shipItem(distributorDetails.upc).send({ from: App.metamaskAccountID })
            console.log('shipItem', result)
            await recordHistory(distributorDetails.upc, result.transactionHash).send({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while shipping item.', error)
            return
        }
    },

    receiveItem: async function () {
        const { receiveItem, recordHistory } = App.meta.methods
        let retailerDetails = readRetailerForm()

        try {
            let result = await receiveItem(retailerDetails.upc).send({ from: App.metamaskAccountID })
            console.log('receiveItem', result)
            await recordHistory(retailerDetails.upc, result.transactionHash).send({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while receiving item.', error)
            return
        }
    },

    purchaseItem: async function () {
        const { purchaseItem, recordHistory } = App.meta.methods
        let consumerDetails = readConsumerForm()
        const productPrice = App.web3.utils.toWei(consumerDetails.retailPrice, "ether")

        try {
            let result = await purchaseItem(consumerDetails.upc).send({ from: App.metamaskAccountID, value: productPrice })
            console.log('purchaseItem', result)
            await recordHistory(consumerDetails.upc, result.transactionHash).send({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while purchasing item.', error)
            return
        }
    },
    getItemHistory: async function () {
        const { getItemHistory } = App.meta.methods
        let historyDetails = readHistoryForm()
        try {
            let result = await getItemHistory(historyDetails.upc).call()
            console.log('purchaseItem', result)
            $("#ftc-history").html('')
            result.forEach(res => {
                $("#ftc-history").append('<li>' + res + '</li>')
            })
        } catch (error) {
            console.log('Error while fetching history of item.', error)
            return
        }

    },

    fetchItemBufferOne: async function () {
        let upc = $('#upc_overview').val()
        const { fetchItemBufferOne } = App.meta.methods

        try {
            let result = await fetchItemBufferOne(upc).call()
            console.log('fetchItemBufferOne', result)
            bufferOneWriter(result)
        } catch (error) {
            console.log(error)
            throw new Error('Error while fetching Item buffer one.')
        }

    },

    fetchItemBufferTwo: async function () {
        let upc = $('#upc_overview').val()
        const { fetchItemBufferTwo } = App.meta.methods

        try {
            let result = await fetchItemBufferTwo(upc).call()
            console.log('fetchItemBufferTwo', result)
            //format product price
            result[4] = App.web3.utils.fromWei(result[4], 'ether')
            //format retail price
            result[9] = App.web3.utils.fromWei(result[9], 'ether')
            bufferTwoWriter(result)
        } catch (error) {
            console.log('Error while fetching Item buffer two.', error)
            return
        }
    },
    assignFarmerRole: async function (address) {
        const { assignFarmerRole } = App.meta.methods
        try {
            await assignFarmerRole(address).send({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while assigning farmer role', error)
            return
        }
    },
    assignDistributorRole: async function (address) {
        const { assignDistributorRole } = App.meta.methods
        try {
            await assignDistributorRole(address).send({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while assigning distributor role', error)
            return
        }
    },
    assignRetailerRole: async function (address) {
        const { assignRetailerRole } = App.meta.methods
        try {
            await assignRetailerRole(address).send({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while assigning retailer role', error)
            return
        }
    },
    assignConsumerRole: async function (address) {
        const { assignConsumerRole } = App.meta.methods
        try {
            await assignConsumerRole(address).send({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while assigning consumeer role', error)
            return
        }
    },

    fetchEvents: async function () {
        try {
            let events = await App.meta.getPastEvents('allEvents', { fromBlock: 0, toBlock: 'latest' })
            events.forEach(async (log) => {
                parseEvent(log)
            })
        } catch (error) {
            console.log('error while fetching events.', error)
            throw new Error('Error while fetching events')
        }

        // add subscription to automatically refresh events
        await App.meta.events.allEvents().on('data', log => {
            console.log('received event: ', log)
            parseEvent(log)

        }).on('error', (error, receipt) => {
            console.log('received event error: ', error)
            console.log('received recept error: ', receipt)
            parseEvent(receipt)
        })
    }
};

$(window).on('load', function () {

    App.init();
})