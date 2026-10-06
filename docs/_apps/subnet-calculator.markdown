---
layout: default
permalink: /apps/subnet-calculator/
description: "A visual IPv4 subnet calculator to divide and join subnets dynamically."
title: Subnet Calculator
---
<style>
  .breakout {
    width: max-content;
    max-width: 95vw;
    position: relative;
    left: 50%;
    transform: translateX(-50%);
  }
</style>

{% include blog_body_header.html %}

# Visual Subnet Calculator

A tool to help you divide and join IPv4 subnets dynamically. 

<div style="margin: 20px 0; padding: 20px; background: rgba(0,0,0,0.03); border-radius: 8px;">
    <div style="display: flex; gap: 15px; align-items: flex-end; flex-wrap: wrap;">
        <div>
            <label for="network-input" style="display: block; font-weight: bold; margin-bottom: 5px;">Network Address</label>
            <input type="text" id="network-input" value="10.0.0.0" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; width: 150px;">
        </div>
        <div>
            <label for="mask-input" style="display: block; font-weight: bold; margin-bottom: 5px;">Mask (/)</label>
            <input type="number" id="mask-input" value="16" min="0" max="32" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px; width: 80px;">
        </div>
        <div>
            <button id="update-btn" style="padding: 9px 15px; cursor: pointer; border: 1px solid #ccc; background: #f8f8f8; border-radius: 4px;">Update</button>
        </div>
    </div>
    <div id="subnet-error" style="color: #d00; margin-top: 10px; display: none;">Invalid network or mask.</div>
    <div id="subnet-warning" style="color: #666; font-style: italic; margin-top: 10px; display: none;"></div>
</div>

<div class="breakout" style="overflow-x: auto; margin-bottom: 30px;">
    <table id="subnet-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9em;">
        <thead>
            <tr style="border-bottom: 2px solid #ccc;">
                <th style="padding: 10px;">Subnet</th>
                <th style="padding: 10px;">Netmask</th>
                <th style="padding: 10px;">Range</th>
                <th style="padding: 10px;">Useable</th>
                <th style="padding: 10px;">Hosts</th>
                <th style="padding: 10px;">Actions</th>
            </tr>
        </thead>
        <tbody id="subnet-tbody">
            <!-- Rows injected here by JavaScript -->
        </tbody>
    </table>
</div>

<script src="{{ '/assets/js/subnet-calculator.js' | relative_url }}"></script>

---

<br>
<small>Credit to the original author: <a href="https://www.davidc.net/sites/default/subnets/subnets.html" target="_blank">davidc.net</a></small>
