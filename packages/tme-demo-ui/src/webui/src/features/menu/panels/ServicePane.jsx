import React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { COMMIT_MANAGER_URL } from 'constants/Layout';
import * as IconTypes from 'constants/Icons';

import NodePane from './NodePane';
import InlineBtn from 'features/common/buttons/InlineBtn';

import { getOpenService, serviceToggled } from '../menuSlice';
import { highlightedIconsUpdated } from 'features/topology/topologySlice';

import { stopThenGoToUrl } from 'api/comet';
import { useActionMutation, useGetValueQuery } from 'api/data';


function ServicePane({
  keypath, serviceKeypath = keypath, serviceReference = serviceKeypath,
  children, title, label, ...rest
}) {
  console.debug('ServicePane Render');

  const queryPath = serviceKeypath.endsWith('/..')
      ? serviceKeypath.substring(0,
        serviceKeypath.lastIndexOf('/', serviceKeypath.length - 4))
      : serviceKeypath;

  const { data } = useGetValueQuery({
    keypath: `${queryPath}/modified/devices`,
    tag: 'device-list'
  });

  const isOpen = useSelector((state) =>
    getOpenService(state) === serviceReference);
  const fade = useSelector((state) => !!getOpenService(state));

  const highlightedIcons = useMemo(() => isOpen ? data : [], [ isOpen, data ]);

  const dispatch = useDispatch();
  const toggled = useCallback(() =>
    dispatch(serviceToggled(serviceReference)), [ serviceReference ]);

  useEffect(() => isOpen && dispatch(
    highlightedIconsUpdated({ highlightedIcons })
  ), [ highlightedIcons ]);

  const [ action ] = useActionMutation();
  const redeploy = useCallback(async (event) => {
    event.stopPropagation();
    await action({
      transType: 'read_write',
      path: `${serviceKeypath}/touch`
    });
    dispatch(stopThenGoToUrl(COMMIT_MANAGER_URL));
  }, [ action, dispatch, serviceKeypath ]);

  return (
    <NodePane
      keypath={keypath}
      title={title || label}
      underscore={serviceKeypath !== keypath}
      label={label}
      isOpen={isOpen}
      fade={fade}
      nodeToggled={toggled}
      extraButtons={
        <InlineBtn
          icon={IconTypes.BTN_REDEPLOY}
          classSuffix="redeploy"
          tooltip={`Redeploy (Touch) ${label}`}
          onClick={redeploy}
        />
      }
      {...rest}
    >
      {children}
    </NodePane>
  );
}

export default ServicePane;
