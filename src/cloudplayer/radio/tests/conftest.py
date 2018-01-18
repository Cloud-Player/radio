import pytest

import cloudplayer.radio.gpio


@pytest.fixture(scope='function', autouse=True)
def mock_gpio(monkeypatch):
    mock_gpio = cloudplayer.radio.gpio.MockGPIO()
    monkeypatch.setattr(cloudplayer.radio.gpio.GPIO, 'gpio', mock_gpio)
    return mock_gpio
