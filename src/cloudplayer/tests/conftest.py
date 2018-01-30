import pytest

import cloudplayer.iokit.gpio
import cloudplayer.iokit.event


@pytest.fixture(scope='function', autouse=True)
def mock_gpio(monkeypatch):
    mock_gpio = cloudplayer.iokit.gpio.MockGPIO()
    monkeypatch.setattr(cloudplayer.iokit.gpio.GPIO, 'gpio', mock_gpio)
    return mock_gpio


@pytest.fixture(scope='function', autouse=True)
def event_manager():
    em = cloudplayer.iokit.event.EventManager
    yield em
    em.queue._queue.clear()
    em.subscriptions.clear()
