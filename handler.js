'use strict';

const fetch = require('node-fetch');

const getEssentialInfo = res => res.body.map(({ monitoredVehicleJourney }) => {
    const {
      lineRef,
      vehicleLocation: { longitude, latitude },
      bearing,
      delay
    } = monitoredVehicleJourney;

    return {
      lineRef,
      longitude,
      latitude,
      bearing,
      delay
    }
  });

const fetchData = (callback) => {
  const createResponse = body => ({
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    },
    body: JSON.stringify(body)
  });

  const url = 'http://data.itsfactory.fi/journeys/api/1/vehicle-activity?lineRef=5';
  fetch(url)
    .then(res => res.json())
    .then(getEssentialInfo)
    .then(json => callback(null, createResponse(json)))
}

module.exports.hello = (event, context, callback) => {
  fetchData(callback);

  // callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
