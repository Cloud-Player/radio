# cloud-player radio

## setup
- download raspbian lite `https://www.raspberrypi.org/downloads/raspbian`
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
- create a file named `wpa_supplicant.conf.` and insert your wifi credentials
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
