"""
    cloudplayer.radio.engine
    ~~~~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2017 by the cloudplayer team
    :license: Apache-2.0, see LICENSE for details
"""
import signal
import sys

from tornado.log import app_log
import luma.core.interface.serial
import luma.oled.device
import luma.core.device
import tornado.httpclient
import tornado.ioloop
import tornado.options as opt
import tornado.web

from cloudplayer.radio.gpio import GPIO
from cloudplayer.radio import component
from cloudplayer.radio import event


def define_options():
    """Defines global configuration options"""
    opt.define('config', type=str, default='dev.py')
    opt.define('port', type=int, default=8050)
    opt.parse_command_line()
    opt.define('connect_timeout', type=int, default=1, group='httpclient')
    opt.define('request_timeout', type=int, default=3, group='httpclient')
    opt.define('max_redirects', type=int, default=1, group='httpclient')
    opt.define('debug', type=bool, group='server')
    opt.define('xheaders', type=bool, group='server')
    opt.define('static_path', type=str, group='server')
    opt.define('allowed_origin', type=str, default='*')
    opt.define('api_base_url', type=str, default='/')
    opt.parse_config_file(opt.options.config)


def configure_httpclient():
    """Try to configure an async httpclient"""
    defaults = opt.options.group_dict('httpclient')
    try:
        tornado.httpclient.AsyncHTTPClient.configure(
            'tornado.curl_httpclient.CurlAsyncHTTPClient', defaults=defaults)
    except ImportError:
        app_log.warn('could not setup curl client, using simple http instead')
        tornado.httpclient.AsyncHTTPClient.configure(None, defaults=defaults)


def compose():
    """Compose hardware and virtual components"""
    try:
        interface = luma.core.interface.serial.spi(device=0, port=0)
        device = luma.oled.device.ssd1351(interface)
    except:
        device = luma.core.device.dummy()
    finally:
        display = component.Display(device)

    volume = component.Potentiometer(17, 27)
    display.subscribe(volume.VALUE_CHANGED, volume)
    server = component.SocketServer()
    player = component.CloudPlayer()
    display.subscribe(player.AUTH_START, player)


def teardown(*_):
    """Teardown raspberry gpio and tornado ioloop"""
    app_log.info('engine shutting down')
    ioloop = tornado.ioloop.IOLoop.current()
    ioloop.stop()
    GPIO.teardown()
    sys.exit(0)


def main():
    """Main application entry point"""
    define_options()
    configure_httpclient()
    em = event.EventManager()
    compose()

    ioloop = tornado.ioloop.IOLoop.current()

    signal.signal(signal.SIGTERM, teardown)

    try:
        em.start()
        ioloop.start()
    except KeyboardInterrupt:
        teardown()


if __name__ == '__main__':
    main()
