// validateAddress.js
const SmartyStreetsSDK = require("smartystreets-javascript-sdk");
const SmartyStreetsCore = SmartyStreetsSDK.core;
const Lookup = SmartyStreetsSDK.usStreet.Lookup;
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Setup SmartyStreets API credentials from environment variables
const authId = process.env.SMARTYSTREETS_AUTH_ID;
const authToken = process.env.SMARTYSTREETS_AUTH_TOKEN;

let clientBuilder = new SmartyStreetsCore.ClientBuilder(new SmartyStreetsCore.StaticCredentials(authId, authToken));
let client = clientBuilder.buildUsStreetApiClient();

// Main function to validate address
async function addressValidation_controller(address) {
    try {
        const result = await validateAddress(address);
        console.log(result); // Output will be 1 if the address is valid
        return result;
    } catch (error) {
        console.error(error);
        return -1; // Return -1 if the address is invalid
    }
}

// Address validation logic
async function validateAddress(address) {
    let lookup = new Lookup();
    lookup.street = address.line1;
    lookup.city = address.city;
    lookup.state = address.state;
    lookup.maxCandidates = 10; // Max candidates to return

    try {
        // Send the request to SmartyStreets API
        let response = await client.send(lookup);
        return handleSuccess(response);
    } catch (error) {
        return handleError(error);
    }
}

// Success handler after receiving a response from SmartyStreets
async function handleSuccess(response) {
    let lookup = response.lookups[0];
    // Print the results
    lookup.result.map(candidate => console.log(`${candidate.deliveryLine1}, ${candidate.lastLine}`));
    if (lookup.result.length > 0) {
        return 1; // Return 1 if a valid address is found
    } else {
        return -1; // Return -1 if no valid address is found
    }
}

// Error handler
async function handleError(response) {
    console.log(response);
    return -1; // Return -1 if an error occurs
}

module.exports = { addressValidation_controller };
