[![Build Status](https://travis-ci.org/Cloud-Player/radio.svg?branch=master)](https://travis-ci.org/Cloud-Player/radio)
[![Code Coverage](https://codecov.io/gh/Cloud-Player/radio/branch/master/graph/badge.svg)](https://codecov.io/gh/Cloud-Player/radio)

# cloud-player radio

## setup
- download raspbian lite
```
curl -L https://downloads.raspberrypi.org/raspbian_lite_latest | tar -xf - -C ~/Desktop/
```
- install etcher
```
brew cask install etcher
open /Applications/Etcher.app
```
- flash raspbian onto sd card using etcher
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

https://www.hifiberry.com/build/documentation/configuring-linux-3-18-x

## configure alsa

https://support.hifiberry.com/hc/en-us/articles/205377202-Adding-software-volume-control

## radio engine

### install
```
python3 -m venv --upgrade --copies .
bin/pip install -e .
```

### develop
```
bin/api
```

### test
```
bin/pip install -e .[test]
bin/test
```
