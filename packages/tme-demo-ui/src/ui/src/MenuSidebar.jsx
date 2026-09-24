import React from 'react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import SidebarPane from 'features/common/SidebarPane';
import CreatableNodeSection from 'features/menu/panels/CreatableNodeSection';
import ServiceList from 'features/menu/panels/ServiceList';
import { topologyToggled,
         getOpenTopology, getOpenContextName } from 'features/menu/menuSlice';

import * as Tenant from './Tenant';
import * as Vpn from './Vpn';
import * as DataCentre from './DataCentre';
import TenantAccessControl from './TenantAccessControl';

const demoTopology = '/topologies/topology{demo}';

function MenuSidebar() {
  console.debug('MenuSidebar Render');

  const dispatch = useDispatch();
  const openTopology = useSelector((state) => getOpenTopology(state));
  const openTenantName = useSelector(getOpenContextName);

  useEffect(() => {
    if (openTopology !== demoTopology) {
      dispatch(topologyToggled(demoTopology));
    }
  }, [ dispatch, openTopology ]);

  return (
    <SidebarPane footer={<TenantAccessControl />}>
      <CreatableNodeSection
        title="Tenants"
        label={Tenant.label}
        keypath={Tenant.path}
        fetching={Tenant.useFetchStatus()}
      >
        {Tenant.useQuery().data?.map(({ name }) =>
          <Tenant.Component key={name} name={name} />)}
      </CreatableNodeSection>
      <ServiceList
        module={Vpn}
        stackedModule={Tenant}
        contextName={openTenantName}
        disableCreate={true}
      />
      <ServiceList
        module={DataCentre}
        stackedModule={Tenant}
        contextName={openTenantName}
        disableCreate={true}
      />
    </SidebarPane>
  );
}

export default MenuSidebar;
