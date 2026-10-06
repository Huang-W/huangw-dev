---
layout: page
title: Web Apps
permalink: /apps/
---
*{{ site.description }}*

---

[<ins>[homepage](/)</ins>][<ins>[ward@huangw.dev](mailto:ward@huangw.dev)</ins>]

---

{% if site.apps.size > 0 %}
<ul>
  {% for app in site.apps %}
  <li>
    <a href="{{ app.url | relative_url }}">{{ app.title }}</a> - {{ app.description }}
  </li>
  {% endfor %}
</ul>
{% else %}
<p>No apps found.</p>
{% endif %}
