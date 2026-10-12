---
layout: post
title:  "Type Chinese with Pinyin on Fedora 44"
date:   2026-10-12 16:00:00 -0700
categories: fedora linux pinyin fcitx5 fcitx kde plasma qt gtk
description: "How to configure Pinyin input method for KDE Plasma on Fedora 44."
mermaid: true
---

Getting pinyin input to work on Linux was a bit more involved (for me) than on MacOS or Windows. Between competing input method frameworks (IBus vs. Fcitx), disparate GUI toolkits (Qt vs. GTK), and the shift from X11 to Wayland compositors, it was easy to run into issues like missing chinese character popups, uncooperative shortcuts, or input methods failing in specific applications.

So here is a step-by-step walkthrough to get Fcitx 5 set up and configured properly with Pinyin (partly so I don't forget how in the future).

---

## 1. Remove Fcitx Flatpaks (if installed)

I didn't try to get fcitx to work [with flatpack](https://fcitx-im.org/wiki/Install_Fcitx_5), but you can give it a shot if needed. Instead, I removed any fcitx packages installed using flatpack.

Check if you have any Fcitx Flatpaks installed:

```bash
flatpak list | grep -i fcitx
```

If you see any entries (such as `org.fcitx.Fcitx5`), uninstall them:

```bash
flatpak uninstall 'org.fcitx.Fcitx5'
```

---

## 2. Install Required Fcitx 5 Packages

Install the core Fcitx 5 stack and integration packages using `dnf`:

```bash
sudo dnf install fcitx5 fcitx5-autostart fcitx5-chinese-addons fcitx5-configtool fcitx5-gtk fcitx5-qt
```

### What each package does:

* **`fcitx5`**: The core input method framework engine and server daemon.
* **`fcitx5-autostart`**: Provides XDG autostart desktop entries and system integration so that the Fcitx 5 daemon automatically launches whenever you log into your desktop session.
* **`fcitx5-chinese-addons`**: Supplies Chinese language input engines and dictionaries.
* (Optional) **`fcitx5-configtool`**: The graphical configuration manager (GUI). It lets you adjust hotkeys, toggle candidate themes, modify dictionary preferences, and add or remove input methods.
* **`fcitx5-gtk`**: The GTK input method modules (IM module plugins for GTK 2, GTK 3, and GTK 4). This ensures that native GTK applications (such as Firefox, Chrome, GNOME utilities, and Electron-based apps like VS Code) can communicate with Fcitx 5 and render inline candidate popups at the cursor position.
* **`fcitx5-qt`**: The Qt platform input context plugin (Qt 5 and Qt 6). This is essential for KDE Plasma's native apps (such as Kate, Dolphin, and Konsole) to interface with Fcitx 5.

---

## 3. Configure Environment Variables for Wayland

Wayland sessions require applications to know which input method module to connect to. The modern, recommended standard on systemd-based Linux distributions is to use `environment.d`, which exports variables across systemd user services and graphical sessions.

Create the configuration directory and file:

```bash
mkdir -p ~/.config/environment.d
cat <<EOF > ~/.config/environment.d/fcitx5.conf
XMODIFIERS=@im=fcitx
GTK_IM_MODULE=fcitx
QT_IM_MODULE=fcitx
EOF
```

---

## 4. Set Fcitx 5 as Virtual Keyboard in KDE Plasma

In KDE Plasma 6 under Wayland, KWin controls the Wayland input method protocol (`zwp_input_method_v1` / `v2`). To ensure KWin recognizes Fcitx 5 as the compositor's active input method, configure it using `kwriteconfig6`:

```bash
kwriteconfig6 --file kwinrc --group Wayland --key InputMethod org.fcitx.Fcitx5.desktop
```

This writes the setting directly to your `~/.config/kwinrc` under the `[Wayland]` section, setting `InputMethod=org.fcitx.Fcitx5.desktop`.

---

## 5. Configure the Fcitx 5 Profile

Rather than clicking through the GUI settings using `fcitx5-configtool`, you can configure your default input method group and layout directly via the profile file. We will configure standard US English as the primary layout and Pinyin as the secondary input method, and you can switch between the two (default shortcut is `Ctrl + Space` to switch inputs, another default shortcut is `Shift` inside Pinyin mode to switch between Latin and Chinese characters).

```bash
mkdir -p ~/.config/fcitx5/
cat <<EOF > ~/.config/fcitx5/profile
[Groups/0]
# Group Name
Name=Default
# Layout
Default Layout=us
# Default Input Method
DefaultIM=pinyin

[Groups/0/Items/0]
# Name
Name=keyboard-us
# Layout
# Layout=

[Groups/0/Items/1]
# Name
Name=pinyin
# Layout
# Layout=

[GroupOrder]
0=Default
EOF
```

---

## 6. Start Fcitx 5

You can now start the Fcitx 5 daemon in background/daemon mode:

```bash
fcitx5 -d
```

---

## 7. Restart Your Computer

Reboot your system (or log out and back in) to make sure the keyboard switching persists through reboots:

```bash
systemctl reboot
```

---

## Quick Usage Tips

* **Switching Input Methods**: By default, you can toggle between the US keyboard and Pinyin using `Ctrl + Space` (or tapping `Shift` when inside Pinyin mode to switch between Latin and Chinese characters).
* **Configuration GUI**: You can launch the graphical configuration tool at any time via:
  ```bash
  fcitx5-configtool
  ```
* **Diagnostics**: If you ever experience issues in a specific application, run:
  ```bash
  fcitx5-diagnose
  ```
  It prints a full audit of your environment variables, running daemons, and toolkit plugins to pinpoint any missing configuration.
