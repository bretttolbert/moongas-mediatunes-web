# moongas-mediatunes-web

> 🚧 **Status: Work in Progress (WIP)**  
> This project is currently under active development. Features, APIs, and documentation are subject to change.

---

## Overview

**A Deno-tooled TypeScript/Vue SPA for Moongas hybrid media collections, pairing with the separate `mediatunes-svc` backend to seemlessly blend offline and streaming playback.**

### A component of the `moongas` ecosystem of media library tools

- [moongas-mediatunes-web](https://github.com/bretttolbert/moongas-mediatunes-web) [![CI](https://github.com/bretttolbert/moongas-py-mediaserver/actions/workflows/ci.yml/badge.svg)](https://github.com/bretttolbert/moongas-mediatunes-web/actions/workflows/ci.yml) - A Deno-tooled TypeScript/Vue SPA for Moongas hybrid media collections, pairing with the separate moongas-py-mediatunes-svc backend to seemlessly blend offline and streaming playback
- [moongas-py-mediatunes-svc](https://github.com/bretttolbert/moongas-py-mediatunes-svc) [![CI](https://github.com/bretttolbert/moongas-py-mediaserver/actions/workflows/ci.yml/badge.svg)](https://github.com/bretttolbert/moongas-py-mediatunes-svc/actions/workflows/ci.yml) - Python+BlackSheep API service for Moongas hybrid media collections—backend for moongas-mediatunes-web application
- [moongas-collection-demo](https://github.com/bretttolbert/moongas-collection-demo) [![CI](https://github.com/bretttolbert/moongas-collection-demo/actions/workflows/ci.yml/badge.svg)](https://github.com/bretttolbert/moongas-collection-demo/actions/workflows/ci.yml) - Example Moongas media collection (metadata only)
- [moongas-py-mediascan](https://github.com/bretttolbert/moongas-py-mediascan) [![CI](https://github.com/bretttolbert/moongas-py-mediascan/actions/workflows/ci.yml/badge.svg)](https://github.com/bretttolbert/moongas-py-mediascan/actions/workflows/ci.yml) - Python package for loading Moongas database and Yaml
- [moongas-go-mediascan](https://github.com/bretttolbert/moongas-go-mediascan) [![CI](https://github.com/bretttolbert/moongas-go-mediascan/actions/workflows/ci.yml/badge.svg)](https://github.com/bretttolbert/moongas-go-mediascan/actions/workflows/ci.yml) - Golang module to scan media collections and Moongas Yaml metatadata, outputs Moongas database
- [moongas-py-mediatest](https://github.com/bretttolbert/moongas-py-mediatest) [![CI](https://github.com/bretttolbert/moongas-py-mediatest/actions/workflows/ci.yml/badge.svg)](https://github.com/bretttolbert/moongas-py-mediatest/actions/workflows/ci.yml) - Python tool for enforcing media collection rules (implemented with `pytest`)


## Live Demos
- [Live Demo (hosted on bretttolbert.com)](https://bretttolbert.com/mediaserver)
- [Live Demo (hosted on moongas.org)](https://moongas.org/mediaserver)

### Filter by year range

[bretttolbert.com/mediaserver/albums?minYear=1990&maxYear=2004](https://bretttolbert.com/mediaserver/albums?minYear=1990&maxYear=2004)

### Filter by year range and genre(s)

[bretttolbert.com/mediaserver/player?minYear=1960&maxYear=2024&genre=Industrial+Metal&genre=Punk&genre=Punk+Rock&genre=Heavy+Metal&genre=Hip+Hop&genre=Urbano&genre=Thrash+Metal&genre=Nu+Metal&genre=Rock+en+español&genre=Funk+Metal&genre=Hip-Hop+français](https://bretttolbert.com/mediaserver/player?minYear=1960&maxYear=2024&genre=Industrial+Metal&genre=Punk&genre=Punk+Rock&genre=Heavy+Metal&genre=Hip+Hop&genre=Urbano&genre=Thrash+Metal&genre=Nu+Metal&genre=Rock+en+español&genre=Funk+Metal&genre=Hip-Hop+français)

### Filter by artist, album and title

[bretttolbert.com/mediaserver/player?artist=Rush&album=Grace%20Under%20Pressure&title=The%20Body%20Electric](https://bretttolbert.com/mediaserver/player?artist=Rush&album=Grace%20Under%20Pressure&title=The%20Body%20Electric)

## Screenshots

[Screenshots](./doc/screenshots/README.md)

## Vue + TypeScript frontend (Deno + Vite)

The web UI is a single-page application built with [Deno](https://deno.com/), [Vite](https://vite.dev/), [Vue 3](https://vuejs.org/) and TypeScript:

- `client/` — the Vue SPA (all TypeScript; uses npm `d3` + `d3-cloud` for the word clouds). Routes mirror the API paths (`/albums`, `/tracks`, `/artists`, `/player`, `/genres-cloud`, etc.).
- `server/main.ts` — plain `Deno.serve` production server: serves the Vite build from `client/dist` and falls back to `index.html` for client-side routes.

The SPA consumes a JSON API (`/api/config`, `/api/albums`, `/api/tracks`, `/api/artists`, `/api/artist`, `/api/genres`, `/api/artist-geo/<kind>`, `/api/wordcloud/*`, `/api/random-track`) and media files via `/getfile/*`; serve these with any compatible backend.

### Development

```sh
deno task install   # first time only
deno task dev       # http://localhost:5173
```

### Production

```sh
deno task build     # builds client/ to client/dist
deno task serve     # http://localhost:8000 (env: PORT)
```

### Type checking

```sh
deno task check     # runs vue-tsc on client/ and deno check on server/
```

### Runtimes

- **Node 24+** runs the client toolchain: `deno task install` (dependency install), `dev`, `build`, and `check` (vue-tsc) all execute under Node.
- **Deno** runs the production web server, `server/main.ts` (`deno task serve`).

## Features

- Simple minimalist web interface
- Perfect for a party jukebox hosted on your home WiFi network
- Multiple playback options (configurable):
    1. Play local media files in the browser (using HTML5 `<audio>` tag)
    2. "Play" by opening YouTube search for _"(artist) (album) (title) video"_ (configurable)
        - Great for finding music videos of your favorite music
        - Great for creating YouTube playlists of music videos meeting certain filter criteria (e.g. 80s New Wave music videos for your 80s party)
        - IMHO mediaserver + YouTube premium (no ads) is better than YouTube Music or Spotify
    3. (Default) Display both options
- Album art displayed at a beautiful `1000x1000px` resolution
    - (bandwidth optimized by converting to `.webp` at 80% quality if hosted by yours truly)
- Continuous shuffle playback with filtering options
- Fast (tested with a library of 20,000+ music files)
- Versatile filtering and sorting via a common set of intuitive url parameters
- Comprehensive browsing options—browse by _artist_, _album_, _genre_, _year_, _year range_, and more
- _Name That Tune_—plays a song without displaying the info, but offering hints, challenging the user to name the artist/tune
- Direct download of music files via hyperlinks
- Accessible from mobile devices (tested in Chrome on Android)


## Limitations

- Doesn't work with some `.m4a` files
    - Error: html5 audio element can't decode
- Requires that your music library be scanned with [moongas-go-mediascan](https://github.com/bretttolbert/moongas-go-mediascan)
    - `moongas-go-mediascan/cmd/scantodb` scans your music library and outputs a `mediascan.db` file
    - This must be repeated to update the music library (e.g. add new files)
    - Album art may be extracted (and converted to .webp) using the mediascan copy covers script
    - I cannot share my music files, of course, as they are copyrighted, but I can share my mediascan database with over 20,000+ tracks, allowing you to browse my extensive and painstakingly organized music library (with accurate tags, genre and year) and _play_ any track by opening a YouTube search for it. 
- Requires that music library be organized with the directory and file structure that Moongas expects
    - For example:
        - Artist folders containing album folders with `cover.jpg` (or `cover.webp`) files
        - Music filenames do not contain prohibited characters such as `+`
    - You can enforce these requirements by testing your music library with [moongas-py-mediatest](https://github.com/bretttolbert/moongas-py-mediatest)

## Coming soon

- Play entire albums
- Playlists
- Back button to go back to previous track(s) in player
- Sort by modified time

## Dependencies

- [moongas-go-mediascan](https://github.com/bretttolbert/moongas-go-mediascan) A simple and fast Go (golang) command-line utility to recursively scan a directory for media files, extract metadata (including ID3v2 tags from both MP3 and M4A files), and save the output in an sqlite3 database e.g. [mediascan.db](https://github.com/bretttolbert/mediascan/blob/main/out/mediascan.db)

## Installation

### Scan your music library with moongas-go-mediascan

- Modify the mediascan config (`mediascan-config.yml`) values (`mediadirs` etc.) as needed
- Run the `scantodb` command (requires [go](https://go.dev/doc/install))
```bash
cd moongas-go-mediascan
go run cmd/scantodb/main.go mediascan-config.yml ../mediascan.db
```

### Install the web app from GitHub source

- Clone the repo
```bash
git clone git@github.com:bretttolbert/moongas-py-mediaserver.git
cd moongas-py-mediaserver
```
- Install client dependencies and build the SPA
```bash
deno task install
deno task build
```
- Run the web server
```bash
deno task serve
```

### Automatically start and run as a SystemD service

A systemd unit is provided for the web frontend:

- [`mediaserver-web.service`](./mediaserver-web.service) — the Deno web frontend (serves the Vue SPA)

To set it up:

- Customize the .service file as required
- Build the frontend with `deno task build` (so `client/dist` exists)
- Update [`mediaserver-web.service`](./mediaserver-web.service): set `ExecStart` to the output of `which deno` on the host
- Copy the `.service` file into the systemd system folder to install it as a systemd service
```bash
sudo cp mediaserver-web.service /etc/systemd/system/
cd /etc/systemd/system
sudo chmod 644 mediaserver-web.service
```
- Enable the service with `systemctl enable`:
```bash
sudo systemctl enable mediaserver-web.service
```
- Start the service
```bash
systemctl start mediaserver-web.service
```
- Use `systemctl status` to verify that mediaserver-web is running
```bash
systemctl status mediaserver-web
```
- If you make changes to the unit file, use the `systemctl daemon-reload` command to force systemd to reload it
```bash
systemctl daemon-reload
systemctl restart mediaserver-web
```
- Once you have it set up to run as a service, re-scanning your library is as easy as this:
```bash
cd moongas-go-mediascan
go run cmd/scantodb/main.go mediascan-conf.yml ../mediascan.db
sudo systemctl restart mediaserver-web
journalctl -b -f -u mediaserver-web
```
- Use `-u` to specify the unit by name (`mediaserver-web`)
- Use `-f` to follow the log so you can watch the server startup
- Use `-b` to only show output since last boot (avoids showing old output)
