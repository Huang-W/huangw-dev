---
layout: post
title:  "Hybrid (cloud) email"
date:   2025-09-08 13:00:00 -0700
categories: ses s3 sns http porkbun cloudflare aws dovecot mailcow
description: "Cheap option for unlimited custom domain emails (for those that don't value their time)."
mermaid: true
---

Hi, so **big disclaimer**. This post is not ready yet. But I'm currently looking for work, and I want to demonstrate my skillset a bit, so I'm just going to post the very simple architecture that I've used to more or less achieve unlimited custom domain emails.

Porkbun was used for domain registration because they are very cheap, and yet fully featured. Cloudflare is of course still the cheapest option, offering ICANN prices, but I did not choose them for only one reason, which is that cloudflare doesn't let you use a custom authoratative name server for your domain, locking you to cloudflare name servers. I have great respect for cloudflare still, and even configured my domain in porkbun to use cloudflare as authoratative name servers.

The idea here is to use SES as SMTP server for sending email. I chose this approach over a fully self-hosted option for two reasons:
1. I can leverage the reputation of IP pools owned by SES for sending emails
2. I don't have to worry about missed emails because Amazon will save them for me
 
From what I've heard, IP is one of the biggest factor in email rejection, and can cause a rejection even if SPF, DKIM, and DMARC are configured properly with strict policies and even if you have an old sending domain. For example, [spamhaus](https://www.spamhaus.org/) has an ASN drop list, and there is some contention about whether inclusion in this even legal: see [spamhaus conflicts on wikipedia](https://en.wikipedia.org/wiki/The_Spamhaus_Project#Conflicts) for more info. At my old employer, RingCentral, we had to get our IPs removed from Spamhaus's blacklist a few times.

Another problem with receiving emails on a residential IP is that everyone knows your IP. Also, if your email-receiving server is down, you will miss emails.

Finally, I didn't want to choose a cloud-hosted virtual machine because of costs and complexity of hosting an email server.

So the design is simple:
1. Send emails using SES
2. Store emails in S3
3. Send webhooks to residential IP when new object in S3 is created
4. Pull email from S3 when webhook is received
5. Move emails to appropriate folder for dovecot to process
6. Configure your email client to use dovecot as IMAP server and SES as SMTP server
7. Get a job offer hopefully, or just see how many emails you end up creating.

[![email-hybrid-solution](/assets/img/SES-Home-Hybrid.webp)](/assets/img/SES-Home-Hybrid.webp)

I will share the terraform for cloudflare and AWS at some point, and provide more info on dovecot configuration. You may also consider using [mailcow](https://mailcow.email/) which includes dovecot among other applications.

If you plan on creating a bunch of custom emails, I recommend creating a subdomain for email sending, so you avoid my mistake of thinking that SES email receiving supported wildcards.

![ses-email-receive](/assets/img/2025-09-08_17-09.png)

Next steps + future improvements to this post:
1. Notification of failed webhook delivers from SNS
2. Encrypting the emails at rest in S3 using my own GPG key.
