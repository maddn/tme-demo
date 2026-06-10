import React from 'react';
import { useMemo } from 'react';

import { CUSTOMER_ROUTER, SWITCH } from 'constants/Icons';

import ServicePane from 'features/menu/panels/ServicePane';
import DroppableNodeList, { DROP_BEHAVIOUR_OPEN_NEW_ITEM,
       DROP_BEHAVIOUR_GOTO } from 'features/menu/panels/DroppableNodeList';

import { useQueryQuery, useMemoizeWhenFetched, swapLabels, selectItem,
         createItemsSelector, useQueryState } from 'api/query';


export const label = 'Tenant';
export const service = 'tenant';

const selection = {
  'l3vpn/route-distinguisher':      'Route Distinguisher',
  'l3vpn/qos-policy':               'QoS Policy',
  'data-centre/ip-network':         'Data Centre IP Network',
  'data-centre/vlan':               'Data Centre VLAN',
  'data-centre/preserve-vlan-tags': 'Preserve VLAN Tags'
};

export const path = '/tme-demo:tme-demo/tenant';
const l3vpn = 'l3vpn/endpoint';
const datacentre='data-centre/endpoint';

export function useQuery(selectFromResult) {
  return useQueryQuery({
    xpathExpr: path,
    selection: [
      'name',
      ...Object.keys(selection)
    ]
  }, { selectFromResult });
}

function useTenant(name) {
  return useQuery(selectItem('name', name));
}

export function useFetchStatus() {
  return useMemoizeWhenFetched({
    'Tenants': useQueryState(path),
    'L3VPN Endpoints': useQueryState(`${path}/${l3vpn}`),
    'DC Endpoints': useQueryState(`${path}/${datacentre}`)
  });
}

export function Component({ name }) {
  console.debug('Tenant Render');

  const { data } = useTenant(name);
  const { keypath } = data;

  const l3vpnSelector = useMemo(() =>
    createItemsSelector('parentName', name), [ name ]);
  const datacentreSelector = useMemo(() =>
    createItemsSelector('parentName', name), [ name ]);

  return (
    <ServicePane
      key={name}
      title={name}
      serviceReference={name}
      { ...{ label, keypath, ...swapLabels(data, selection) }}
    >
      <DroppableNodeList
        allowDrop={true}
        accept={CUSTOMER_ROUTER}
        dropBehaviour={DROP_BEHAVIOUR_OPEN_NEW_ITEM}
        label="VPN Endpoint"
        keypath={`${keypath}/${l3vpn}`}
        baseSelect={[ 'id', '../../name' ]}
        labelSelect={{
          'ce-device':    'Device',
          'ce-interface': 'Interface',
          'ip-network':   'IP Network',
          'bandwidth':    'Bandwidth',
          'as-number':    'AS Number'
        }}
        selector={l3vpnSelector}
        newItemDefaults={name => (
          [{ path: 'ce-device', value: name }]
        )}
      />
      <DroppableNodeList
        allowDrop={true}
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
        keypath={`${keypath}/${datacentre}`}
        baseSelect={[ 'concat(device, " ", compute)', '../../name' ]}
        labelSelect={{
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
        }}
        selector={datacentreSelector}
      />
   </ServicePane>
  );
}
