---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---
{% assign wh_pgp_keys = site.static_files | where: "name", site.huangw.pgp_key %}
Hi, congratulations on finding yet another personal website. Here is a [photo of a pup](/assets/img/PXL_20240322_234023975.jpg) in exchange for your time. A little about me, I have a [LinkedIn](https://www.linkedin.com/in/huangw91), and a [blog](/blog/) which I try to keep [up to date](https://xkcd.com/2723/).

I have inherited some strong opinions, such as: keeping the [homes (codebases) that we live in clean](https://en.wikipedia.org/wiki/A_Pattern_Language#Structure:~:text=At%20the%20core%20%5B%E2%80%A6%5D%20is%20the%20idea%20people%20should%20design%20their%20homes%2C%20streets%2C%20and%20communities.%20This%20idea%20%5B%E2%80%A6%5D%20comes%20from%20the%20observation%20most%20of%20the%20wonderful%20places%20of%20the%20world%20were%20not%20made%20by%20architects%2C%20but%20by%20the%20people.) that we live in or why [5 9s availability](https://en.wikipedia.org/wiki/Five_nines), simply put, is not. You'll find that these opinions are just as easily let go. I am **not** someone who finds discussing the definitions of uptime, availability, or reliability as pedantic: there is value in sharing a vocabulary. And I greatly admire the way that AWS is designed to preserve my API calls [for over 5 minutes](https://aws.amazon.com/messaging/sla/?did=sla_card&trk=sla_card#:~:text=Definitions-,%E2%80%9C,available) when the service undergoes pressure (please take this comment at face-value).

Professionally, you might consider me to be a Site Reliability Engineer, Production Engineer, or [DevOps](https://www.sethvargo.com/the-ten-myths-of-devops/) Engineer, even if we're still deciding on [the name](https://martinfowler.com/bliki/TwoHardThings.html). In the office, for the small majority of the time, you will see me ~~staring at a computer screen~~ [planning my next engineering activity](/assets/img/2025-08-29_16-14.png). At home, you might find me tinkering with do-it-yourself electronics, configuring home networking devices, and discovering the ideal number of bananas per loaf of bread (it's three).

I have a public [PGP key]({{ wh_pgp_keys | map: "path" | first }}?l={{ site.huangw.pgp_key_uid | split: "@" | first }}) to go along with my [email address](mailto:ward@huangw.dev), but I am still waiting to receive my first encrypted message. Sometimes, you can see me cloud gazing in the south bay area, wondering what things will be like down the road.

Anyways, feel free to send me a email for any reason; I don't bite!

---
<br>
<!-- site.posts is sotred in reverse chronological order -->
{%- assign date_format = site.minima.date_format | default: "%Y-%m-%d" -%}
All [blog](/blog/) entries:
{% for post in site.posts -%}
- <a href="{{ post.url | relative_url }}">{{ post.title | escape }}</a> ({{ post.date | date: date_format }})
{% endfor %}
All [apps](/apps/):
{% for app in site.apps -%}
- <a href="{{ app.url | relative_url }}">{{ app.title | escape }}</a> - {{ app.description }}
{% endfor %}

Other stuff:
- SJSU capstone project: [Cloud gaming with in-game video conferencing](github.com/Huang-W/zoom-gaming)
