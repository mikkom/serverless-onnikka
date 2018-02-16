'use strict';

const fetch = require('node-fetch');
const moment = require('moment');

const LINES = ['3', '5', '24'];
const JOURNEY_PATTERN_REFS = ['3A', '3B', '5', '24'];

const durationToSeconds = duration => moment.duration(duration).asSeconds();

const convertVehicleJourney = ({
  lineRef,
  journeyPatternRef,
  vehicleRef,
  vehicleLocation: { latitude, longitude },
  bearing,
  delay,
  speed
}) => ({
  lineRef,
  journeyPatternRef,
  vehicleRef,
  location: {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude)
  },
  bearing: parseFloat(bearing),
  delay: durationToSeconds(delay),
  speed
});

const getEssentialInfo = ({ body }) =>
  body
    .map(({ monitoredVehicleJourney }) =>
      convertVehicleJourney(monitoredVehicleJourney)
    )
    .filter(({ journeyPatternRef }) => JOURNEY_PATTERN_REFS.includes(journeyPatternRef));

const createResponse = responseData => ({
  statusCode: 200,
  headers: {
    'Access-Control-Allow-Origin': '*' // Required for CORS support to work
  },
  body: JSON.stringify(responseData)
});

const fetchData = callback => {
  const url = `http://data.itsfactory.fi/journeys/api/1/vehicle-activity?lineRef=${LINES.join()}`;
  fetch(url)
    .then(res => res.json())
    .then(getEssentialInfo)
    .then(createResponse)
    .then(response => callback(null, response));
};

module.exports.hello = (event, context, callback) => {
  fetchData(callback);

  // callback(null, response);

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
};
