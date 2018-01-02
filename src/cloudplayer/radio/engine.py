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
import tornado.httpclient
import tornado.ioloop
import tornado.options as opt
import tornado.web

from cloudplayer.radio.gpio import GPIO
from cloudplayer.radio import component
from cloudplayer.radio import handler


def define_options():
    """Defines global configuration options"""
    opt.define('config', type=str, default='config.py')
    opt.define('port', type=int, default=8050)
    opt.parse_command_line()
    opt.define('connect_timeout', type=int, default=1, group='httpclient')
    opt.define('request_timeout', type=int, default=3, group='httpclient')
    opt.define('max_redirects', type=int, default=1, group='httpclient')
    opt.define('debug', type=bool, group='server')
    opt.define('xheaders', type=bool, group='server')
    opt.define('static_path', type=str, group='server')
    opt.define('allowed_origins', type=str, default='*')
    opt.define('switch_debounce', type=int, default=10)
    opt.define('ticks_per_second', type=int, default=60)
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


def make_app():
    """Configure routes and application options"""
    return tornado.web.Application([
        (r'^/.*', handler.FallbackHandler),
    ], **opt.options.group_dict('server'))


def teardown(*_):
    """Teardown raspberry gpio and tornado ioloop"""
    app_log.info('engine shutting down')
    ioloop = tornado.ioloop.IOLoop.current()
    ioloop.stop()
    GPIO.teardown()
    sys.exit(0)


def compose():
    """Compose hardware and virtual components"""
    frequency = component.RotaryEncoder(5, 6)
    volume = component.Potentiometer(17, 27)
    serial = luma.core.interface.serial.spi(device=0, port=0)
    display = component.Display(luma.oled.device.ssd1351, serial)


def main():
    """Main application entry point"""
    GPIO.setup()
    define_options()
    configure_httpclient()
    app = make_app()
    app.listen(opt.options.port)
    app_log.info('listening at localhost:%s', opt.options.port)
    ioloop = tornado.ioloop.IOLoop.current()

    signal.signal(signal.SIGTERM, teardown)

    try:
        ioloop.start()
    except KeyboardInterrupt:
        teardown()


if __name__ == '__main__':
    main()
