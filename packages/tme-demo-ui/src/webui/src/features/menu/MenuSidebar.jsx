import React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Sidebar from '../common/Sidebar';
import NodeListWrapper from './panels/NodeListWrapper';
import { topologyToggled,
         getOpenTopology } from 'features/menu/menuSlice';

import * as Tenant from './modules/Tenant';

const demoTopology = '/topologies/topology{demo}';

function MenuSidebar() {
  console.debug('MenuSidebar Render');

  const dispatch = useDispatch();
  const openTopology = useSelector((state) => getOpenTopology(state));

  useEffect(() => {
    if (openTopology !== demoTopology) {
      dispatch(topologyToggled(demoTopology));
    }
  }, [ dispatch, openTopology ]);

  return (
    <Sidebar>
      <NodeListWrapper
        title="Tenants"
        label="Tenant"
        keypath={Tenant.path}
        fetching={Tenant.useFetchStatus()}
      >
        {Tenant.useQuery().data?.map(({ name }) =>
          <Tenant.Component key={name} name={name} />)}
      </NodeListWrapper>
    </Sidebar>
  );
}

export default MenuSidebar;
