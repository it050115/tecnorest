const log = require("../util/log")(__filename)
const config = require("../config/environment.js")()
const axios = require("axios")
const HttpError = require("./http-error")
//const API_KEY = "AIzaSyDgLmMpKCzveJf1_yuA0fUzzhy0WRChvZA" //mapKey

async function getCoordsForAddress(address) {
	// return {
	//   lat: 40.7484474,
	//   lng: -73.9871516
	// };
	const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${config.google.mapKey}`)

	const data = response.data

	if (!data || data.status === "ZERO_RESULTS") {
		const error = new HttpError("Could not find location for the specified address.", 422)
		throw error
	}

	const coordinates = data.results[0].geometry.location

	return coordinates
}

module.exports = { getCoordsForAddress }
