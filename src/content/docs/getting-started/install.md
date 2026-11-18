---
title: Install
description: The four ways to run Risuai (web, desktop app, Docker, building from source) and how to back up your data.
verifiedVersion: "2026.10.295"
---

You can use Risuai straight from the web with nothing to install, or run it as a desktop app or on a server of your own. The features are almost the same either way. The biggest difference is **where your data is stored**.

| Option | Good for | Where your data lives |
| --- | --- | --- |
| [Web](#use-it-on-the-web) | Trying it out | Browser storage |
| [Desktop app](#desktop-app) | Regular use on one computer | Your computer |
| [Docker](#self-host-with-docker) | Running it on a server or NAS and connecting from several devices | A Docker volume on the server |
| [Build from source](#build-from-source) | Changing the code, or when Docker is not an option | The server |

Whichever you pick, make sure to set up [backups](#back-up-your-data).

## Use it on the web

Open [risuai.net](https://risuai.net) and start right away. The official Risuai README recommends this option first.

:::caution[Clearing browser data can take your data with it]
The web version stores its data inside the browser. If you clear the site's data or cache, use a private window, or switch to another browser, your characters and chats may disappear. Download a [local backup](#back-up-your-data) regularly.
:::

## Desktop app

Download the installer for the latest version from the [GitHub releases page](https://github.com/kwaroran/Risuai/releases). Releases are built for:

- **Windows** (x64): an installer
- **macOS**: separate builds for Apple Silicon (M1 and later) and Intel
- **Linux** (x64): `.deb`, `.rpm`, `.AppImage`

The desktop app stores data on your computer, so clearing browser data does not affect it.

## Self-host with Docker

Use this when you want Risuai running on a server, NAS, or home server and want to reach it from your phone or another PC. You need Docker and Docker Compose installed.

```sh
curl -L https://raw.githubusercontent.com/kwaroran/Risuai/refs/heads/main/docker-compose.yml | docker compose -f - up -d
```

Once it is running, open `http://localhost:6001` in a browser (or `http://<server-address>:6001` from another device).

- The image is `ghcr.io/kwaroran/risuai:latest`, published for both `amd64` and `arm64`.
- Data is stored in a Docker volume named `risuai-save` (`/app/save` inside the container), so it survives deleting and recreating the container.
- To update, pull the new image with `docker pull ghcr.io/kwaroran/risuai:latest` and run the command above again.

:::caution[Exposing it to the internet]
Rather than opening port 6001 to the internet directly, put it behind a reverse proxy with HTTPS (Nginx, Caddy, Cloudflare Tunnel, and so on). If you need the real client IP behind the reverse proxy, set the `TRUST_PROXY` environment variable. Only turn it on behind a proxy you trust.
:::

## Build from source

This runs the server with Node.js instead of Docker. You need Node.js 22.13 or later and Git.

```sh
git clone https://github.com/kwaroran/Risuai.git
cd Risuai
sh server.sh
```

`server.sh` installs pnpm, installs the dependencies, builds the web frontend, and starts the Node server. The default port is 6001; change it with the `PORT` environment variable.

Good to know:

- If you build without setting `VITE_RISU_LEGAL_CONFIGURED`, a legal notice warning screen appears when you connect. According to the comments in `server.sh`, only set it to `TRUE` for a **personal server used only by you**, a development or testing fork made to contribute upstream, or a fork with proper terms of service and a privacy policy.
- The Node server documentation in the Risuai repository notes that this server may be replaced by a [Hono](https://hono.dev/)-based server in the future.

## Back up your data

In Risuai, open **Settings → Account & Files** to find the backup menu.

- **Save Backup Locally**: downloads a backup file with all your characters, chats, settings, and assets.
- **Save Partial Backup Locally (Excluding Character Assets)**: makes a lighter backup that leaves out character assets.
- **Load Backup Locally**: restores your data from a backup file.

Use the same backup file to move to another device or another setup. For example, save a backup from the web version and load it in the desktop app to carry everything over.
