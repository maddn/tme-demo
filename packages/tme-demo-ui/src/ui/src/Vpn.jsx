import React from 'react';
import { useMemo } from 'react';

import { CUSTOMER_ROUTER } from 'constants/Icons';

import ServicePane from 'features/menu/panels/ServicePane';
import DroppableNodeList, {
  DROP_BEHAVIOUR_OPEN_NEW_ITEM
} from 'features/menu/panels/DroppableNodeList';

import { useQueryQuery, useMemoizeWhenFetched, swapLabels,
         createItemsSelector } from 'api/query';
import { useQueryState, useData } from 'features/menu/panels/ServiceList';


export const label = 'L3VPN';
export const title = 'Managed VPNs';
export const service = 'l3vpn';
export const path = '/l3vpn:vpn/l3vpn';
export const stackedPath = `/tme-demo:tme-demo/tenant/${service}`;

const tenantKeypath = name => `/tme-demo:tme-demo/tenant{${name}}`;

const stackedSelection = {
  'route-distinguisher': 'Route Distinguisher',
  'qos-policy':          'QoS Policy'
};

const serviceSelection = {
  'route-distinguisher': 'Route Distinguisher',
  'qos/qos-policy':     'QoS Policy'
};

function useServiceQueryState(suffix, queryKey) {
  return useQueryState(
    suffix ? `${path}/${suffix}` : path,
    suffix ? `${stackedPath}/${suffix}` : stackedPath,
    queryKey
  );
}

export function useQuery(itemSelector, stacked) {
  return useQueryQuery({
    xpathExpr: stacked ? stackedPath : path,
    selection: [
      stacked ? '../name' : 'name',
      ...Object.keys(stacked ? stackedSelection : serviceSelection)
    ]
  }, { selectFromResult: itemSelector });
}

export function useFetchStatus() {
  return useMemoizeWhenFetched({
    'L3VPN Services': useServiceQueryState(),
    'L3VPN Endpoints': useServiceQueryState('endpoint')
  });
}

const getName = item => item.parentName || item.name;

export const getContextName = getName;
export const getServiceName = getName;

export function Component({ name }) {
  console.debug('Vpn Render');

  const [ data, serviceKeypath ] = useData(
    useQuery, name, undefined, 'name', 'parentName');
  const vpnSelector = useMemo(() =>
    createItemsSelector('parentName', name), [ name ]);

  if (!data) {
    return null;
  }

  const stacked = !!data.parentName;
  const keypath = data.keypath;

  return (
    <ServicePane
      key={`${name}-l3vpn`}
      title={`VPN ${name}`}
      label={label}
      keypath={keypath}
      serviceKeypath={serviceKeypath}
      parentServiceKeypath={stacked ? tenantKeypath(name) : undefined}
      disableRedeploy={true}
      disableDelete={true}
      { ...swapLabels(data,
        stacked ? stackedSelection : serviceSelection) }
    >
      <DroppableNodeList
        allowDrop={true}
        accept={CUSTOMER_ROUTER}
        dropBehaviour={DROP_BEHAVIOUR_OPEN_NEW_ITEM}
        label="VPN Endpoint"
        keypath={`${keypath}/endpoint`}
        baseSelect={[ 'id', stacked ? '../../name' : '../name' ]}
        labelSelect={{
          'ce-device':    'Device',
          'ce-interface': 'Interface',
          'ip-network':   'IP Network',
          'bandwidth':    'Bandwidth',
          'as-number':    'AS Number'
        }}
        selector={vpnSelector}
        newItemDefaults={name => (
          [{ path: 'ce-device', value: name }]
        )}
      />
    </ServicePane>
  );
}
