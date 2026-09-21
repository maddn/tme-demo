import React, { Fragment, memo, useState } from 'react';
import { useSelector } from 'react-redux';

import InlineBtn from 'features/common/buttons/InlineBtn';
import { BTN_EYE_CLOSED, BTN_EYE_OPEN } from 'constants/Icons';
import NacmRuleLists from 'features/menu/NacmRuleLists';

import { getSystemSetting } from 'api';
import { useDeleteJsonConfig, useLoadJsonConfig } from 'api/loadJsonConfig';

const excludeRuleLists = [ 'admin', 'any-group' ];

const sharedReadAccessProfile = {
  '/nacm': {
    'rule-list': [
      {
        'name': 'tenant-acme-access',
        'group': [ 'tenant-acme' ],
        'rule': [
          {
            'name': 'permit-own-tenant',
            'path': "/tme-demo:tme-demo/tme-demo:tenant[tme-demo:name='ACME']",
            'access-operations': 'create read update delete exec',
            'action': 'permit'
          },
          {
            'name': 'deny-other-tenants',
            'path': '/tme-demo:tme-demo/tme-demo:tenant',
            'access-operations': 'create update delete exec',
            'action': 'deny'
          }
        ]
      },
      {
        'name': 'tenant-cyberdyne-access',
        'group': [ 'tenant-cyberdyne' ],
        'rule': [
          {
            'name': 'permit-own-tenant',
            'path': "/tme-demo:tme-demo/tme-demo:tenant[tme-demo:name='Cyberdyne']",
            'access-operations': 'create read update delete exec',
            'action': 'permit'
          },
          {
            'name': 'deny-other-tenants',
            'path': '/tme-demo:tme-demo/tme-demo:tenant',
            'access-operations': 'create update delete exec',
            'action': 'deny'
          }
        ]
      },
      {
        'name': 'tenant-stark-access',
        'group': [ 'tenant-stark' ],
        'rule': [
          {
            'name': 'permit-own-tenant',
            'path': "/tme-demo:tme-demo/tme-demo:tenant[tme-demo:name='STARK']",
            'access-operations': 'create read update delete exec',
            'action': 'permit'
          },
          {
            'name': 'deny-other-tenants',
            'path': '/tme-demo:tme-demo/tme-demo:tenant',
            'access-operations': 'create update delete exec',
            'action': 'deny'
          }
        ]
      }
    ]
  }
};

const tenantIsolationProfile = {
  '/nacm': {
    'rule-list': [
      {
        'name': 'tenant-acme-access',
        'group': [ 'tenant-acme' ],
        'rule': [
          {
            'name': 'permit-own-tenant',
            'path': "/tme-demo:tme-demo/tme-demo:tenant[tme-demo:name='ACME']",
            'access-operations': 'create read update delete exec',
            'action': 'permit'
          },
          {
            'name': 'deny-other-tenants',
            'path': '/tme-demo:tme-demo/tme-demo:tenant',
            'access-operations': 'create read update delete exec',
            'action': 'deny'
          }
        ]
      },
      {
        'name': 'tenant-cyberdyne-access',
        'group': [ 'tenant-cyberdyne' ],
        'rule': [
          {
            'name': 'permit-own-tenant',
            'path': "/tme-demo:tme-demo/tme-demo:tenant[tme-demo:name='Cyberdyne']",
            'access-operations': 'create read update delete exec',
            'action': 'permit'
          },
          {
            'name': 'deny-other-tenants',
            'path': '/tme-demo:tme-demo/tme-demo:tenant',
            'access-operations': 'create read update delete exec',
            'action': 'deny'
          }
        ]
      },
      {
        'name': 'tenant-stark-access',
        'group': [ 'tenant-stark' ],
        'rule': [
          {
            'name': 'permit-own-tenant',
            'path': "/tme-demo:tme-demo/tme-demo:tenant[tme-demo:name='STARK']",
            'access-operations': 'create read update delete exec',
            'action': 'permit'
          },
          {
            'name': 'deny-other-tenants',
            'path': '/tme-demo:tme-demo/tme-demo:tenant',
            'access-operations': 'create read update delete exec',
            'action': 'deny'
          }
        ]
      }
    ]
  }
};

function TenantAccessControl() {
  console.debug('TenantAccessControl Render');

  const currentUser = useSelector(state =>
    getSystemSetting.select('user')(state).data?.result);

  const deleteJsonConfig = useDeleteJsonConfig();
  const loadJsonConfig = useLoadJsonConfig();

  const [ profileLoading, setProfileLoading ] = useState(false);

  const profileConfigs = [ sharedReadAccessProfile, tenantIsolationProfile ];
  const loadProfile = async profile => {
    setProfileLoading(true);
    try {
      await deleteJsonConfig(profileConfigs);
      await loadJsonConfig(profile);
    } finally {
      setProfileLoading(false);
    }
  };

  return currentUser === 'admin'
    ? (
    <NacmRuleLists
      excludeRuleLists={excludeRuleLists}
      headerActions={
        <Fragment>
          <InlineBtn
            icon={BTN_EYE_OPEN}
            tooltip="Load Shared Read Access Rule List"
            disabled={profileLoading}
            onClick={event => {
              event.stopPropagation();
              loadProfile(sharedReadAccessProfile);
            }}
          />
          <InlineBtn
            icon={BTN_EYE_CLOSED}
            tooltip="Load Tenant Isolation Rule List"
            disabled={profileLoading}
            onClick={event => {
              event.stopPropagation();
              loadProfile(tenantIsolationProfile);
            }}
          />
        </Fragment>
      }
    />
    )
    : null;
}

export default memo(TenantAccessControl);
