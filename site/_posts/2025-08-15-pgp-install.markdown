---
layout: post
title:  "Generating a PGP key in 2025"
date:   2025-08-15 14:12:37 -0700
categories: jekyll update
---

- [Summary](#summary)
- [Background information](#background-information)
- [Expected Results](#expected-results)
- [Preparation](#preparation)
- [Generate a primary key](#generate-a-primary-key)
- [Generate your subkeys](#generate-your-subkeys)
- [Generate a revocation certificate](#generate-a-revocation-certificate)
- [Export your public keyring](#export-your-public-keyring)
- [Export the private portion of your primary key](#export-the-private-portion-of-your-primary-key)
- [Prepare secret bits of primary key for printing](#prepare-secret-bits-of-primary-key-for-printing)
- [Short summary/breather](#short-summary/breather)
- [Change the passphrase on your subkeys](#change-the-passphrase-on-your-subkeys)
- [Export secret subkeys](#export-secret-subkeys)
- [(Optional) Prepare QR code for revocation certificate](#(optional)-prepare-qr-code-for-revocation-certificate)
- [(Optional) Prepare QR code for secret bits on primary key](#(optional)-prepare-qr-code-for-secret-bits-on-primary-key)
- [Print secrets](#print-secrets)
- [Conclusion](#conclusion)

## Summary

The goal here is to create a pgp key from a (mostly) air gapped environment.

## Background information

Chapters 1 through 4 of the [OpenPGP Documentation](https://openpgp.dev/book/about.html) contains enough information to work with this guide (about 15 minutes read).

GnuPG has a great [FAQ](https://www.gnupg.org/faq/gnupg-faq.html) that covers a lot of questions you might have about pgp.

This guide should be valid for gpg `v2.4.7` and paperkey `1.6`.

## Expected Results

When we are done, we will have three things:
1. A USB flash drive which contains a couple of files:
  - A public keyring which contains primary key, user id, and two subkeys, to be hosted on the internet.
  - A secret keyring which contains user id and two subkeys, but **not** the primary key.
2. A printed primary secret key.
3. A printed revocation certificate that can be used to revoke the primary key.

The first secret subkey will have *encryption* capabilities and can be used to decrypt messages that colleagues might encrypt using the first public subkey.

![Screenshot of how encryption works in pgp](/assets/img/PGP_encryption_diagram.svg)

The second secret subkey will have *signing* capabilities and can be used to generate a signature for any artifact. Consumers of the artifacts can verify the artifacts are unmodified using the second public subkey.

![Screenshot of how signatures work in pgp](/assets/img/Private_key_signing.svg)

## Preparation

We will need a few things:
1. Flash drive **A** with ~3GB of space, enough to store the fedora KDE live environment
2. Flash drive **B** with ~2GB of space, and the following binaries on the flash drive:
  - [paperkey](https://koji.fedoraproject.org/koji/packageinfo?packageID=5241) RPM
  - (Optional) [qrencode](https://koji.fedoraproject.org/koji/packageinfo?packageID=10634) RPM if printing a QR code instead of text.
  - (Optional) [zbar](https://koji.fedoraproject.org/koji/packageinfo?packageID=8926) RPM to verify that the QR code can be decoded.
3. A printer that supports the IPP (Internet Printing Protocol)

Load fedora KDE live environment onto a USB flash drive **A** according to instructions from [https://fedoraproject.org/kde/download](https://fedoraproject.org/kde/download)

![Content of flash drive A](/assets/img/2025-08-16_14-41.png)

Download the paperkey RPM from https://koji.fedoraproject.org/koji/packageinfo?packageID=5241 and put it on USB flash drive **B**. Make sure that the version of fedora is the same as your live environment: version is determined by the `fc` suffix at the end of the RPM.

![Content of dlash drive B](/assets/img/2025-08-16_14-51.png)

Restart the computer and modify the boot sequence so that flash drive **A** is first in the boot sequence.

## Generate a primary key

Open a terminal and run `gpg --full-generate-key` to interactively create a primary key. Options **RSA and RSA**, **DSA and Elgamal**, and **ECC (sign and encrypt)** will actually create both a primary key and a subkey. For now, we want to create just the primary key, so **DSA (sign only)**, **RSA (sign only)**, and **ECC (sign only)** are our options. ECC may be considered as less [quantum-resistant](https://www.netmeister.org/blog/pqc-2025-02.html) than RSA due to size of keys: quantum computing breaks traditional computing paradigms from which these algorithms were developed. GnuPG [recommends](https://www.gnupg.org/faq/gnupg-faq.html#recommended_ciphers) **RSA** over **DSA**.

```
liveuser@localhost-live:~$ gpg --full-generate-key
gpg (GnuPG) 2.4.7; Copyright (C) 2024 g10 Code GmbH
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

gpg: directory '/home/liveuser/.gnupg' created
Please select what kind of key you want:
   (1) RSA and RSA
   (2) DSA and Elgamal
   (3) DSA (sign only)
   (4) RSA (sign only)
   (9) ECC (sign and encrypt) *default*
  (10) ECC (sign only)
  (14) Existing key from card
Your selection? 4
```

Select the maximum key size if you don't mind a large key. Signing and encrypting will be done with the subkeys, so it doesn't impact anyone's speed in most cases.

```
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072) 4096
```

Don't set an expiration date for your primary key. If your primary key is ever compromised, the attacker can still change the expiration date of your primary key, **even if it's already expired**. Revocation is still the best mechanism of making a key invalid. See [Does OpenPGP key expiration add to security?](https://security.stackexchange.com/questions/14718/does-openpgp-key-expiration-add-to-security) for a more in-depth discussion.

```
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0)
```

Confirm that key will not expire.

```
Key does not expire at all
Is this correct? (y/N) y
```

Enter a real name and email address. Enter a comment if you wish.

```
GnuPG needs to construct a user ID to identify your key.

Real name: Ward
Email address: ward@huangw.dev
Comment: https://huangw.dev
You selected this USER-ID:
    "Ward (https://huangw.dev) <ward@huangw.dev>"

Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit?  O
```

Next you should be prompted to enter a passphrase. If an attacker gains hold of your private key, there are only two options available to you:
1. Revoke your public key
2. Have a strong enough passphrase to prevent them from using your key

Keep in mind that the passphrase will be the same across both your primary key and subkeys, but you might not want to let convenience stop you from generating a strong passphrase! We will address how to change the passphrase for **only** subkeys later.

After you've entered a passphrase, verify that the pgp key is present on the machine using the `gpg --list-public-keys` command.

You can refer to the below to decode the response:
- `pub` repesents public portion of your primary key.
- `uid` is a user id associated with the key. You can have more than one user id listed in your keyring.
- `sec` represents private portion of your primary key.
- `[SC]` means that this key supports signing & certification.

```
$ gpg --list-public-keys
[keyboxd]
---------
pub   rsa4096 2025-08-12 [SC]
      0BC7BC277BDA7F1149E42F6650AE2C9FD834BD5F
uid           [ultimate] Ward (https://huangw.dev) <ward@huangw.dev>
```

```
$ gpg --list-secret-keys
gpg: checking the trustdb
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: depth: 0  valid:   1  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 1u
[keyboxd]
---------
sec   rsa4096 2025-08-12 [SC]
      0BC7BC277BDA7F1149E42F6650AE2C9FD834BD5F
uid           [ultimate] Ward (https://huangw.dev) <ward@huangw.dev>
```

## Generate your subkeys

We'll generate two subkeys next. One for encryption, and another for signing.

![Fig. 7 OpenPGP certificates can contain multiple subkeys.](/assets/img/Binding_Subkeys.svg)

The `gpg --edit-key <uid>` command will open an interactive prompt. If you didn't try creating multiple keys, you should have only 1 keyring available to you right now, and it will be selected by default.

```
$ gpg --edit-key 'Ward (https://huangw.dev) <ward@huangw.dev>'
gpg (GnuPG) 2.4.7; Copyright (C) 2024 g10 Code GmbH
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Secret key is available.

sec  rsa4096/50AE2C9FD834BD5F
     created: 2025-08-12  expires: never       usage: SC
     trust: ultimate      validity: ultimate
[ultimate] (1). Ward (https://huangw.dev) <ward@huangw.dev>

gpg> 
```

In the interactive prompt, enter the `addkey` command and select one of the **(sign only)** options to create a key with signing capabilities.

```
gpg> addkey
Please select what kind of key you want:
   (3) DSA (sign only)
   (4) RSA (sign only)
   (5) Elgamal (encrypt only)
   (6) RSA (encrypt only)
  (10) ECC (sign only)
  (12) ECC (encrypt only)
  (14) Existing key from card
Your selection? 10
```

**Curve 25519** has a key bit size of 256. **NIST P-384** has a key bit size of 384, but some older computers might not support it.

```
Please select which elliptic curve you want:
   (1) Curve 25519 *default*
   (4) NIST P-384
   (6) Brainpool P-256
Your selection? 4
```

Set an expiration date of 1 or 2 years. It's generally a good habit to regularly rotate keys. If for example, a newer key is compromised, you can be sure that all messages prior to the creation of the new key may stay encrypted (or vice versa). GPG in particular is configured to always use the most recent key for encryption, even if multiple encryption keys are available.

```
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 1y
Key expires at Wed 12 Aug 2026 02:45:15 AM UTC
```

Confirm yes.

```
Is this correct? (y/N) y
Really create? (y/N) y
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.

sec  rsa4096/50AE2C9FD834BD5F
     created: 2025-08-12  expires: never       usage: SC
     trust: ultimate      validity: ultimate
ssb  ed25519/944ACBA688A9A117
     created: 2025-08-12  expires: 2026-08-12  usage: S
[ultimate] (1). Ward (https://huangw.dev) <ward@huangw.dev>
```

Type the `addkey` command again. Select one of the **(encrypt only)** options to create an **encryption** subkey.

```
gpg> addkey
Please select what kind of key you want:
   (3) DSA (sign only)
   (4) RSA (sign only)
   (5) Elgamal (encrypt only)
   (6) RSA (encrypt only)
  (10) ECC (sign only)
  (12) ECC (encrypt only)
  (14) Existing key from card
Your selection? 12
```

Select one of the elliptic curves for the algorithm.

```
Please select which elliptic curve you want:
   (1) Curve 25519 *default*
   (4) NIST P-384
   (6) Brainpool P-256
Your selection? 4
```

Expire the key in 1 or 2 years.

```
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0) 1y
Key expires at Wed 12 Aug 2026 02:56:26 AM UTC
```

Confirm your choices

```
Is this correct? (y/N) y
Really create? (y/N) y
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.

sec  rsa4096/50AE2C9FD834BD5F
     created: 2025-08-12  expires: never       usage: SC
     trust: ultimate      validity: ultimate
ssb  ed25519/944ACBA688A9A117
     created: 2025-08-12  expires: 2026-08-12  usage: S
ssb  cv25519/CDF21C7A234165F9
     created: 2025-08-12  expires: 2026-08-12  usage: E
[ultimate] (1). Ward (https://huangw.dev) <ward@huangw.dev>

gpg>
```

`CTRL+D` to send the EOF signal to the prompt. Don't forget to save your changes!!

```
Save changes? (y/N) y
```

## Generate a revocation certificate

If you ever lose access to your primary key, or your primary key is compromised, you can use a revocation certificate to revoke your primary key. The revocation certificate will take effect only when it is appended to your public keyring.

Use the **uid** provided in the previous section to identify your key, and create a revocation certification for it.

```
$ gpg --generate-revocation 'Ward (https://huangw.dev) <ward@huangw.dev>'

sec  rsa4096/50AE2C9FD834BD5F 2025-08-12 Ward (https://huangw.dev) <ward@huangw.dev>

Create a revocation certificate for this key? (y/N) y
Please select the reason for the revocation:
  0 = No reason specified
  1 = Key has been compromised
  2 = Key is superseded
  3 = Key is no longer used
  Q = Cancel
(Probably you want to select 1 here)
Your decision? 1
Enter an optional description; end it with an empty line:
>
Reason for revocation: Key has been compromised
(No description given)
Is this okay? (y/N) y
ASCII armored output forced.
-----BEGIN PGP PUBLIC KEY BLOCK-----
<<<REDACTED>>>
-----END PGP PUBLIC KEY BLOCK-----
Revocation certificate created.

Please move it to a medium which you can hide away; if Mallory gets
access to this certificate he can use it to make your key unusable.
It is smart to print this certificate and store it away, just in case
your media become unreadable.  But have some caution:  The print system of
your machine might store the data and make it available to others!

```

Copy the terminal output starting from `-----BEGIN PGP PUBLIC KEY BLOCK-----` and ending after `-----END PGP PUBLIC KEY BLOCK-----` to your clipboard. Paste the content of the clipboard into a file of your choosing: e.g. `revocation-certificate-to-be-printed.txt`.

## Export your public keyring

Use the same **uid** from previous steps to export your public keyring: This contains the public portion of your primary key and subkeys. `--output` determines where the keyring should be saved. The order of arguments passed to gpg **does** affect the results.

```
$ gpg --output ~/my-public-key.gpg --export 'Ward (https://huangw.dev) <ward@huangw.dev>'
```

Copy `~/my-public-key.gpg` to flash drive **B**.

## Export the private portion of your primary key

First, run the `gpg --list-secret-keys --with-subkey-fingerprint` to list all secret subkey fingerprints.

We are going to export the primary key only by passing the fingerprint of the primary key to a subsequent gpg command.

This table explains the meanings of various acronyms from the output of the gpg command:
- `pub` repesents public portion of your primary key.
- `uid` is your user id. You can have more than one user id listed in your keyring.
- `sec` represents private portion of your primary key.
- `sub` and `ssb` are not listed here yet, but they represent public portion of subkey, and private portion of subkey, respectively.
- `[SC]` means that this key supports signing & certification.
- `[E]` means that this key can be used to encrypt.


```
$ gpg --list-secret-keys --with-subkey-fingerprint
[keyboxd]
---------
sec   rsa4096 2025-08-12 [SC]
      0BC7BC277BDA7F1149E42F6650AE2C9FD834BD5F
uid           [ultimate] Ward (https://huangw.dev) <ward@huangw.dev>
ssb   ed25519 2025-08-12 [S] [expires: 2026-08-12]
      D2A3E19F94A85AE19F8A22F4944ACBA688A9A117
ssb   cv25519 2025-08-12 [E] [expires: 2026-08-12]
      C00B8798C7EA29684ADB3F41CDF21C7A234165F9
```

To export the secret keyring we can pass the `--export-secret-keys` option to gpg. Normally, the `--export-secret-keys` option will export all secret keys across all keyrings. When a specific fingerprint of a key is passed to gpg, then only the keyring containing that fingerprint will be exported. The scope of the export can be further limited by adding an exclamation mark **!** to the end of a fingerprint. Any subset of the keyring can be exported in this way, by passing multiple fingerprints, each followed by an exclamation mark. 

The `gpg --output my-secret-key.gpg --export-secret-keys 0BC7BC277BDA7F1149E42F6650AE2C9FD834BD5F!` command will export a primary key with fingerprint of `0BC7BC277BDA7F1149E42F6650AE2C9FD834BD5F` to a file named `my-secret-key.gpg`.

```
$ gpg --output my-secret-key.gpg --export-secret-keys 0BC7BC277BDA7F1149E42F6650AE2C9FD834BD5F!
```

## Prepare secret bits of primary key for printing

Next, we'll record the secret portions of your primay key in ascii format.

```
$ paperkey --secret-key my-secret-key.gpg > secret-bits-to-be-printed.txt
```

## Short summary/breather

To summarize what we've done so far:
1. We now have a public keyring containing your UID, a Signing/Certification primary key with no expiration date, a signing subkey with an expiration date, and an encryption subkey with an expiration date.
2. We have a file which contains an ascii-armored revocation certification
3. We have a file containing the secret bits of our primary key.

We have one more thing left to do which is to export our secret subkeys. Before we do that, we're going to remove the primary key for our secrets keyring, and change the passphrase of our primary key. You might have noticed that we were required to enter our passphrase for several of the operations above. The subkeys are using the same passphrase as our primary key, but we wouldn't like a compromised passphrase on our subkeys to compromise our primary key as well. There is a way to change the passphrase on our subkeys without affecting the content of our primary key.

## Change the passphrase on your subkeys

First, list all fingerprints in your secret keyring

```
$ gpg --with-subkey-fingerprint --list-secret-keys 'Ward (https://huangw.dev) <ward@huangw.dev>'
sec   rsa4096 2025-08-12 [SC]
      0BC7BC277BDA7F1149E42F6650AE2C9FD834BD5F
uid           [ultimate] Ward (https://huangw.dev) <ward@huangw.dev>
ssb   ed25519 2025-08-12 [S] [expires: 2026-08-12]
      D2A3E19F94A85AE19F8A22F4944ACBA688A9A117
ssb   cv25519 2025-08-12 [E] [expires: 2026-08-12]
      C00B8798C7EA29684ADB3F41CDF21C7A234165F9
```

Next, delete **only** the primary key

```
$ gpg --delete-secret-keys 0BC7BC277BDA7F1149E42F6650AE2C9FD834BD5F!
gpg (GnuPG) 2.4.7; Copyright (C) 2024 g10 Code GmbH
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.


sec  rsa4096/50AE2C9FD834BD5F 2025-08-12 Ward (https://huangw.dev) <ward@huangw.dev>

Note: Only the secret part of the shown primary key will be deleted.

Delete this key from the keyring? (y/N) y
This is a secret key! - really delete? (y/N) y
```

If you run the `--list-secret-keys` command again, you'll notice there is now a `#` sign after `sec`, indicating that the primary key is no longer part of this keyring.

Reset your passphrase by passing the `--passwd` option to gpg along with your **UID**.

The `error changing passphrase: No secret key` message can be safely ignored. **Gpg** is just telling us that the passphrase of the primary key can't be changed since it is not present in the keyring.

```
$ gpg --passwd 'Ward (https://huangw.dev) <ward@huangw.dev>'
gpg (GnuPG) 2.4.7; Copyright (C) 2024 g10 Code GmbH
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

gpg: key 50AE2C9FD834BD5F/50AE2C9FD834BD5F: error changing passphrase: No secret key
```

## Export secret subkeys

Finally, we can export the subkeys that we'll be using on our main machines.

```
$ gpg --output my-secret-subkeys.gpg --export-secret-subkeys 'Ward (https://huangw.dev) <ward@huangw.dev>'
```

Copy `my-secret-subkeys.gpg` to Flash drive **B**

## (Optional) Prepare QR code for revocation certificate

If you want to print the revocation certificate as a QR code, you can use `qrencode`.

```
cat revocation-certificate-to-be-printed.txt | qrencode -o revocation-certificate.eps -t EPS.
```

## (Optional) Prepare QR code for secret bits on primary key

Same for the secret bits on the primary key.

```
$ paperkey --secret-key my-secret-key.gpg --output-type raw | base64 | qrencode -o secret-bits-on-primary-key.eps -t EPS
```

## Print secrets

This is the only part of the process that might require network connectivity. You'll have to think of some way to print the two QR codes we've created in previous steps.

Make sure that the print information is not saved in your printer.

If you are printing a QR code, make sure that scaling is set to none!!! We don't want to stretch the QR code

```
$ lpoptions -l
$ lpoptions -o print-scaling=none
```

Print secret (maybe print a backup)

```
$ lpr secret-bits-on-primary-key.eps
```

Print revocation certificate


```
$ lpr revocation-certificate.eps
```

## Conclusion

We're done! Our pgp key is ready to use. Flashdrive **B** contains our public keyring and secret subkeys.

![Flashdrive B contains two files](/assets/img/2025-08-16_15-44.png)

And we have printed the secret bits of our primary key, and printed a revocation certificate.

![cat.png](/assets/img/secret.png)

There is still a lot we can do:
1. Set up a [WKD](https://wiki.gnupg.org/WKD): domain + DNS + web hosting + HTML/CSS/JS
2. Configure email sending for our domain
3. Configure email receiving for our domain
4. Restore a primary key from our paper copy (with QR code or without)
5. Revoke a primary key
6. Sign an artifact
7. Decrypt a message


