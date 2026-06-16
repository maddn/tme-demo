import React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ServicePane from 'features/menu/panels/ServicePane';

import { getOpenContext, getOpenService,
         toggleContext, setOpenService } from 'features/menu/menuSlice';

import { useQueryQuery, useMemoizeWhenFetched, selectItem,
         useQueryState } from 'api/query';

import { path as l3vpnPath } from './Vpn';
import { path as dataCentrePath } from './DataCentre';

export const label = 'Tenant';
export const service = 'tenant';
export const path = `/tme-demo:tme-demo/${service}`;

export function useQuery(itemSelector) {
  return useQueryQuery({
    xpathExpr: path,
    selection: [ 'name' ]
  }, { selectFromResult: itemSelector });
}

export function useFetchStatus() {
  return useMemoizeWhenFetched({
    'Tenants': useQueryState(path)
  });
}

export function Component({ name }) {
  console.debug('Tenant Render');

  const { data } = useQuery(selectItem('name', name));
  const { keypath } = data;
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => getOpenContext(state) === keypath);
  const fade = useSelector((state) => !!getOpenContext(state));
  const openServiceMissing = useSelector((state) =>
    getOpenContext(state) === keypath && !getOpenService(state));

  const configReferences = useMemo(() => [
    `${l3vpnPath}{${name}}`,
    `${dataCentrePath}{${name}}`
  ], [ name ]);

  useEffect(() => {
    if (openServiceMissing) {
      dispatch(setOpenService(keypath));
    }
  }, [ dispatch, keypath, openServiceMissing ]);

  const toggle = useCallback(() => {
    if (isOpen) {
      dispatch(toggleContext(keypath));
      dispatch(setOpenService(undefined));
    } else {
      dispatch(toggleContext(keypath));
      dispatch(setOpenService(keypath));
    }
  }, [ dispatch, isOpen, keypath ]);

  return (
    <ServicePane
      level="0"
      title={name}
      label={label}
      keypath={keypath}
      configReferences={configReferences}
      isOpen={isOpen}
      fade={fade}
      toggled={toggle}
    />
  );
}
