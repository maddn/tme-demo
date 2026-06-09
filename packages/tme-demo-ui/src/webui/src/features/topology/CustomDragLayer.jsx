import React from 'react';
import { useSelector } from 'react-redux';

import DragLayerDrawer from './DragLayerDrawer';

import { useDevice, useDevicesQuery } from './Icon';
import { useConnectedDevices } from './Connection';

import { getDraggedItem, getHoveredIcon } from './topologySlice';
import { useIconPositionCalculator } from './Icon';

function CustomDragLayer({ canvasRef }) {
  console.debug('CustomDragLayer Render');

  const iconPosition = useIconPositionCalculator();
  const draggedItem = useSelector((state) => getDraggedItem(state)) || {};
  const { icon, fromDevice } = draggedItem;

  const connectedDevices = useConnectedDevices(icon);

  const fromDevices = fromDevice ? [ fromDevice ] : (
    connectedDevices);
  const hoveredDevice = useDevice(useSelector((state) => getHoveredIcon(state)));

  const devices = useDevicesQuery().data;

  const getDevice = (deviceName) =>
    devices?.find(device => device.name === deviceName);

  return (
    <DragLayerDrawer
      canvasRef={canvasRef}
      fromIcons={fromDevices?.map(device => iconPosition(getDevice(device)))}
      toIcon={hoveredDevice && iconPosition(hoveredDevice)}
    />
  );
}

export default CustomDragLayer;
