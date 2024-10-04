/* global fetch */

import { parse, toSeconds } from 'iso8601-duration'

// https://www.digitransit.fi/en/developers/third-party-apis/
const VEHICLE_ACTIVITY_URL =
  'http://data.itsfactory.fi/journeys/api/1/vehicle-activity'

const LINES = [
  '1',
  '3',
  '4',
  '5',
  '9',
  '19',
  '27',
  '40',
  '40A',
  '40B',
  '40C',
  '40D',
  '41',
  '42',
  '43',
  '43S',
  '43T',
  '43ST',
  '43U',
]

const durationToSeconds = duration => toSeconds(parse(duration))

const convertVehicleJourney = ({
  lineRef,
  journeyPatternRef,
  vehicleRef,
  vehicleLocation: { latitude, longitude },
  bearing,
  delay,
  speed,
}) => ({
  lineRef,
  journeyPatternRef,
  vehicleRef,
  location: {
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
  },
  bearing: parseFloat(bearing),
  delay: durationToSeconds(delay),
  speed,
})

const getEssentialInfo = ({ body }) =>
  body
    .map(({ monitoredVehicleJourney }) =>
      convertVehicleJourney(monitoredVehicleJourney),
    )
    .filter(({ journeyPatternRef }) => LINES.includes(journeyPatternRef))
    .reduce((obj, busData, idx) => {
      const { vehicleRef } = busData
      // Check if the key has already been used
      const key = obj[vehicleRef] ? `${vehicleRef}-at-index-${idx}` : vehicleRef
      obj[key] = busData
      return obj
    }, {})

const createResponse = responseData => ({
  status: '200',
  statusDescription: 'OK',
  headers: {
    // Required for CORS support to work
    'access-control-allow-origin': [
      {
        key: 'Access-Control-Allow-Origin',
        value: '*',
      },
    ],
    'content-type': [
      {
        key: 'Content-Type',
        value: 'application/json',
      },
    ],
  },
  body: JSON.stringify(responseData),
})

const fetchBusData = () => {
  const url =
    `${VEHICLE_ACTIVITY_URL}?lineRef=${LINES.join()}` +
    '&exclude-fields=monitoredVehicleJourney.onwardCalls'
  return fetch(url)
    .then(res => res.json())
    .then(getEssentialInfo)
}

export const handler = async event => {
  const busData = await fetchBusData()
  return createResponse(busData)
}
