import React from 'react';
import { Fragment, memo, useCallback,
         useContext, useEffect } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { renderToStaticMarkup } from 'react-dom/server';
import { getEmptyImage } from 'react-dnd-html5-backend';
import classNames from 'classnames';
import Tippy from '@tippyjs/react';

import { LayoutContext} from './LayoutContext';
import { useSelector, useDispatch } from 'react-redux';
import { ICON, INTERFACE, ENDPOINT } from '../../constants/ItemTypes';
import { CIRCLE_ICON_RATIO, ICON_OUTLINE_RATIO } from 'constants/Layout';
import { BTN_ADD } from '../../constants/Icons';
import { HIGHLIGHT, HOVER } from '../../constants/Colours';

import Interface from './Interface';
import IconHighlight from './icons/IconHighlight';
import IconSvg from './icons/IconSvg';

import { getExpandedIcons, getSelectedIcon, getEditMode, getHighlightedIcons,
         itemDragged, iconHovered, connectionSelected, iconSelected,
         iconExpandToggled, getVisibleUnderlays, getZoomedContainer } from './topologySlice';
import { useConnectedDevices, createConnection } from './Connection';

import { isSafari, connectPngDragPreview } from './DragLayerCanvas';

import { selectItem, useQueryQuery } from '/api/query';

import { useSetValueMutation, useCreateMutation } from '/api/data';


const roundPc = (n) =>
  +Number.parseFloat(n).toFixed(2);

function calculateIconPosition(
  icon, container, hidden, dimensions, expanded
) {
  if (!icon || !container) {
    return {};
  }

  const { coordX, coordY } = icon;
  const { pc: { left, top, width, height }, connectionColour } = container;

  const pcX = roundPc(left + coordX * width);
  const pcY = roundPc(top + coordY * height);

  const position = (pcX, pcY) => ({
    pcX, pcY,
    x: Math.round(pcX * dimensions.width / 100),
    y: Math.round(pcY * dimensions.height / 100),
    connectionColour, hidden, expanded
  });

  return position(pcX, pcY);
}

function getIconDetails(
  icon, zoomedContainer, zoomedIcons, visibleUnderlays, containers
) {
  if (!icon) {
    return [ undefined, undefined, false ];
  }

  const zoomedIcon = zoomedIcons?.find(({ parentName, name }) =>
    parentName === icon.name && name === zoomedContainer);
  const container = zoomedIcon?.name || icon?.container;
  const hidden = zoomedContainer && zoomedContainer !== container ||
    icon.underlay === 'true' && !visibleUnderlays.includes(container);

  return [ zoomedIcon || icon, containers[container], hidden ];
}


// === Queries ================================================================

export function useIconsQuery(selectFromResult) {
  return useQueryQuery({
    xpathExpr: '/webui:webui/data-stores/tme-demo-ui:static-map/icon',
    selection: [
      'name',
      'device',
      'type',
      'container',
      'underlay',
      'coord/x',
      'coord/y' ],
    subscribe: { cdbOper: false, skipLocal: false }
    }, { selectFromResult }
  );
}

export function useIcon(name) {
  return useIconsQuery(selectItem('name', name)).data;
}

export function useIconByDevice(device) {
  return useIconsQuery(selectItem('device', device)).data;
}

