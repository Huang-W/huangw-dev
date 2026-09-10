---
layout: post
title:  "Hybrid (cloud) email"
date:   2025-09-08 13:00:00 -0700
categories: ses s3 sns http porkbun cloudflare aws dovecot mailcow
description: "Cheap option for unlimited custom domain emails (for those that don't value their time)."
mermaid: true
---

I started this project with a few goals in mind:
1. Support email receiving for multiple [FQDAs](https://en.wikipedia.org/wiki/Fully_qualified_domain_address) in the same domain.
2. Email backed up to cloud.
3. Support email sending for multiple FQDAs in the same domain.
4. Email reading can be done using mail client on local network.

# Smtp server

Initially, I chose to use [Amazon SES](https://docs.aws.amazon.com/ses/latest/dg/Welcome.html) as an SMTP server over a fully self-hosted option for a few reasons:
1. Leverage the reputation of IP pools owned by SES for sending emails
2. Less downtime than with self-hosted option (misconfigured, power outage, etc.)

From what I've heard, IP is one of the biggest factor in email rejection, and can cause a rejection even if SPF, DKIM, and DMARC are configured properly with strict policies and even if you have an old sending domain. For example, [spamhaus](https://www.spamhaus.org/) has an ASN drop list, and there is some contention about whether inclusion in this even legal: see [spamhaus conflicts on wikipedia](https://en.wikipedia.org/wiki/The_Spamhaus_Project#Conflicts) for more info. At my old employer, RingCentral, we had to get our IPs removed from Spamhaus's blacklist a few times.

In practice though, the age of my domain still impacts my reputation, and I've gotten reports that my emails still hit the spam filter.

# Design overview

[![email-hybrid-solution](/assets/img/SES-Home-Hybrid-v2.webp)](/assets/img/SES-Home-Hybrid-v2.webp)

The final flow is :
1. Send emails using SES
2. Store emails in S3
3. Send webhooks to residential IP when new object in S3 is created
4. Pull email from S3 when webhook is received
5. Move emails to appropriate folder for dovecot to process
6. Configure your email client to use dovecot as IMAP server and SES as SMTP server

I ended up creating a subdomain for email sending, since SES email receiving didn't support wildcards.

![ses-email-receive](/assets/img/2025-09-08_17-09.png)
