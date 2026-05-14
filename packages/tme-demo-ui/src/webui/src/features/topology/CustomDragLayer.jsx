import React from 'react';
import { useSelector } from 'react-redux';

import DragLayerDrawer from './DragLayerDrawer';

import { useIcon, useIconsQuery } from './Icon';
import { useConnectedDevices } from './Connection';

import { getDraggedItem, getHoveredIcon } from './topologySlice';
import { useIconPositionCalculator } from './Icon';

function CustomDragLayer({ canvasRef }) {
  console.debug('CustomDragLayer Render');

  const iconPosition = useIconPositionCalculator();
  const draggedItem = useSelector((state) => getDraggedItem(state)) || {};
  const { device, fromDevice } = draggedItem;

  const connectedDevices = useConnectedDevices(device);

  const fromDevices = fromDevice ? [ fromDevice ] : (
    connectedDevices);
  const hoveredIcon = useIcon(useSelector((state) => getHoveredIcon(state)));

  const icons = useIconsQuery().data;

  const getIcon = (deviceName) =>
    icons?.find(icon => icon.device === deviceName);

  return (
    <DragLayerDrawer
      canvasRef={canvasRef}
      fromIcons={fromDevices?.map(device => iconPosition(getIcon(device)))}
      toIcon={hoveredIcon && iconPosition(hoveredIcon)}
    />
  );
}

export default CustomDragLayer;
