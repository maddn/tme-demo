# -*- mode: python; python-indent: 4 -*-
import ncs
from common_topology import GetDeviceConfiguration
from ncs.application import Service
from ncs.application import PlanComponent


# ------------------------
# SERVICE CALLBACK EXAMPLE
# ------------------------
class ServiceCallbacks(Service):

    # The create() callback is invoked inside NCS FASTMAP and
    # must always exist.
    @Service.create
    def cb_create(self, tctx, root, service, proplist):
        self.log.info('Service create(service=', service._path, ')')

        self_plan = PlanComponent(service, 'self', 'ncs:self')
        self_plan.append_state('ncs:init')
        self_plan.append_state('ncs:ready')
        self_plan.set_reached('ncs:init')

        if service.l3vpn.exists():
            self.log.info('Configuring L3VPN')

            l3vpn_plan = PlanComponent(service, 'l3vpn', 'tme-demo:l3vpn')
            l3vpn_plan.append_state('ncs:init')
            l3vpn_plan.append_state('ncs:ready')
            l3vpn_plan.set_reached('ncs:init')
            template = ncs.template.Template(service)
            template.apply('l3vpn')
            l3vpn_plan.set_reached('ncs:ready')

        if service.data_centre.exists():
            self.log.info('Configuring data-centre connectivity')
            data_centre_plan = PlanComponent(service, 'data-centre',
                                             'tme-demo:data-centre')
            data_centre_plan.append_state('ncs:init')
            data_centre_plan.append_state('ncs:ready')
            data_centre_plan.set_reached('ncs:init')
            template = ncs.template.Template(service)
            template.apply('data-centre')
            data_centre_plan.set_reached('ncs:ready')

        self_plan.set_reached('ncs:ready')
        self.log.info('Service ready')


# ---------------------------------------------
# COMPONENT THREAD THAT WILL BE STARTED BY NCS.
# ---------------------------------------------
class Main(ncs.application.Application):
    def setup(self):
        # The application class sets up logging for us. It is accessible
        # through 'self.log' and is a ncs.log.Log instance.
        self.log.info('Main RUNNING')

        # Service callbacks require a registration for a 'service point',
        # as specified in the corresponding data model.
        self.register_service('tme-demo-servicepoint', ServiceCallbacks)

        # When using actions, this is how we register them:
        #
        self.register_action('get-device-configuration', GetDeviceConfiguration)

    def teardown(self):
        # When the application is finished (which would happen if NCS went
        # down, packages were reloaded or some error occurred) this teardown
        # method will be called.

        self.log.info('Main FINISHED')
