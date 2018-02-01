import pytest
import tornado.options as opt

import cloudplayer.radio.app
import cloudplayer.iokit.event
import cloudplayer.iokit.gpio


@pytest.fixture(scope='session', autouse=True)
def options():
    opt.define('connect_timeout', type=int, default=5, group='httpclient')
    opt.define('request_timeout', type=int, default=10, group='httpclient')
    opt.define('validate_cert', type=bool, default=False, group='httpclient')
    opt.define('max_redirects', type=int, default=1, group='httpclient')
    opt.define('xheaders', type=bool, group='server')
    opt.define('static_path', type=str, group='server')
    opt.define('font_file', type=str, default='RobotoMono.ttf')
    opt.define('cookie_file', type=str, default='tok_v1.txt')
    opt.define('allowed_origins', type=list, default=['*'])
    opt.define('api_base_url', type=str, default='/')
    return opt.options


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
