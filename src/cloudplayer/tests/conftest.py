import pytest

import cloudplayer.iokit.gpio


@pytest.fixture(scope='function', autouse=True)
def mock_gpio(monkeypatch):
    mock_gpio = cloudplayer.iokit.gpio.MockGPIO()
    monkeypatch.setattr(cloudplayer.iokit.gpio.GPIO, 'gpio', mock_gpio)
    return mock_gpio
