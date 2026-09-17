## Lab Notes

Performance depends on current dCloud platform load. Allow the session to fully
initialise before starting the walkthrough.

When accessing the dCloud session from a local browser, use Google Chrome or
Mozilla Firefox.

## Requirements

The dCloud session provides the NSO host, simulated network devices, and remote
desktop environment. A presenter needs:

- a laptop with a supported browser
- Cisco AnyConnect, to connect to the NSO instance from a local browser
- an RDP client, when using the provided Windows workstation to run the demo

## About This Solution

Network Services Orchestrator (NSO) is an industry-leading orchestration
platform for hybrid networks. It provides comprehensive lifecycle service
automation to enable you to design and deliver high-quality services faster
and more easily. NSO supports the process of validating, implementing and
abstracting your network config and network services, providing support for the
entire transformation into intent-based networking.

## dCloud Access

The following table shows the addresses and credentials for the demo
components.

| Component | Address | Access | Username | Password |
| --- | --- | --- | --- | --- |
| Windows workstation | `198.18.133.252` | RDP | `administrator` | `C1sco12345` |
| NSO Web UI | `http://198.18.134.28/` | Browser | `admin` | `admin` |
| NSO CLI | `198.18.134.28:2024` | SSH | `admin` | `admin` |
| NSO host | `198.18.134.28:22` | SSH | `cisco` | `cisco` |

For best performance, connect to the dCloud environment with Cisco AnyConnect.
Once connected to AnyConnect, the NSO Web UI can be accessed from a local
browser. Alternatively use a local RDP client to access the Windows workstation
and run the demo from there.

On the Windows workstation, wait until all stages of the dCloud launch progress
are green before opening the NSO Web UI.

## Accessing NSO from the Windows Workstation

### NSO Web UI

On the Windows workstation, open Chrome and use the NSO bookmark. If the
bookmark is not present, open the NSO Web UI directly using the address listed
in the dCloud Access table above.

Log in with the NSO Web UI credentials from the dCloud Access table above.

### NSO CLI

The Windows workstation provides console shortcuts for the NSO CLI and the NSO
host. These shortcuts can be found in the *Console* menu on the right side of
the Windows task bar.

The NSO CLI shortcut opens the NSO operational CLI directly. The NSO host
shortcut opens a shell on the host running NSO.

From the NSO host shell, the NSO CLI can also be started with:

```text
ncs_cli -Cu admin
```

Presenters can also use an SSH client from their laptop when connected to
dCloud with AnyConnect.
