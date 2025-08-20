---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---
Hi, congratulations on finding yet another personal website. Please consider accepting this [photo of a pup](/assets/img/PXL_20240322_234023975.jpg) in exchange for your time. A little about me, I don't have a Facebook, but I do have a [LinkedIn](https://www.linkedin.com/in/huangw91), and a [blog](/blog/) which I try to keep [up to date](https://xkcd.com/2723/).

Professionally, you might consider me to be a Site Reliability Engineer, Production Engineer, or [DevOps Engineer](https://www.sethvargo.com/the-ten-myths-of-devops/), even if we're still deciding on [the name](https://martinfowler.com/bliki/TwoHardThings.html). At home, you'll find me tinkering with do-it-yourself electronics, configuring various home networking devices, and discovering the ideal number of bananas per loaf of bread (it's three).

I haven't tried to obfuscate my [email address](mailto:ward@huangw.dev) (yet), do have a public [PGP key](https://huangw.dev/.well-known/openpgpkey/huangw.dev/hu/69mxofunysijdray184nfoddjzhkxuiw), and ride a surprisingly old bike through the bay area foothills, frequently wondering what things will be like down the road.

---
<br>
{% assign post = site.posts.first %}
{%- assign date_format = site.minima.date_format | default: "%Y-%m-%d" -%}
Latest [blog](/blog/) entry:
- <a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a> ({{ post.date | date: date_format }})

Other stuff:
- SJSU capstone project: [Cloud gaming with in-game video conferencing](github.com/Huang-W/zoom-gaming)