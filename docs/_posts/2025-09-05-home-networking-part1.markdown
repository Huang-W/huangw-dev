---
layout: post
title:  "Home networking Part 1 - Gateways, Switches, and Access Points"
date:   2025-09-08 12:00:00 -0700
categories: pfsense proxmox networking tcp ip linksys arris modem xfinity comcast wifi ubiquiti
description: "Taking control of networking at home."
mermaid: true
---

Hi, so I have been working on my home networking design lately. There are a lot of practical reasons for doing this:

1. Through increased availability of logs and metrics, you gain a better understanding of the kinds of traffic you are (unknowingly) sending.
2. You are no longer ~~enslaved by google and cloudflare~~ reliant on public recursive name servers. Instead you query [root name servers](https://en.wikipedia.org/wiki/Root_name_server#Root_server_addresses) and [top level domain servers](https://en.wikipedia.org/wiki/List_of_Internet_top-level_domains).
3. Your wifi is faster than Xfinity's wifi. Actually, you make less DNS queries over the internet, so it can feel faster (when it works).
4. You can block ads using DNS.
5. You can create multiple private networks. For example, isolating the wifi network from physically-connected devices.
6. You can decrease power consumption, while increasing local network speed.
7. You are no longer reliant on ISP modem/gateway/access-point rentals.

There are a few design pricinples behind this project:
1. Make use of old hardware when possible. They say re-use is the purest form of recycling.
2. Critical infrastructure should have static IPs. This includes things like DNS server, DHCP server, Gateway, and physical or virtual switches.
3. Client connecting to the network should not require additional configuration (other than Wifi password).
4. Restarting the system should not require accessing the system.
5. There should be measureable and quantifiable benefits from the project.

Part of the inspiration behind the project was to put some life back into old hardware. The CPU and motherboard in the proxmox node are over a decade old, but they still support [hardware-assisted virtualization](https://en.wikipedia.org/wiki/X86_virtualization), [PCI passthrough](https://en.wikipedia.org/wiki/Single-root_input/output_virtualization), and upper level [C states](https://en.wikipedia.org/wiki/ACPI).

[![home-networking-solution](/assets/img/Home-networking.webp)](/assets/img/Home-networking.webp)

For purposes of this blog post, a [gateway](https://en.wikipedia.org/wiki/Gateway_(telecommunications)) sends traffic between networks. An access point is a wifi-enabled bridge which "bridges" devices to a network. A [bridge](https://en.wikipedia.org/wiki/Network_bridge) joins two or more networks: each wifi device can be like a network of one. A [switch](https://en.wikipedia.org/wiki/Multilayer_switch#Layer-2_switching) is a physical machine which makes routing decisions within a network. A router is some combination of the gateway, switch, or access point.

The reason I chose to run pfsense in proxmox rather than bare metal is because I don't have that much spare hardware. This solution allows me to run several VMs in the same machine.

The pfsense virtual machine is a DNS server, DHCP server, gateway, and firewall. The Pfsense virtual machine has control over the physical `enp2s0f0` WAN (wide area network) interface through PCI passthrough, and by default blocks all incoming traffic. I'm sure there is or will be some vulnerability in this setup which could be exploited by a smart person, but I honestly am not capable of explaining how it's less secure than bare metal.

The virtual machines see `vmbr0` as a [physical switch](https://wiki.archlinux.org/title/Network_bridge) and the network sees the virtual machines as individual machines with separate [MAC addresses](https://en.wikipedia.org/wiki/MAC_address). The proxmox machine has two [link aggregated](https://en.wikipedia.org/wiki/Link_aggregation) [SFP28](https://en.wikipedia.org/wiki/Small_Form-factor_Pluggable) ports connected with [direct attach copper](https://en.wikipedia.org/wiki/Twinaxial_cabling) cables to the ubiquiti switch. The Linksys access point runs in bridge mode with DHCP server off.

Next steps for me:
1. Assign VLANs to each port on the ubiquiti switch
2. Limit access to the virtual machines by (VLAN) network
3. Split out DNS and DHCP functionality from pfsense into separate VMs
4. Setup a NAS
5. Configure DNS-based ad blocking
6. Consider running a VPN so I can access parts of network outside of home
7. Consider starting up second proxmox node
