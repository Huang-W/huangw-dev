---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---
{% assign wh_pgp_keys = site.static_files | where: "name", site.huangw.pgp_key %}
Hi, congratulations on finding yet another personal website. Here is a [photo of a pup](/assets/img/PXL_20240322_234023975.jpg) in exchange for your time. A little about me, I have a [LinkedIn](https://www.linkedin.com/in/huangw91), and a [blog](/blog/) which I try to keep [up to date](https://xkcd.com/2723/).

I hold strong opinions about topics such as [promql ~~in~~compatibility](https://medium.com/@romanhavronenko/victoriametrics-promql-compliance-d4318203f51e) or why [5 9s availability](https://en.wikipedia.org/wiki/Five_nines), simply put, is not (although, you will find my opinions are just as easily let go). I am **not** someone who finds discussing the definitions of uptime, availability, or reliability as pedantic, as I believe that sharing a common vocabulary is invaluable. And I greatly admire the way that AWS is designed to preserve my API calls [for over 5 minutes](https://aws.amazon.com/messaging/sla/?did=sla_card&trk=sla_card#:~:text=Definitions-,%E2%80%9C,available) when the service undergoes pressure.

Professionally, you might consider me to be a Site Reliability Engineer, Production Engineer, or [DevOps Engineer](https://www.sethvargo.com/the-ten-myths-of-devops/), even if we're still deciding on [the name](https://martinfowler.com/bliki/TwoHardThings.html). In the office, for the small majority of the time, you will see me simply ~~staring at the screen~~ [planning my next engineering activity](/assets/img/2025-08-29_16-14.png). At home, you'll find me tinkering with do-it-yourself electronics, configuring various home networking devices, and discovering the ideal number of bananas per loaf of bread (it's three).

I have a public [PGP key]({{ wh_pgp_keys | map: "path" | first }}?l={{ site.huangw.pgp_key_uid | split: "@" | first }}) to go along with my [email address](mailto:ward@huangw.dev), even though I've yet to receive an encrypted message. Sometimes, you can see me riding my bike in the south bay area, wondering what things will be like down the road.

Anyways, feel free to send me a email for any reason!

---
<br>
<!-- site.posts is sotred in reverse chronological order -->
{% assign post = site.posts.first %}
{%- assign date_format = site.minima.date_format | default: "%Y-%m-%d" -%}
Latest [blog](/blog/) entry:
- <a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a> ({{ post.date | date: date_format }})

Other stuff:
- SJSU capstone project: [Cloud gaming with in-game video conferencing](github.com/Huang-W/zoom-gaming)
