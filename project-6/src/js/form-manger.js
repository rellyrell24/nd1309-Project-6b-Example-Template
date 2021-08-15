let readFarmerForm = () => {
    return {
        upc: $("#upc_farmer").val(),
        originFarmName: $("#originFarmName_farmer").val(),
        originFarmInformation: $("#originFarmInformation_farmer").val(),
        originFarmLatitude: $("#originFarmLatitude_farmer").val(),
        originFarmLongitude: $("#originFarmLongitude_farmer").val(),
        productNotes: $("#productNotes_farmer").val(),
        productPrice: $("#productPrice_farmer").val()
    }

}

let readDistributorForm = () => {
    return {
        upc: $("#upc_distributor").val(),
        productPrice: $("#productPrice_distributor").val()
    }

}

let readRetailerForm = () => {
    return {
        upc: $("#upc_retailer").val()
    }

}

let readConsumerForm = () => {
    return {
        upc: $("#upc_consumer").val(),
        retailPrice: $("#retailPrice_consumer").val()
    }

}

let readHistoryForm = () => {
    return {
        upc: $("#upc_history").val()
    }

}

let bufferOneWriter = (result) => {

    $("#sku_result").html(result[0])
    $("#upc_result").html(result[1])
    $("#ownerID_result").html(result[2])
    $("#originFarmerID_result").html(result[3])
    $("#originFarmName_result").html(result[4])
    $("#originFarmInformation_result").html(result[5])
    $("#originFarmLatitude_result").html(result[6])
    $("#originFarmLongitude_result").html(result[7])
}

let bufferTwoWriter = (result) => {

    $("#productID_result").html(result[2])
    $("#distributorID_result").html(result[6])
    $("#retailerID_result").html(result[7])
    $("#consumerID_result").html(result[8])
    $("#productNotes_result").html(result[3])
    $("#productPrice_result").html(result[4])
    $("#retailPrice_result").html(result[9])

    let state
    switch (result[5]) {
        case '0':
            state = 'None'
            break
        case '1':
            state = 'Harvested'
            break
        case '2':
            state = 'Processed'
            break
        case '3':
            state = 'Packed'
            break
        case '4':
            state = 'ForSale'
            break
        case '5':
            state = 'Sold'
            break
        case '6':
            state = 'Shipped'
            break
        case '7':
            state = 'Received'
            break
        case '8':
            state = 'Purchased'
            break
        default:
            throw new Error(`State ${result[5]} is not correct`)
    }

    $("#itemState_result").html(state)

}



export { readFarmerForm, readDistributorForm, readRetailerForm, readConsumerForm, bufferOneWriter, bufferTwoWriter, readHistoryForm }