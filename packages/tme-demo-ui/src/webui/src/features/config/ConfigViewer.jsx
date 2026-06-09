import './config.css';
import React from 'react';
import { useSelector } from 'react-redux';

import Sidebar from 'features/common/Sidebar';
import Config from './Config';
import { usePlatformsQuery, useDevicesQuery } from 'features/topology/Icon';
import { getExpandedIcons,
         getConfigViewerVisible } from 'features/topology/topologySlice';
import { getOpenTopology, getOpenService } from 'features/menu/menuSlice';

const DefaultConfigHeaderActions = () => null;
const getNsoDeviceEditorKeypath = (device) =>
  `/ncs:devices/device{${device.name}}`;

function ConfigViewer({
    ConfigHeaderActions = DefaultConfigHeaderActions,
    getDeviceEditorKeypath = getNsoDeviceEditorKeypath }) {
  console.debug('Config Viewer Render');
  const expandedIcons = useSelector((state) => getExpandedIcons(state));
  const configViewerVisible = useSelector((state) => getConfigViewerVisible(state));
  const openTopology = useSelector((state) => getOpenTopology(state));
  const openService = useSelector((state) => getOpenService(state));
  const platforms = usePlatformsQuery().data;
  const devices = useDevicesQuery().data;

  return (
    <Sidebar right={true} hidden={!configViewerVisible}>
      <div className="header">
        <div className="header__title-text">Config Viewer</div>
      </div>
      <div className="accordion__group">
        {devices && platforms && expandedIcons && expandedIcons.map(
          icon => {
            const device = devices?.find(({ name }) => name === icon);
            if (!device) {
              return null;
            }
            return <Config
              key={icon}
              device={icon}
              editorKeypath={getDeviceEditorKeypath(device) ||
                getNsoDeviceEditorKeypath(device)}
              managed={platforms.find(({ parentName }) => parentName === icon)}
              openService={openService}
              openTopology={openTopology}
              ConfigHeaderActions={ConfigHeaderActions}/>;
          })}
      </div>
    </Sidebar>
  );
}

export default ConfigViewer;
