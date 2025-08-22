---
layout: post
title:  "Removing metadata from images"
date:   2025-08-20 13:00:00 -0700
categories: exiftool geotag image metadata privacy security
description: "Why to care about metadata in images, and how to remove them."
---

![Timestamp](/assets/img/2025-08-20_20-34.png)

So, you have probably done this at one point or another: snap a picture on your cell phone and share that picture with the world at large. Now, you are probably aware that images contain metadata, including location and time. For various reasons, we might not want to share the location where a picture was taken, or time that it was taken. Maybe we were supposed to be at work that day or maybe we don't want people to know our home address, but most probably we didn't everyone to know that we were secretly at a [Carly Rae Jepson](https://www.youtube.com/watch?v=78hnLziDayQ) concert (don't judge me).

The point is, once a picture is out there, it's hard to take back! Even the metadata.

It's not all black and white. Metadata is not inherently bad. Photographers for instance, use [EXIF](https://en.wikipedia.org/wiki/Exif) metadata to determine the camera settings -- and even lenses -- that were used to capture a photo. The IPTC (International Press Telecommunications Council) even evaluates social media and photo sharing platforms based on whether EXIF metadata is **[preserved](https://iptc.org/standards/photo-metadata/social-media-sites-photo-metadata-test-results-2019/)**. Even the layperon benefits from metadata preservation when using services like [Google timeline](https://policies.google.com/technologies/location-data), when trying to remember when a cousin's graduation was, or if identifying where a vacation photo was taken.

Yes, it's true that metadata can be used in unintended ways. For example, there was a scenario where the location of some black market products were potentially identified by [two harvard students](https://www.theregister.com/2016/09/19/dark_web_drug_sellers_shutter_locationtracking_exif_data_from_photos/). Though my take away from the Harvard experiment is not that **229** black market images contained (possibily) legitimate location data; it's that the other **223 thousand** contained **no** location data.

And in the same way that black market dealers protect the location of their product, social media platforms can protect their users by stripping such data from uploaded images. But just in case, we'll go through one of the ways to identify and strip metadata ourselves.

We'll need a few things to get started:
1. [exiftool](https://exiftool.org/) will be our tool of choice today. According to the documentation, it's a free and platform-indepent Perl library, as well as a command-line application.
2. A cell phone with location data and GPS enabled for the camera.
3. Some way to transfer pictures from cellphone to computer (you can use email if you don't mind).

What I did prior to writing this post, was to take a picture with my Pixel 8 Pro, share the picture via the gmail app on my phone, saving a draft of an email which contained the photo I just took as an attachment. Then, I downloaded the picture from gmail on my computer's browser to `/home/huangw/Downloads/PXL_20240322_234023975.jpg`. Not the most secure, or efficient way to transfer a photo, but it does help to illustrate another point (more on that in a moment).

From the `exiftool` command, we can see that there's 148 lines of metadata. I'm going to omit most of the metadata from the code snippet, but it's safe to say that gmail does not strip metadata from email attachments. Additionally, it seems like Pixel -- by default settings -- does **not** remove metadata when sharing an image through an email app. I haven't tested whether this is also the case for photos shared via text messages, or other messaging applications. I'll leave that for you to discover...

```bash
> export PICTURE_FILENAME=/home/huangw/Downloads/PXL_20240322_234023975.jpg
> exiftool $PICTURE_FILENAME | wc -l
148
```

Let's look at a subset of the metadata. We can see that the act of downloading an image to our computer from gmail can be enough to add system-specific information to the image.

```
> exiftool "-FileName" "-Directory" "-FilePermissions" "-FileModifyDate" "-FileAccessDate" "-FileInodeChangeDate" "-GPSAltitude" "-GPSLatitude" "-GPSLongitude" $PICTURE_FILENAME
File Name                       : PXL_20240322_234023975.jpg
Directory                       : /home/huangw/Downloads
File Permissions                : -rw-r--r--
File Modification Date/Time     : 2025:08:18 21:53:59-07:00
File Access Date/Time           : 2025:08:20 13:44:13-07:00
File Inode Change Date/Time     : 2025:08:19 10:48:32-07:00
GPS Altitude                    : 52.4 m Above Sea Level
GPS Latitude                    : 64 deg 46' 27" S
GPS Longitude                   : 64 deg 3' 10" W
```

Let's find out where these GPS coordinates point to using google maps

```
> exiftool "-GPSLatitude" "-GPSLongitude" $PICTURE_FILENAME
GPS Latitude                    : 64 deg 46' 27" S
GPS Longitude                   : 64 deg 3' 10" W
```

Create eight new environment variables: `LAT_DEG`, `LAT_FEET`, `LAT_INCH`, `LAT_POL`, `LON_DEG`, `LON_FEET`, `LON_INCH`, `LON_DIR`, and clean them up so that each contains an integer or floating point.

```bash
read LAT_DEG IGNORE_1 LAT_FEET LAT_INCH LAT_POL < <( exiftool "-GPSLatitude" $PICTURE_FILENAME | sed -e 's/.*: //' )
read LON_DEG IGNORE_2 LON_FEET LON_INCH LON_DIR < <(exiftool "-GPSLongitude" $PICTURE_FILENAME  | sed -e 's/.*: //')
LAT_FEET=${LAT_FEET%\'}
LON_FEET=${LON_FEET%\'}
LAT_INCH=${LAT_INCH%\"}
LON_INCH=${LON_INCH%\"}
```

We can put the coordinates into [geohack](https://geohack.toolforge.org/) and it should return us the location of where the picture was taken.

```
export PARAMS="${LAT_DEG}_${LAT_FEET}_${LAT_INCH}_${LAT_POL}_${LON_DEG}_${LON_FEET}_${LON_INCH}_${LON_DIR}"
echo "https://geohack.toolforge.org/geohack.php?params=${PARAMS}"
```

You should get a URL [like this](https://geohack.toolforge.org/geohack.php?params=64_46_27_S_64_3_10_W).

![Palmer station!](/assets/img/2025-08-20_18-02.png)

Okay, so probably this picture wasn't really taken in Antartica, which just goes to show, that anyone can modify the metadata in an image.

We can remove geolocation data from an image using the `-gps:all=` flag.

```bash
> exiftool '-gps:all=' $PICTURE_FILENAME
> exiftool $PICTURE_FILENAME | wc -l
135
```

We can remove **all** metadata from an image using the `-all=` flag. This includes metadata used to support HDR images, which might not be desireable in [the near future](https://www.androidauthority.com/android-16-hdr-screenshots-3528355/).

```bash
> exiftool "-all=" $PICTURE_FILENAME
Warning: ICC_Profile deleted. Image colors may be affected - /home/whuang/Downloads/PXL_20240322_234023975.jpg
    1 image files updated
> exiftool $PICTURE_FILENAME | wc -l
19
```

`exiftool` supports removing individual tags (pieces of metadata) as well. Some tags can't be removed, but we can overwrite them.

```bash
> exiftool "-Directory=" ~/Downloads/PXL_20240322_234023975.jpg
Warning: Can't delete File:Directory
Nothing to do.
> exiftool "-Directory=-" ~/Downloads/PXL_20240322_234023975.jpg
```

If we need to list all tags available, we can check manpages for exiftool.

```bash
man Image::ExifTool::TagNames
```

That's all, folks! I hope this post has helped for that next time when you host a self-captured image on your website, share a photo on social media, or upload an image to a file sharing service!
