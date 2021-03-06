[![Build Status](https://travis-ci.org/Cloud-Player/radio.svg?branch=master)](https://travis-ci.org/Cloud-Player/radio)
[![JS Angular](https://img.shields.io/badge/js-angular-blue.svg)](https://angularjs.org)
[![PY Tornado](https://img.shields.io/badge/py-tornado-blue.svg)](http://www.tornadoweb.org)

# cloud-player radio

by Nicolas Drebenstedt and Alexander Zarges

## abstract

These days, music streaming is ubiquitous and consumers can access millions of songs and artists.
But having so many choices, often leaves us undecided what to listen to. Recommendation engines try to solve this problem but tend to push people into a filter bubble.
Looking back a century, broadcast radio has always provided a variety of music to listen to, curated by humans – not AI.
We want to combine the unlimited choices of streaming music services with the charm of hand-picked music stations. With cloud-radio everyone can be radio host and broadcast to the world.
Cloud-radio will be built on top of cloud-player, a multi-provider streaming app, and allow users to create public radio stations, which others can discover and listen to in realtime.
To preserve the analogue flair of radio receivers, we want to build a portable listening device with a super simple haptic UI: A volume control and a rotary tuner to switch stations.

[![Imgur](https://i.imgur.com/RFn24iJ.png)](https://drive.google.com/file/d/1w66yOvXvzBVmPQ2biMzG5pyp0Z4u0b_X/view "Play video")

## project

There is a short presentation on the project in this repository called `presentation.pdf`.

The codebase is comprised of several parts:
- src/cloudplayer/iokit contains generic io components and the event loop
- src/cloudplayer/radio extends these components to implement the radio engine
- src/web/app contains the headless angular-based player application

The radio also relies on these two other repositories:
- https://github.com/Cloud-Player/api which contains the cloud-player API code
- https://github.com/Cloud-Player/web with the full-fledged cloud-player web app

## hardware

To build a portable cloud-player radio we used the following hardware. However,
with some modification, most components could easily be switched out.

- raspberry https://www.conrad.de/de/raspberry-pi-3-model-b-1-gb-ohne-betriebssystem-1419716.html
- amplifier https://www.hifiberry.com/shop/boards/miniamp/
- rotary encoder https://www.amazon.de/KY-040-Drehwinkelgeber-Modul-Arduino-Rotary-Encoder/dp/B013UTHNYI
- developer kit https://www.amazon.de/Elegoo-Electronic-Breadboard-Kondensator-Potentiometer/dp/B01J79YG8G
- speaker https://www.intertechnik.de/shop/lautsprecher/sb-acoustics/sb-wideband/sb65wbac25-4_1768,de,7974,150441
- display https://www.exp-tech.de/displays/oled/5159/adafruit-1-5-oled-breakout-board-16-bit-farbe/microsd-kartenhalter

## wire up

Wire up the Raspberry with the components according to the fritzing schematic.

<img width=300 src="https://raw.githubusercontent.com/Cloud-Player/radio/master/schematic.jpg">

## setup

- download raspbian lite to your computer
```
curl -L https://downloads.raspberrypi.org/raspbian_lite_latest | tar -xf - -C ~/
```

- flash raspbian onto sd card (if using a Mac, check out `etcher`)
- place an empty file called `ssh` on the raspbian boot partion
```
cd /Volumes/boot
touch ssh
```

- create a file named `wpa_supplicant.conf` and insert your wifi credentials
```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
network={
    ssid="YOUR_NETWORK_NAME"
    psk="YOUR_PASSWORD"
    key_mgmt=WPA-PSK
}
```

- plug sd card into raspberry and connect power and ethernet
- find out ip adress of raspberry, e.g. by using your router's gui
- ssh into your pi using that ip, the user `pi` and the password `raspberry`
```
ssh pi@RASPBERRY_IP
```

- now configure your pi
```
sudo raspi-config
```

- change your user password to something other that the default
- set your locale to `en_US.UTF-8` (hint: use spacebar to de/select)
- under `Interfacing Options` enable the SPI kernel module

- update your raspbian software
```
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install \
chromium-browser \
git \
libjpeg9 \
libjpeg9-dev \
supervisor \
python-alsaaudio \
python3-pillow \
python3-pip \
python3-dev \
python3-venv
```

- add your user to the spi and gpio groups
- for reference see https://luma-oled.readthedocs.io/en/latest/hardware.html#tips-for-connecting-the-display
```
sudo usermod -a -G spi,gpio pi
```

## configure miniamp

- the miniamp sound driver needs to be enabled manually
- open `/boot/config.txt` to remove the line
```
dtparam=audio=on
```

- and add the line
```
dtoverlay=hifiberry-dac
```

- for reference see https://www.hifiberry.com/build/documentation/configuring-linux-3-18-x

## configure alsa

- the linux sound engine alsa can route and manipulate audio streams
- copy the `asound.conf` from this repository to `/etc/asound.conf`
- for reference see https://support.hifiberry.com/hc/en-us/articles/205377202-Adding-software-volume-control

## cloudplayer engine

The cloudplayer engine runs an event loop to handle the raspberry io interface
and communicate physical user input to the headless player and the display.

### install
```
python3 -m venv --upgrade --copies .
bin/pip install -e .
```

### develop
```
bin/radio
```

## headless player

The cloudplayer headless player runs inside a chromium browser and handles
media playback. It is hosted on a remote server to allow OTA updates.

### install
```
cd src/web
npm install
```

### develop
```
npm start
```

## configure supervisor

- the supervisor manages application starts on reboot
- copy the `supervisor.conf` to `/etc/supervisor/conf.d/cloudplayer.conf`
- and adjust the installation directories

## done

- reboot your raspberry and - after authentication - it should start playing music
