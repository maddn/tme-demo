import './topology.css';

import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';

import Topology from './Topology';
import ToggleButton from './ToggleButton';
import IconSizeSlider from './IconSizeSlider';

import { getDraggedItem,
         getEditMode, editModeToggled,
         getConfigViewerVisible, configViewerToggled,
         getConnectionInfoVisible, connectionInfoToggled
} from './topologySlice';
import { useQuerySelection } from './QuerySelectionContext';


const defaultGetDeviceStatus = ({ platform }) =>
  platform ? 'reachable' : 'unreachable';

function TopologyViewer ({ getDeviceStatus = defaultGetDeviceStatus }) {
  console.debug('TopologyViewer Render');

  const draggedItem = useSelector((state) => getDraggedItem(state));
  const editMode = useSelector((state) => getEditMode(state));
  const configViewerVisible = useSelector((state) =>
    getConfigViewerVisible(state));
  const connectionInfoVisible = useSelector((state) =>
    getConnectionInfoVisible(state));
  const { connections: connectionsQuery } = useQuerySelection();
  const hasConnectionInfo = connectionsQuery.selection.length > 0;

  const dispatch = useDispatch();

  return (
    <div className="topology__viewer">
      <Topology getDeviceStatus={getDeviceStatus}/>
      <div className="footer">
        <ToggleButton
          handleToggle={(value) => {dispatch(editModeToggled(value));}}
          checked={editMode}
          label="Edit Topology"
          />
        <ToggleButton
          handleToggle={(value) => {dispatch(configViewerToggled(value));}}
          checked={configViewerVisible}
          label="Show Device Config"
          />
        {hasConnectionInfo &&
          <ToggleButton
            handleToggle={(value) => {dispatch(connectionInfoToggled(value));}}
            checked={connectionInfoVisible}
            label="Show Link Info"
            />
        }
        <IconSizeSlider/>
        <div className={classNames('component__layer', 'container__overlay', {
          'container__overlay--inactive': draggedItem
        })}/>
      </div>
    </div>
  );
}

export default TopologyViewer;
