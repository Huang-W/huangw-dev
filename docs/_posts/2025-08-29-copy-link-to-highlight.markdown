---
layout: post
title:  "Copy link to highlight in FireFox"
date:   2025-08-29 13:00:00 -0700
categories: mozilla firefox chrome
description: "How to enable Chrome's copy link to highlight feature in FireFox."
---

Hi! So this post will be very short.

So one of my favorite features in Chrome is the "link to highlight" feature.

![Link to highlight](/assets/img/Google-Chrome-Link-to-Highlight.avif)

It's just so convenient when sharing links to long pages.

Now, for a long time, I was kind of bummed that this feature wasn't available in FireFox, but it turns out that it's been available for a while!

I'm not sure why, but currently the feature is hidden behind a feature flag. And you can find this flag in a related [bugzilla ticket](https://bugzilla.mozilla.org/show_bug.cgi?id=1779688).

To enable the feature, type `about:config` into your browser URL field.

![about:config](/assets/img/2025-08-29_16-35.png)

Accept the warning.

![about:config warning](/assets/img/2025-08-29_16-36.png)

Now enter the feature flag `dom.text_fragments.create_text_fragment.enabled` and click the two arrows on the right to flip the flag from `false` to `true`.

![enable feature flag](/assets/vid/Screencast_20250829_163858.webp)

Now when you highlight some text, the "Copy link to highlight" context will be available. Enjoy!
