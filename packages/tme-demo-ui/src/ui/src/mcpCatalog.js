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
    includeInChat: true,
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
      'the tenant context.',
    messages: [
      {
        text: 'Which tenant am I working on?',
        includeResource: false
      },
      'What L3VPN endpoints are configured for this tenant?',
      'Check all VPN endpoint devices are in sync',
      {
        text: 'Add a VPN endpoint called London using ce2 interface 0/1',
        includeResource: false
      },
      {
        text: 'Add a VPN endpoint called Paris using ce3 interface 0/1 with ' +
          '20 Mbps bandwidth and choose any IP network',
        includeResource: false
      },
      'Update the bandwidth for all VPN endpoints to 20 Mbps and preview ' +
        'the changes'
    ]
  },
  {
    note: 'Clear the tenant selection first so the assistant uses the ' +
      'tenant named in the message.',
    messages: [
      {
        text: 'Redeploy tenant STARK',
        includeResource: false
      }
    ]
  }
];
