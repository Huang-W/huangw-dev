---
layout: default
permalink: /apps/
---
{% include blog_body_header.html %}

### Web Apps

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
