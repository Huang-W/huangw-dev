---
layout: page
title: FunnIP
permalink: /apps/funnip/
description: "A tool that shows all possible notations of an IPv4 address (decimal, hex, octal)."
---
*{{ site.description }}*

---

[<ins>[homepage](/)</ins>][<ins>[ward@huangw.dev](mailto:ward@huangw.dev)</ins>]

---

Enter any valid IPv4 address notation (e.g., `127.0.0.1`, `0x7f000001`, `2130706433`) to see all its possible forms.

<div style="margin-bottom: 20px; margin-top: 20px;">
    <label for="ip-input" style="display: block; font-weight: bold; margin-bottom: 5px;">IP Address</label>
    <input type="text" id="ip-input" placeholder="127.0.0.1" value="127.0.0.1" autocomplete="off" spellcheck="false" style="width: 100%; max-width: 400px; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
</div>

<div style="margin-bottom: 10px;">
    <label>
        <input type="checkbox" id="leading-zeros">
        Include unnecessary leading zeros
    </label>
</div>

<div style="margin-bottom: 20px;">
    <label>
        <input type="checkbox" id="show-links">
        Format as hyperlinks
    </label>
    <div style="font-size: 0.85em; color: #666; margin-top: 4px;">
        <em>Note: Link previews might show the standard IPv4 notation instead of the generated notation.</em>
    </div>
</div>

<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
    <h3 style="margin: 0;">Generated Notations (<span id="count-badge">0</span>)</h3>
    <button id="copy-btn" style="padding: 5px 10px; cursor: pointer; border: 1px solid #ccc; background: #f8f8f8; border-radius: 4px;">Copy All</button>
</div>

<div id="error-message" style="display: none; color: #d00; margin-bottom: 10px; padding: 10px; background: #fee; border: 1px solid #fcc; border-radius: 4px;">
    Invalid IP address format. Please enter a valid notation.
</div>

<pre id="results-output" style="min-height: 200px; padding: 15px;"></pre>

<script src="{{ '/assets/js/funnip.js' | relative_url }}"></script>

---

<br>
<small>Credit to the original author: <a href="https://lucb1e.com/randomprojects/php/funnip.php" target="_blank">lucb1e</a></small>
