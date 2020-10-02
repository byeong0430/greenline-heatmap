require('dotenv').config()

const { default: Axios } = require('axios')
const csv = require('csv-parser')
const fs = require('fs')
const json = []

// Reference: https://stackoverflow.com/questions/40172921/how-to-add-new-column-to-csv-file-using-node-js

const Headers = {
  COMPANY_NAME: 'Deal - Organization',
  LOCATION_ID: 'Deal - (OB) Location ID',
  ADDRESS: 'Deal - (OB) Store Address'
}

const getLatLng = async (row) => {
  if (row[Headers.LOCATION_ID] === '' || row[Headers.ADDRESS] === '') return

  try {
    const address = row[Headers.ADDRESS].replace(' ', '+')

    const res = await Axios({
      baseURL: 'https://maps.googleapis.com/maps/api/geocode/json',
      params: {
        address,
        key: process.env.REACT_APP_GOOGLE_API_KEY
      }
    })

    if (res.data.status === 'OK') {
      const { lat, lng } = res.data.results[0].geometry.location

      json.push({
        locationId: row[Headers.LOCATION_ID],
        companyName: row[Headers.COMPANY_NAME],
        address: row[Headers.ADDRESS],
        lat,
        lng
      })
    }
  } catch (error) {
    throw new Error(error)
  }
}

(() => {
  new Promise((resolve, reject) => {
    const promises = []

    fs.createReadStream('./files/deals-3698740-37.csv')
      .pipe(csv())
      .on('data', row => promises.push(getLatLng(row)))
      .on('end', async () => {
        await Promise.all(promises)

        fs.writeFile('./files/geocode.json', JSON.stringify(json), error => {
          if (error) throw error
        })

        console.log('CSV file successfully processed')
      })
  })
})()
