"""
    cloudplayer.radio.gpio
    ~~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2017 by the cloudplayer team
    :license: Apache-2.0, see LICENSE for details
"""
try:
    import RPi.GPIO as rpi_gpio
except ImportError:
    import mock

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

    rpi_gpio = MockGPIO()


class GPIOManager(object):

    def __init__(self):
        self.gpio = None

    def setup(self):
        self.gpio.setmode(GPIO.BCM)
        self.gpio.setwarnings(False)

    def __getattr__(self, attr):
        return getattr(self.gpio, attr)

    def teardown(self):
        self.gpio.cleanup()


GPIO = GPIOManager()
GPIO.gpio = rpi_gpio