export function useZoomedIconsQuery(selectFromResult) {
  return useQueryQuery({
    xpathExpr: '/webui:webui/data-stores/tme-demo-ui:static-map/icon/zoomed',
    selection: [
      'container',
      '../name',
      'coord/x',
      'coord/y' ]
    }, { selectFromResult }
  );
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

export function positionStyle(pcX, pcY, size) {
  return {
    left: `${pcX}%`,
    top: `${pcY}%`,
    transform: `translate(-50%, ${-size/2}px)`,
  };
}

export function svgStyle(size) {
  return {
    height: `${size}px`,
    width: `${size}px`,
  };
}

// === Hooks ==================================================================

export function useIsExpanded(name) {
  return useSelector((state) => getExpandedIcons(state)?.includes(name));
}

export function useIconPosition(name) {
  const { containers, dimensions } = useContext(LayoutContext);

  return calculateIconPosition(
    ...getIconDetails(
      useIcon(name),
      useSelector(state => getZoomedContainer(state)),
      useZoomedIconsQuery().data,
      useSelector((state) => getVisibleUnderlays(state)),
      containers),
    dimensions, useIsExpanded(name));
}


export function useDeviceIconPosition(device) {
  const deviceIcon = useIconByDevice(device);
  const position = useIconPosition(deviceIcon?.name);

  if (!deviceIcon) {
    console.error(`Missing icon for device ${device}`);
    return {};
  }

  return { ...position };
}

export function useIconPositionCalculator() {
  console.debug(`Reselect iconPositionCalculator`);
  const { containers, dimensions } = useContext(LayoutContext);
  const visibleUnderlays = useSelector((state) => getVisibleUnderlays(state));
  const zoomedContainer = useSelector((state) => getZoomedContainer(state));
  const zoomedIcons = useZoomedIconsQuery().data;

  return useCallback(icon => {
    if (!icon) {
      return {};
    }

    return calculateIconPosition(...getIconDetails(
        icon, zoomedContainer, zoomedIcons, visibleUnderlays, containers),
      dimensions);

  }, [ containers, visibleUnderlays, zoomedContainer, zoomedIcons ]);
}

// === Component ==============================================================

function Icon({ name }) {
  console.debug('Icon Render');
  const mouseDownPos = {};

  const dispatch = useDispatch();
  const [ setValue ] = useSetValueMutation();
  const [ create ] = useCreateMutation();

  const { iconSize: size, pxToPc } = useContext(LayoutContext);

  const icon = useIcon(name);
  const platform = usePlatform(name);

  const selected = useSelector((state) => getSelectedIcon(state) === name);
  const highlightedDevices = useSelector((state) => getHighlightedIcons(state));
  const editMode = useSelector((state) => getEditMode(state));

  const zoomedContainer = useSelector((state) => getZoomedContainer(state));
  const container = zoomedContainer || icon.container;

  const { keypath, device, type } = icon;
  const { x, y, pcX, pcY, hidden, expanded } = useIconPosition(name);

  const connectedDevices = useConnectedDevices(device);

  const [ , endpointDrag, endpointDragPreview] = useDrag(() => ({
    type: ENDPOINT,
    item: { name: device, type },
    canDrag: !editMode
  }));

  const [ collectedDragProps, iconDrag, iconDragPreview ] = useDrag(() => ({
    type: ICON,
    item: () => {
      const img = new Image();
      img.src = `data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(
            <IconSvg type={type} status={status} size={size} />
      ))}`;
      const item = {
        icon: { name, img, imgReady: false, container}, x, y,  mouseDownPos
      };
      img.onload = () => { item.icon.imgReady = true; };
      requestAnimationFrame(
        () => { dispatch(itemDragged({ device, container })); });
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
      const { keypath, aEndDevice, zEndDevice, fromDevice } = item.interface;
      const endpoint1Device = aEndDevice ? name : fromDevice;
      const endpoint2Device = (zEndDevice || !aEndDevice) ? name : fromDevice;

      if (keypath) {
        setValue({ keypath, leaf: 'endpoint-1/device', value: endpoint1Device });
        setValue({ keypath, leaf: 'endpoint-2/device', value: endpoint2Device });
      } else {
        createConnection(endpoint1Device, endpoint2Device, create, setValue);
      }

      dispatch(connectionSelected(endpoint1Device, endpoint2Device));
    },
    canDrop: (item, monitor) => {
      if (!monitor.isOver()) {
        return false;
      }
      const { fromDevice } = item.interface;
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
    const path = zoomedContainer ? `${keypath}/zoomed{${container}}` : keypath;
    const coordValue = pxToPc({ x, y }, container);
    setValue({ keypath: path, leaf: 'coord/x', value: coordValue.x });
    setValue({ keypath: path, leaf: 'coord/y', value: coordValue.y});
  };

  const handleMouseDown = event => {
    mouseDownPos.x = event.clientX;
    mouseDownPos.y = event.clientY;
  };

  const tooltipContent = (status) =>
    <table className="tooltip">
      <tbody>
        <tr><td>Device:</td><td>{device}</td></tr>
        <tr><td>Status:</td><td>{status}</td></tr>
        {status === 'reachable' &&
          <Fragment>
            <tr><td>Platform:</td><td>{platform.name}</td></tr>
            <tr><td>Version:</td><td>{platform.version}</td></tr>
            <tr><td>Model:</td><td>{platform.model}</td></tr>
          </Fragment>
        }
      </tbody>
    </table>;

  const { canDrop } = collectedDropProps;
  const { isDragging } = collectedDragProps;

  useEffect(() => {
    dispatch(iconHovered(canDrop && name));
  }, [ canDrop ]);

  useEffect(() => {
    iconDragPreview(getEmptyImage(), {});
  });

  const getStatus = () => {
    return platform ? 'reachable' : 'unreachable';
  };

  let status = getStatus();
  const top = { pcX, pcY };
  const outlineSize = expanded ? Math.round(size * ICON_OUTLINE_RATIO) : size;
  const outlineRadius = outlineSize / 2;
  const height = outlineSize;

  // The drag preview is not captured correctly on Safari,
  // so generate PNG image and use that
  isSafari && connectPngDragPreview(renderToStaticMarkup(
    <IconSvg type={type} status={status} size={size} />),
    size, endpointDragPreview, false
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
          left: `${top.pcX}%`,
          top: `${top.pcY}%`,
          transform: `translate(${-outlineSize/2}px, ${-outlineSize/2}px)`,
          borderRadius: `${outlineRadius}px`,
          height: `${height}px`,
          width: `${outlineSize}px`,
        }}
      >
      </div>
      <div
        className={classNames('icon__container', {
          'icon__container--hidden': !canDrop
        })}
        style={positionStyle(pcX, pcY, size*2)}
      >
        <IconHighlight size={size*2} colour={HOVER}/>
      </div>
      <div
        className={classNames('icon__container', {
          'icon__container--expanded': expanded,
          'icon__container--hidden': hidden || editMode ||
            !highlightedDevices || !highlightedDevices.includes(device)
        })}
        style={positionStyle(pcX, pcY, size*2)}
      >
        <IconHighlight size={size*2} colour={HIGHLIGHT}/>
      </div>
      {endpointDragPreview(
        <div
          id={`${name}-icon`}
          className={classNames('icon__container', {
            'icon__container--expanded': expanded,
            'icon__container--dragging': isDragging,
            'icon__container--hidden': hidden
          })}
          style={positionStyle(pcX, pcY, size)}
        >
          <div
            className="icon__svg-wrapper icon__svg-wrapper--hidden"
            style={{
              height: `${(height + size) / 2}px`,
              width: `${size}px`
            }}
          />
          <div className="icon__label">
            <span className="icon__label-text">{name}</span>
          </div>
          <Tippy
            placement="left"
            delay="250"
            content={tooltipContent(status)}
            disabled={editMode}
          >
            {endpointDrag(drop(iconDrag(
              <div
                onClick={handleOnClick}
                onMouseDown={handleMouseDown}
                className={classNames('icon__svg-wrapper',
                  'icon__svg-wrapper-absolute', {
                  'icon__svg-wrapper--hidden': hidden
                })}
                style={svgStyle(size)}
              >
                <IconSvg type={type} status={status} size={size} />
                <Interface
                  fromIcon={name}
                  fromDevice={device}
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
