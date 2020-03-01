import React, { Component } from 'react';
import { StaticMap } from 'react-map-gl';
import DeckGL from 'deck.gl';
// import { TripsLayer } from '@deck.gl/geo-layers';
import taxiData from './taxi';
import { renderLayers } from './deckgl-layers';
import {
  LayerControls,
  MapStylePicker,
  SCATTERPLOT_CONTROLS
} from './controls';
import { tooltipStyle } from './style';

const INITIAL_VIEW_STATE = {
  longitude: 139.9,
  latitude: 37.5,
  zoom: 11,
  minZoom: 5,
  maxZoom: 16,
  pitch: 60,
  bearing: -40
};

export default class App extends Component {
  state = {
    hover: {
      x: 0,
      y: 0,
      hoveredObject: null
    },
    points: [],
    settings: Object.keys(SCATTERPLOT_CONTROLS).reduce(
      (accu, key) => ({
        ...accu,
        [key]: SCATTERPLOT_CONTROLS[key].value
      }),
      {}
    ),
    style: 'mapbox://styles/mapbox/dark-v9'
  };

  componentDidMount() {
    this._processData();
    // ...
  }

  _processData() {
    const points = taxiData.reduce((accu, curr) => {
      accu.push({
        position: [Number(curr.pickup_longitude), Number(curr.pickup_latitude)],
        pickup: true
      });
      accu.push({
        position: [
          Number(curr.dropoff_longitude),
          Number(curr.dropoff_latitude)
        ],
        pickup: false
      });
      return accu;
    }, []);
    this.setState({
      points
    });
  }

  onStyleChange = style => {
    this.setState({ style });
  };

  _onHover({ x, y, object }) {
    const label = object ? (object.pickup ? 'Pickup' : 'Dropoff') : null;
    this.setState({ hover: { x, y, hoveredObject: object, label } });
  }

  _updateLayerSettings(settings) {
    this.setState({ settings });
  }

  // _renderTrajectories() {
  //   const {
  //     // buildings = DATA_URL.BUILDINGS,
  //     trips = '../tmp.json',
  //     trailLength = 80,
  //     // theme = DEFAULT_THEME
  //   } = this.props;

  //   return [
  //     new TripsLayer({
  //       id: 'Trips',
  //       data: trips,
  //       getPath: d => d.path,
  //       getTimestamps: d => d.timestamps,
  //       opacity: 0.3,
  //       widthMinPixels: 2,
  //       rounded: true,
  //       trailLength,
  //       currentTime: this.state.time,

  //       shadowEnabled: false
  //     })
  //   ]
  // }

  render() {
    const data = this.state.points;
    if (!data.length) {
      return null;
    }
    const { hover, settings } = this.state;
    return (
      <div>
        {hover.hoveredObject && (
          <div
            style={{
              ...tooltipStyle,
              transform: `translate(${hover.x}px, ${hover.y}px)`
            }}
          >
            <div>{hover.label}</div>
          </div>
        )}
        <MapStylePicker
          onStyleChange={this.onStyleChange}
          currentStyle={this.state.style}
        />
        <LayerControls
          settings={this.state.settings}
          propTypes={SCATTERPLOT_CONTROLS}
          onChange={settings => this._updateLayerSettings(settings)}
        />
        <DeckGL
          layers={renderLayers({
            data: this.state.points,
            onHover: hover => this._onHover(hover),
            settings: this.state.settings
          })}
          initialViewState={INITIAL_VIEW_STATE}
          controller
        >
          <StaticMap mapStyle={this.state.style} />
        </DeckGL>
      </div>
    );
  }
}
