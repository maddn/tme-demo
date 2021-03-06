import './index.css';
import React from 'react';
import { PureComponent, createRef, Fragment } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import ReactResizeDetector from 'react-resize-detector';

import { LAYOUT } from '../../constants/Layout';

import Container from './Container';
import Connection from './Connection';
import Icon from './Icon';
import DragLayerCanvas from './DragLayerCanvas';
import CustomDragLayer from './CustomDragLayer';
import ToggleButton from './ToggleButton';
import IconSizeSlider from './IconSizeSlider';
import LoadingOverlay from '../common/LoadingOverlay';

import { getIcons, getConnectionPositions, getDimensions, getLayout,
         getDraggedItem, getIsFetchingLayout, getIsFetchingIcons,
         getIsFetchingZoomedIcons, getIsFetchingVnfs, getIsFetchingConnections,
         getEditMode, getConfigViewerVisible } from '../../reducers';

import { fetchTopologyData, subscribeTopologyData } from '../../actions';
import { editModeToggled, configViewerToggled } from '../../actions/uiState';
import { dimensionsChanged } from '../../actions/uiSizing';


const mapStateToProps = state => ({
  icons: getIcons(state),
  connections: getConnectionPositions(state),
  dimensions: getDimensions(state),
  layout: getLayout(state),
  draggedItem: getDraggedItem(state),
  isFetchingLayout: getIsFetchingLayout(state),
  isFetchingIcons: getIsFetchingIcons(state) || getIsFetchingZoomedIcons(state),
  isFetchingConnections: getIsFetchingConnections(state),
  isFetchingVnfs: getIsFetchingVnfs(state),
  editMode: getEditMode(state),
  configViewerVisible: getConfigViewerVisible(state)
});

const mapDispatchToProps = {
  dimensionsChanged, fetchTopologyData, subscribeTopologyData,
  editModeToggled, configViewerToggled
};


class Topology extends PureComponent {
  constructor(props) {
    super(props);
    this.ref = createRef();
    this.canvasRef = createRef();
    this.hoveredIcon = { name: null };
    this.resize = this.resize.bind(this);
  }

  resize() {
    console.debug('Topology Resize');
    const { offsetWidth, offsetHeight } = this.ref.current;
    const { dimensionsChanged } = this.props;
    const { left, top } = this.ref.current.getBoundingClientRect();
    dimensionsChanged(left, top, offsetWidth, offsetHeight);
  }

  componentDidMount() {
    this.resize();
    const { fetchTopologyData, subscribeTopologyData } = this.props;
    fetchTopologyData();
    subscribeTopologyData();
  }

  render() {
    console.debug('Topology Render');
    const { icons, connections, layout, dimensions, draggedItem,
            isFetchingLayout, isFetchingIcons, isFetchingVnfs,
            isFetchingConnections, editMode, configViewerVisible,
            editModeToggled, configViewerToggled } = this.props;
    return (
      <div className={classNames('topology', {
        'topology--edit-mode': editMode,
        'topology--expanded': !configViewerVisible
      })}>
        <div className="topology__body">
          <div className="topology__layer topology__layer--background">
            {layout && Object.keys(layout).map(name =>
              <Container key={name} name={name}/>)}
          </div>
          <div className="topology__layer topology__layer--foreground">
            <div className="topology__header"/>
            <div className="topology__body" ref={this.ref}>
              <ReactResizeDetector handleWidth handleHeight
                onResize={this.resize}
                refreshMode="debounce"
                refreshRate={500}
              />
              {dimensions && layout &&
                <div className="topology__layer">
                  {connections.map(connection =>
                    <Connection key={connection.key} {...connection}/>
                  )}
                  {Object.keys(icons).map(key =>
                    <Icon key={key} name={key} hoveredIcon={this.hoveredIcon}/>
                  )}
                  <DragLayerCanvas
                    dimensions={dimensions}
                    canvasRef={this.canvasRef}
                  />
                  <CustomDragLayer
                    hoveredIcon={this.hoveredIcon}
                    canvasRef={this.canvasRef}
                  />
                  <LoadingOverlay items={[
                    { isFetching: isFetchingIcons, label: 'Fetching Icons...' },
                    { isFetching: isFetchingVnfs, label: 'Fetching Vnfs...' },
                    { isFetching: isFetchingConnections,
                      label: 'Fetching Connections...' }
                  ]}/>
                </div>
              }
            </div>
          </div>
          <LoadingOverlay items={[
            { isFetching: isFetchingLayout, label: 'Fetching Layout...' }
          ]}/>
        </div>
        <div className="topology__footer">
          <div className="topology__footer-content">
            <ToggleButton
              handleToggle={editModeToggled}
              checked={editMode}
              label="Edit Topology"
              />
            <ToggleButton
              handleToggle={configViewerToggled}
              checked={configViewerVisible}
              label="Show Device Config"
              />
            {dimensions && <IconSizeSlider/>}
          </div>
          <div className={classNames('container__layer', 'container__overlay', {
            'container__overlay--inactive': draggedItem &&
              draggedItem.icon !== 'new-network-service'
          })}/>
        </div>
      </div>
    );
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(Topology);
