"""
    cloudplayer.radio.mock_io
    ~~~~~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2017 by the cloudplayer team
    :license: Apache-2.0, see LICENSE for details
"""
import mock

try:
    from RPi import GPIO as rpi_gpio
except ImportError:
    rpi_gpio = None


class MockGPIO(mock.MagicMock):

    HIGH = 1
    LOW = 0

    OUT = 0
    IN = 1

    RISING = 1
    FALLING = 2
    BOTH = 3

    PUD_OFF = 0
    PUD_DOWN = 1
    PUD_UP = 2

    UNKNOWN = -1
    BOARD = 10
    BCM = 11
    SERIAL = 40
    SPI = 41
    I2C = 42
    PWM = 43


class Proxy(object):

    def __init__(self):
        self.gpio = None

    def __repr__(self):
        return '<Proxy for %s>' % repr(self.gpio)

    def __getattr__(self, attr):
        return getattr(self.gpio, attr)


GPIO = Proxy()
if rpi_gpio is None:
    GPIO.gpio = MockGPIO()
else:
    GPIO.gpio = rpi_gpio
