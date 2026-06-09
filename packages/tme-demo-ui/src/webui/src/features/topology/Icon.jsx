import React from 'react';
import { Fragment, useCallback,
         useContext, useEffect, useMemo} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { renderToStaticMarkup } from 'react-dom/server';
import { useDrop, useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import classNames from 'classnames';
import Tippy from '@tippyjs/react';

import { ICON, INTERFACE, DEVICE } from 'constants/ItemTypes';
import { CIRCLE_ICON_RATIO, ICON_OUTLINE_RATIO } from 'constants/Layout';
import { BTN_ADD } from 'constants/Icons';
import { HIGHLIGHT, HOVER } from 'constants/Colours';

import Interface from './Interface';
import IconHighlight from './icons/IconHighlight';
import IconSvg from './icons/IconSvg';

import { getSelectedIcon, getEditMode, getHighlightedIcons, getExpandedIcons,
         itemDragged, iconHovered, connectionSelected, iconSelected,
         getZoomedContainer, getVisibleUnderlays,
         iconExpandToggled } from './topologySlice';
import { getOpenTopology,
         getOpenTopologyName } from 'features/menu/menuSlice';
import { useConnectedDevices } from './Connection';

import { LayoutContext} from './LayoutContext';
import { isSafari, connectPngDragPreview } from './DragLayerCanvas';

import { camelCase, selectItem, selectItemWithArray,
         createItemsSelector, useQueryQuery } from '/api/query';

import { useSetValueMutation,
         useCreateMutation, useDeletePathMutation } from '/api/data';
import { useQuerySelection } from './QuerySelectionContext';


// === Queries ================================================================

function __useDevicesQuery(selectFromResult) {
  const { devices: devicesQuery } = useQuerySelection();
  return useQueryQuery({
    xpathExpr: '/topologies/topology/devices/device',
    selection: [
      'device-name',
      '../../name',
      'container',
      'icon/type',
      'icon/underlay',
      'icon/coord/x',
      'icon/coord/y',
      ...devicesQuery.selection ],
    subscribe: devicesQuery.subscribe
    }, { selectFromResult }
  );
}

export function useDevicesQuery() {
  const topology = useSelector(getOpenTopologyName);
  return __useDevicesQuery(useMemo(() =>
    createItemsSelector('parentName', topology), [ topology ]));
}

export function useDevice(name) {
  const topology = useSelector(getOpenTopologyName);
  const device = __useDevicesQuery(selectItemWithArray([
    [ 'parentName', topology ], [ 'name', name ]
  ])).data;
  if (name && !device) {
    console.error(`Device ${name} doesn't exist`);
  }
  return device;
}

function __useZoomedIconsQuery(selectFromResult) {
  return useQueryQuery({
    xpathExpr: '/topologies/topology/devices/device/icon/zoomed',
    selection: [
      'container',
      '../../../../name',
      '../../device-name',
      'coord/x',
      'coord/y' ]
    }, { selectFromResult }
  );
}

export function useZoomedIconsQuery() {
  const topology = useSelector(getOpenTopologyName);
  return __useZoomedIconsQuery(useMemo(() =>
    createItemsSelector('ancestorName', topology), [ topology ]));
}

export function usePlatformsQuery(itemSelector) {
  return useQueryQuery({
    xpathExpr: '/ncs:devices/device/platform',
    selection: [
      '../name',
      'name',
      'model',
      'version',
      '../address',
      '../port',
      '../authgroup' ]
  }, { selectFromResult: itemSelector });
}

export function usePlatform(deviceName) {
  return usePlatformsQuery(selectItem('parentName', deviceName)).data;
}

export function useAuthgroupsQuery(itemSelector) {
  return useQueryQuery({
    xpathExpr: '/ncs:devices/authgroups/group',
    selection: [ 'name', 'default-map/remote-name' ]
  }, { selectFromResult: itemSelector });
}

export function useAuthgroup(groupName) {
  return useAuthgroupsQuery(selectItem('name', groupName)).data;
}



// === Util functions =========================================================

function positionStyle(position, size) {
  return {
    left: `${position.pcX}%`,
    top: `${position.pcY}%`,
    transform: `translate(-50%, ${-size/2}px)`,
  };
}

export function svgStyle(size) {
  return {
    height: `${size}px`,
    width: `${size}px`,
  };
}

const roundPc = (n) =>
  +Number.parseFloat(n).toFixed(2);

function calculateIconPosition(device, container, hidden, dimensions) {
  if (!device || !container) {
    return {};
  }

  const coordX = device.coordX ?? device.iconCoordX;
  const coordY = device.coordY ?? device.iconCoordY;
  const { pc: { left, top, width, height }, connectionColour } = container;

  const pcX = roundPc(left + coordX * width);
  const pcY = roundPc(top + coordY * height);

  const position = (pcX, pcY) => ({
    pcX, pcY,
    x: Math.round(pcX * dimensions.width / 100),
    y: Math.round(pcY * dimensions.height / 100),
    connectionColour, hidden
  });

  return position(pcX, pcY);
}

function isHidden(device, container, zoomedContainer, visibleUnderlays) {
  return zoomedContainer && zoomedContainer !== container ||
    device.iconUnderlay === 'true' && !visibleUnderlays.includes(container);
}

function formatInfoLabel(value) {
  return value.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
}

function DeviceTooltip({ device, platform, status, selection }) {
  const extraInfo = selection.map(leaf => {
    const prop = camelCase(leaf);
    return {
      label: formatInfoLabel(prop),
      value: device[prop]
    };
  }).filter(({ value }) => value);

  return (
    <table className="tooltip">
      <tbody>
        <tr><td>Device:</td><td>{device.name}</td></tr>
        <tr><td>Status:</td><td>{status}</td></tr>
        {platform &&
          <Fragment>
            <tr><td>Platform:</td><td>{platform.name}</td></tr>
            <tr><td>Version:</td><td>{platform.version}</td></tr>
            <tr><td>Model:</td><td>{platform.model}</td></tr>
          </Fragment>
        }
        {extraInfo.map(({ label, value }) =>
          <tr key={label}><td>{label}:</td><td>{value}</td></tr>
        )}
      </tbody>
    </table>
  );
}

// === Hooks ==================================================================

export function useIsExpanded(name) {
  return useSelector((state) => getExpandedIcons(state)?.includes(name));
}

export function useIconPosition(name) {
  const device = useDevice(name);
  const iconPosition = useIconPositionCalculator();

  return iconPosition(device);
}

export function useIconPositionCalculator() {
  console.debug(`Reselect iconPositionCalculator`);
  const { containers, dimensions } = useContext(LayoutContext);
  const visibleUnderlays = useSelector((state) => getVisibleUnderlays(state));
  const zoomedContainer = useSelector((state) => getZoomedContainer(state));
  const zoomedIcons = useZoomedIconsQuery().data;

  return useCallback(device => {
    if (!device || !containers) {
      return {};
    }

    const zoomedIcon = zoomedIcons?.find(({ deviceName, name }) =>
      deviceName === device.name && name === zoomedContainer);
    const container = zoomedIcon?.name || device.container;

    return calculateIconPosition(
      zoomedIcon || device,
      containers[container],
      isHidden(device, container, zoomedContainer, visibleUnderlays),
      dimensions);

  }, [ containers, dimensions, visibleUnderlays, zoomedContainer, zoomedIcons ]);
}

// === Component ==============================================================

function Icon({ name, getDeviceStatus }) {
  console.debug('Icon Render');
  const mouseDownPos = {};

  const { devices: devicesQuery } = useQuerySelection();
  const dispatch = useDispatch();
  const [ setValue ] = useSetValueMutation();
  const [ create ] = useCreateMutation();
  const [ deletePath ] = useDeletePathMutation();

  const { iconSize: size, pxToPc } = useContext(LayoutContext);

  const platform = usePlatform(name);
  const device = useDevice(name);

  const selected = useSelector((state) => getSelectedIcon(state) === name);
  const highlighted = useSelector(
    (state) => getHighlightedIcons(state)?.includes(name));
  const editMode = useSelector((state) => getEditMode(state));
  const openTopologyKeypath = useSelector((state) => getOpenTopology(state));

  const openTopology = useSelector(getOpenTopologyName);
  const zoomedContainer = useSelector((state) => getZoomedContainer(state));
  const container = zoomedContainer || device.container;

  const { keypath, iconType } = device;
  const { x, y, pcX, pcY, hidden } = useIconPosition(name);
  const expanded = useIsExpanded(name);

  const connectedDevices = useConnectedDevices(name);

  const [, deviceDrag, deviceDragPreview] = useDrag(() => ({
    type: DEVICE,
    item: { name, type: iconType },
    canDrag: !editMode
  }));

  const [ collectedDragProps, iconDrag, iconDragPreview ] = useDrag(() => ({
    type: ICON,
    item: () => {
      const img = new Image();
      img.src = `data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(
            <IconSvg type={iconType} status={status} size={size} />
      ))}`;
      const item = {
        icon: { name, img, imgReady: false, container}, x, y,  mouseDownPos
      };
      img.onload = () => { item.icon.imgReady = true; };
      requestAnimationFrame(
        () => { dispatch(itemDragged({ icon: name, container })); });
      return item;
    },
    end: (item, monitor) => {
      const offset = monitor.getDifferenceFromInitialOffset();
      dispatch(itemDragged(undefined));
      moveIcon(item.x + offset.x, item.y + offset.y);
    },
    canDrag: editMode,
    collect: (monitor) => ({ isDragging: monitor.isDragging() })
  }), [ mouseDownPos ]);

  const [ collectedDropProps, drop ] = useDrop(() => ({
    accept: INTERFACE,
    drop: (item) => {
      const { aEndDevice: aEnd, zEndDevice: zEnd,
              keypath, fromDevice } = item.interface;
      const aEndDevice = aEnd ? name : fromDevice;
      const zEndDevice = (zEnd || !aEnd) ? name : fromDevice;

      if (keypath) {
        deletePath({ keypath });
      }

      create({
        keypath: `${openTopologyKeypath}/links/link`,
        name: `${aEndDevice} ${zEndDevice}`,
        aEndDevice, zEndDevice,
        parentName: openTopology,
      });
      dispatch(connectionSelected({ aEndDevice, zEndDevice }));
    },
    canDrop: (item, monitor) => {
      const hoveredInterface = monitor.isOver() && item;
      if (!hoveredInterface) {
        return false;
      }
      const { fromDevice } = hoveredInterface.interface;
      if (name === fromDevice ) {
        return false;
      }
      return !connectedDevices.includes(fromDevice);
    },
    collect: (monitor) => ({
      canDrop: monitor.canDrop()
    })
  }), [ connectedDevices ]);

  const handleOnClick = () => {
    if (editMode && name ) {
      dispatch(iconSelected(name));
    } else if (!editMode) {
      dispatch(iconExpandToggled(name));
    }
  };

  const moveIcon = (x, y) => {
    const path = zoomedContainer ? `${keypath}/icon/zoomed{${container}}` : keypath;
    const coordNode = zoomedContainer ? 'coord/' : 'icon/coord/';
    const coordValue = pxToPc({ x, y }, container);
    setValue({ keypath: path, leaf: `${coordNode}x`, value: coordValue.x });
    setValue({ keypath: path, leaf: `${coordNode}y`, value: coordValue.y});
  };

  const handleMouseDown = event => {
    mouseDownPos.x = event.clientX;
    mouseDownPos.y = event.clientY;
  };

  const { canDrop } = collectedDropProps;

  useEffect(() => {
    dispatch(iconHovered(canDrop && name));
  }, [ canDrop ]);

  useEffect(() => {
    iconDragPreview(getEmptyImage(), {});
  });

  const { isDragging } = collectedDragProps;

  const getStatus = () => getDeviceStatus({
    device,
    platform
  });

  let status = getStatus();
  const position = { x, y, pcX, pcY };
  const outlineSize = expanded ? Math.round(size * ICON_OUTLINE_RATIO) : size;
  const highlightSize = size * 2;

  // The drag preview is not captured correctly on Safari,
  // so generate PNG image and use that
  isSafari && connectPngDragPreview(renderToStaticMarkup(
    <IconSvg type={iconType} status={status} size={size} />),
    size, deviceDragPreview, false
  );

  return (
    <Fragment>
      <div
        onClick={handleOnClick}
        id={`${name}-outline`}
        className={classNames('icon__outline', {
          'icon__outline--expanded': expanded,
          'icon__container--hidden': hidden
        })}
        style={{
          ...positionStyle(position, outlineSize),
          ...svgStyle(outlineSize),
          borderRadius: `${outlineSize / 2}px`,
        }}
      >
      </div>
      <div
        className={classNames('icon__container', {
          'icon__container--hidden': !canDrop
        })}
        style={positionStyle(position, highlightSize)}
      >
        <IconHighlight size={highlightSize} colour={HOVER}/>
      </div>
      <div
        className={classNames('icon__container', {
          'icon__container--expanded': expanded,
          'icon__container--hidden': hidden || editMode || !highlighted
        })}
        style={positionStyle(position, highlightSize)}
      >
        <IconHighlight size={highlightSize} colour={HIGHLIGHT}/>
      </div>
      {deviceDragPreview(
        <div
          id={`${name}-icon`}
          className={classNames('icon__container', {
            'icon__container--expanded': expanded,
            'icon__container--dragging': isDragging,
            'icon__container--hidden': hidden
          })}
          style={positionStyle(position, size)}
        >
          <div
            className="icon__svg-wrapper icon__svg-wrapper--hidden"
            style={{
              height: `${(size + outlineSize) / 2}px`,
              width: `${size}px`
            }}
          />
          <div className="icon__label">
            <span className="icon__label-text">{name}</span>
          </div>
          <Tippy
            placement="left"
            delay="250"
            content={<DeviceTooltip
              device={device}
              platform={platform}
              status={status}
              selection={devicesQuery.selection}
            />}
            disabled={editMode}
          >
            {deviceDrag(drop(iconDrag(
              <div
                onClick={handleOnClick}
                onMouseDown={handleMouseDown}
                className={classNames('icon__svg-wrapper',
                  'icon__svg-wrapper-absolute', {
                  'icon__svg-wrapper--hidden': hidden
                })}
                style={svgStyle(size)}
                onDragEnter={(event) => {
                  event.stopPropagation();
                }}
                onDragLeave={(event) => {
                  event.stopPropagation();
                }}
              >
                <IconSvg type={iconType} status={status} size={size} />
                <Interface
                  fromDevice={name}
                  x={x}
                  y={y}
                  pcX={50}
                  pcY={50}
                  size={size * CIRCLE_ICON_RATIO}
                  active={selected && editMode}
                  type={BTN_ADD}
                  tooltip="Add Connection (drag me)"
                />
              </div>
            )))}
          </Tippy>
        </div>
      )}
    </Fragment>
  );
}

export default Icon;
