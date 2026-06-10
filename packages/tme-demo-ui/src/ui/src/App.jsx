import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useSelector } from 'react-redux';
import classNames from 'classnames';

import WebuiOne from 'features/nso/WebuiOne';
import TopologyViewer from 'features/topology/TopologyViewer';
import ConfigViewer from 'features/config/ConfigViewer';
import TerminalViewer from 'features/terminal/TerminalViewer';
import MenuSidebar from './MenuSidebar';
import DeviceTerminal from './DeviceTerminal';

import { getEditMode } from 'features/topology/topologySlice';
import {
  QuerySelectionProvider
} from 'features/topology/QuerySelectionContext';

const getDeviceStatus = ({ platform }) =>
  platform ? 'reachable' : 'unreachable';

function App () {
  console.debug('App Render');

  const editMode = useSelector((state) => getEditMode(state));

  return (
    <DndProvider backend={HTML5Backend}>
      <QuerySelectionProvider>
        <WebuiOne title="TME Demo">
          <MenuSidebar/>
          <div className={classNames('centre-pane', {
            'centre-pane--edit-mode': editMode
          })}>
            <TopologyViewer getDeviceStatus={getDeviceStatus}/>
            <TerminalViewer DeviceTerminal={DeviceTerminal}/>
          </div>
          <ConfigViewer/>
        </WebuiOne>
      </QuerySelectionProvider>
    </DndProvider>
  );
}

export default App;
