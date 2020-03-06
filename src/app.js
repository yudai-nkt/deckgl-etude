/* global window */
import React, { Component } from 'react'
import { render } from 'react-dom'
import { StaticMap, FullscreenControl } from 'react-map-gl'
import DeckGL from '@deck.gl/react'
import { TripsLayer } from '@deck.gl/geo-layers'

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken

// Source data CSV
const DATA_URL = {
  TRIPS:
    'https://gist.githubusercontent.com/yudai-nkt/80bdbecde74ea431c755e31fa167451d/raw/6b37fadcd38a009eeec6e732439b1eb6a47e7a19/tmp.json'
}

const DEFAULT_THEME = {
  aizu_BL_01_3: [0, 139, 148],
  aizu_BL_01_13: [217, 84, 104],
  aizu_BL_01_1: [217, 142, 72],
  aizu_BL_01_10: [139, 212, 156],
  aizu_BL_01_20: [83, 154, 252]
}

const INITIAL_VIEW_STATE = {
  // Aizuwakamatsu
  longitude: 139.91,
  latitude: 37.48,
  zoom: 13,
  pitch: 45,
  bearing: -30
}

const DEFAULT_ONSET_TIME = new Date('2018-04-03T10:00:00')

export default class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      time: 0,
      onsetTime: DEFAULT_ONSET_TIME,
      correspondingTime: ''
    }
  }

  componentDidMount () {
    this._animate()
  }

  componentWillUnmount () {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame)
    }
  }

  getHumanReadableTime (datetime) {
    const date = `${datetime.toLocaleString('en-US', { month: 'long' })} ${datetime.getDay()}, ${datetime.getFullYear()}`
    const time = `${datetime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`

    return `${date}, ${time}`
  }

  _animate () {
    const {
      timeSpan = 3600, // unit corresponds to the timestamp in source data
      framesPerSecond = 60 // unit time per second
    } = this.props
    const currTime = Date.now() / 1000
    const animationPeriod = timeSpan / framesPerSecond
    const elapsedTime = ((currTime % animationPeriod) / animationPeriod) * timeSpan
    const newCorrespondingTime = this.getHumanReadableTime(new Date(this.state.onsetTime.getTime() + elapsedTime * 1000))

    this.setState({
      time: elapsedTime,
      correspondingTime: newCorrespondingTime
    })
    this._animationFrame = window.requestAnimationFrame(this._animate.bind(this))
  }

  _renderLayers () {
    const {
      trips = DATA_URL.TRIPS,
      trailLength = 60,
      theme = DEFAULT_THEME
    } = this.props

    return [
      new TripsLayer({
        id: 'trips',
        data: trips,
        getPath: d => d.path,
        getWidth: d => 25,
        getTimestamps: d => d.timestamps,
        getColor: d => theme[d.vendor],
        opacity: 0.3,
        widthMinPixels: 2,
        rounded: true,
        trailLength,
        currentTime: this.state.time,

        shadowEnabled: false
      })
    ]
  }

  render () {
    const {
      viewState,
      mapStyle = 'mapbox://styles/mapbox/dark-v9'
    } = this.props

    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller
      >
        <div style={{ position: 'absolute', right: 10, top: 10 }}>
          <FullscreenControl container={document.querySelector('body')} />
        </div>
        <StaticMap
          reuseMaps
          mapStyle={mapStyle}
          preventStyleDiffing
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />
        <div>
          <h1>{this.state.correspondingTime}</h1>
        </div>
      </DeckGL>
    )
  }
}

export function renderToDOM (container) {
  render(<App />, container)
}
