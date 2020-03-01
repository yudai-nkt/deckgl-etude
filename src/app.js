/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import {PolygonLayer} from '@deck.gl/layers';
import {TripsLayer} from '@deck.gl/geo-layers';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL = {
  TRIPS:
    'https://gist.githubusercontent.com/yudai-nkt/80bdbecde74ea431c755e31fa167451d/raw/6b37fadcd38a009eeec6e732439b1eb6a47e7a19/tmp.json'
};

const DEFAULT_THEME = {
  aizu_BL_01_3: [0, 139, 148],
  aizu_BL_01_13: [217, 84, 104],
  aizu_BL_01_1: [217, 142, 72],
  aizu_BL_01_10: [139, 212, 156],
  aizu_BL_01_20: [83, 154, 252]
};

const INITIAL_VIEW_STATE = {
  // NY
  // longitude: -74,
  // latitude: 40.72,
  // Aizuwakamatsu
  longitude: 139.91,
  latitude: 37.48,
  zoom: 14,
  pitch: 45,
  bearing: -30
};

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0
    };
  }

  componentDidMount() {
    this._animate();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  _animate() {
    const {
      loopLength = 3600, // unit corresponds to the timestamp in source data
      animationSpeed = 30 // unit time per second
    } = this.props;
    const timestamp = Date.now() / 1000;
    const loopTime = loopLength / animationSpeed;

    this.setState({
      time: ((timestamp % loopTime) / loopTime) * loopLength
    });
    this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
  }

  _renderLayers() {
    const {
      trips = DATA_URL.TRIPS,
      trailLength = 30,
      theme = DEFAULT_THEME
    } = this.props;

    return [
      new TripsLayer({
        id: 'trips',
        data: trips,
        getPath: d => d.path,
        getWidth: d => 40,
        getTimestamps: d => d.timestamps,
        getColor: d => theme[d.vendor],
        opacity: 0.3,
        widthMinPixels: 2,
        rounded: true,
        trailLength,
        currentTime: this.state.time,

        shadowEnabled: false
      }),
    ];
  }

  render() {
    const {
      viewState,
      mapStyle = 'mapbox://styles/mapbox/dark-v9',
      theme = DEFAULT_THEME
    } = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={true}
      >
        <StaticMap
          reuseMaps
          mapStyle={mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={MAPBOX_TOKEN}
        />
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
