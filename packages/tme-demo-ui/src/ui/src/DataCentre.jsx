import React from 'react';
import { useMemo } from 'react';

import { SWITCH } from 'constants/Icons';

import ServicePane from 'features/menu/panels/ServicePane';
import DroppableNodeList, {
  DROP_BEHAVIOUR_GOTO
} from 'features/menu/panels/DroppableNodeList';

import { useQueryQuery, useMemoizeWhenFetched, swapLabels,
         createItemsSelector } from 'api/query';
import { useQueryState, useData } from 'features/menu/panels/ServiceList';


export const label = 'Data Centre VLAN';
export const title = 'Data Centre';
export const service = 'data-centre';
export const path = '/connectivity:datacenter/connectivity';
export const stackedPath = `/tme-demo:tme-demo/tenant/${service}`;

const tenantKeypath = name => `/tme-demo:tme-demo/tenant{${name}}`;

const stackedSelection = {
  'ip-network':                   'Data Centre IP Network',
  'vlan':                         'Data Centre VLAN',
  'boolean(preserve-vlan-tags)':  'Preserve VLAN Tags'
};

const serviceSelection = {
  'ip-network': 'Data Centre IP Network',
  'vlan':       'Data Centre VLAN',
  'boolean(connectivity-settings/preserve-vlan-tags)':
    'Preserve VLAN Tags'
};

const endpointSelection = {
  'device':   'Device',
  'compute':  'Compute',
  'ios-GigabitEthernet':    'Interface',
  'ios-xr-GigabitEthernet': 'Interface',
  'ios-xr-TenGigE':         'Interface',
  'junos-interface':        'Interface',
  'alu-interface':          'Interface',
  'nx-Ethernet':            'Interface',
  'nx-port-channel':        'Interface',
  'f10-GigabitEthernet':    'Interface',
  'connect-multiple-vlans': 'Connect Multiple VLANS'
};

const serviceEndpointSelection = {
  'device': 'Device',
  'interface': 'Interface',
  'boolean(endpoint-settings/connect-multiple-vlans)':
    'Connect Multiple VLANS'
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
    'Data Centre Services': useServiceQueryState(),
    'DC Endpoints': useServiceQueryState('endpoint')
  });
}

const getName = item => item.parentName || item.name;

export const getContextName = getName;
export const getServiceName = getName;

export function Component({ name }) {
  console.debug('DataCentre Render');

  const [ data, serviceKeypath ] = useData(
    useQuery, name, undefined, 'name', 'parentName');
  const dataCentreSelector = useMemo(() =>
    createItemsSelector('parentName', name), [ name ]);

  if (!data) {
    return null;
  }

  const stacked = !!data.parentName;
  const keypath = data.keypath;

  return (
    <ServicePane
      key={`${name}-data-centre`}
      title={`VLAN ${data.vlan}`}
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
        allowDrop={stacked}
        disableCreate={true}
        accept={SWITCH}
        calculateName={(name, data) => {
          let compute = 0;
          while (compute < 5) {
            if (!data?.filter(dcEndpoint => dcEndpoint.device === name).find(
              dcEndpoint => dcEndpoint.compute === `compute${compute}`)) {
                break;
            }
            compute++;
          }
          return `${name} compute${compute}`;
        }}
        dropBehaviour={DROP_BEHAVIOUR_GOTO}
        label="Data Centre Endpoint"
        keypath={`${keypath}/endpoint`}
        baseSelect={stacked
          ? [ 'concat(device, " ", compute)', '../../name' ]
          : [ 'concat(device, " ", interface)', '../name' ]}
        labelSelect={stacked ? endpointSelection : serviceEndpointSelection}
        selector={dataCentreSelector}
      />
    </ServicePane>
  );
}
