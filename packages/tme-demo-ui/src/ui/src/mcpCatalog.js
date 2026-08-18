export const POLICY_RULES = [
  {
    sequence: 100,
    namespace: 'http://example.com/tme-demo',
    description: 'Permit tme-demo service tools for the MCP demo'
  },
  {
    sequence: 101,
    namespace: 'http://com/example/l3vpn',
    description: 'Permit L3VPN service tools for the MCP demo'
  },
  {
    sequence: 102,
    namespace: 'http://com/example/connectivity',
    description: 'Permit datacenter service tools for the MCP demo'
  }
];

export const SERVICE_SCHEMAS = [
  { label: 'Tenant',
    path: '/tme-demo:tme-demo/tenant',
    keyName: '__key__tenant__name',
    selectionSource: 'context',
    attachToChat: true,
    toolPrefix: 'tme_demo_tme_demo_tenant'
  },
  { label: 'L3VPN',
    path: '/l3vpn:vpn/l3vpn',
    keyName: '__key__l3vpn__name',
    selectionSource: 'service',
    selectionPath: '/tme-demo:tme-demo/tenant/l3vpn',
    toolPrefix: 'l3vpn_vpn_l3vpn'
  },
  { label: 'Data Centre',
    path: '/connectivity:datacenter/connectivity',
    keyName: '__key__connectivity__name',
    selectionSource: 'service',
    selectionPath: '/tme-demo:tme-demo/tenant/data-centre',
    toolPrefix: 'connectivity_datacenter_connectivity'
  }
];

export const SUGGESTED_MESSAGE_GROUPS = [
  {
    note: 'Select a tenant in the sidebar first so the assistant receives ' +
      'the tenant resource.',
    messages: [
      'Which tenant am I working on?',
      'What L3VPN endpoints are configured for this tenant?',
      'Check all VPN endpoint devices are in sync',
      'Add a VPN endpoint called London using ce2',
      'Add a VPN endpoint called Paris using ce3 with 20 Mbps bandwidth ' +
        'and choose a valid IP network',
      'Update the bandwidth for all VPN endpoints to 20 Mbps and preview ' +
        'the changes'
    ]
  },
  {
    note: 'Clear the tenant selection first so the assistant uses the ' +
      'tenant named in the message.',
    messages: [
      'Redeploy tenant STARK'
    ]
  }
];
