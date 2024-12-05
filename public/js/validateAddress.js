require('dotenv').config(); // Load environment variables from .env file
const fetch = require('node-fetch'); // Use fetch for HTTP requests

const validateAddress = async (address) => {
  const authId = process.env.SMARTYSTREETS_AUTH_ID; // Load from .env
  const authToken = process.env.SMARTYSTREETS_AUTH_TOKEN; // Load from .env

  if (!authId || !authToken) {
    console.error('Error: Missing SMARTYSTREETS_AUTH_ID or SMARTYSTREETS_AUTH_TOKEN in .env');
    return -1; // Missing authentication
  }

  const baseUrl = 'https://us-street.api.smartystreets.com/street-address';

  // Build the query string with parameters
  const queryParams = new URLSearchParams({
    street: address.line1,
    city: address.city,
    state: address.state,
    'auth-id': authId,
    'auth-token': authToken,
  });

  try {
    // Make the GET request
    const response = await fetch(`${baseUrl}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Handle the response
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      return -1; // Address validation failed
    }

    const result = await response.json();

    // Check if the address is valid
    if (result.length > 0 && result[0].metadata) {
      const dpvMatchCode = result[0].metadata.dpv_match_code;

      // Match codes: 'Y', 'S', 'D' indicate valid addresses
      if (['Y', 'S', 'D'].includes(dpvMatchCode)) {
        return 1; // Valid address
      }
    }

    return -1; // Invalid address
  } catch (error) {
    console.error('Error during address validation:', error);
    return -1; // Return -1 on error
  }
};

module.exports = { validateAddress };
