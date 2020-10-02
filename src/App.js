import React, { Component } from 'react'
import { Map as GoogleMap, GoogleApiWrapper, Circle, Marker, InfoWindow } from 'google-maps-react'
import geocode from './data/geocode.json'
import counts from './data/counts.json'
import { CustomSelect } from './Components/CustomSelect'

require('dotenv').config()

// const apiKey = process.env.REACT_APP_GOOGLE_API_KEY
const apiKey = undefined


class App extends Component {
  amplifier = 500000

  color = '#FF0000'

  constructor(props) {
    super(props)

    this.state = {
      center: {
        lat: 57.326892,
        lng: -99.805787
      },
      mappedGeocode: new Map(),
      mapType: 'Marker',
      showingInfoWindow: false,
      activeMarker: {},
      selectedPlace: {}
    }
  }

  componentDidMount = async () => {
    this.mapGeocode()
    await this.getCounts()
  }

  mapGeocode = () => {
    const { mappedGeocode } = this.state

    geocode.forEach((row) => mappedGeocode.set(row.locationId, row))

    this.setState({ mappedGeocode })
  }

  getCounts = async () => {
    try {
      // const res = await axios('/api/v1/sales/totalCount')

      const { mappedGeocode } = this.state

      const minCount = counts[0].count
      const maxCount = counts[counts.length - 1].count

      counts.forEach((row) => {
        const normalizedNumber = this.normalizeCount(row.count, minCount, maxCount)

        mappedGeocode.set(row.locationId, {
          ...mappedGeocode.get(row.locationId),
          count: row.count,
          normalizedNumber: normalizedNumber * this.amplifier
        })
      })

      this.setState({ mappedGeocode })
    } catch (error) {
      console.log(error)
    }
  }

  // Assumption: the count array is in asc order
  normalizeCount = (count, min, max) => (count - min) / (max - min)

  onMarkerClick = (props, marker, e) => this.setState({
    selectedPlace: props,
    activeMarker: marker,
    showingInfoWindow: true
  })

  setMapType = (mapType) => this.setState({
    mapType,
    showingInfoWindow: false
  })

  render() {
    const { center, mappedGeocode, mapType, activeMarker, showingInfoWindow, selectedPlace } = this.state
    return (
      <>
        <CustomSelect
          setMapType={this.setMapType}
        />
        <GoogleMap
          google={this.props.google}
          zoom={4}
          style={{
            width: '100%',
            height: '100%'
          }}
          initialCenter={center}
          center={center}
        >

          {
            [...mappedGeocode.values()].map((geocodeRow, index) => (
              mapType === 'Marker'
                ? (
                  <Marker
                    key={index}
                    onClick={this.onMarkerClick}
                    title={geocodeRow.companyName}
                    name={geocodeRow.companyName}
                    count={geocodeRow.count}
                    position={{ lat: geocodeRow.lat, lng: geocodeRow.lng }}
                  />
                )
                : (
                  <Circle
                    key={index}
                    radius={geocodeRow.normalizedNumber}
                    center={{ lat: geocodeRow.lat, lng: geocodeRow.lng }}
                    strokeColor={this.color}
                    strokeOpacity={0.1}
                    strokeWeight={5}
                    fillColor={this.color}
                    fillOpacity={0.2}
                  />
                )
            ))
          }

          <InfoWindow
            marker={activeMarker}
            visible={showingInfoWindow}
          >
            <div>
              <h1>{selectedPlace.name}</h1>
              <h2>{`Sales count: ${selectedPlace.count}`}</h2>
            </div>
          </InfoWindow>
        </GoogleMap>
      </>
    )
  }
}

export default GoogleApiWrapper({ apiKey })(App)
