"""
    cloudplayer.radio.app
    ~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2018 by the cloudplayer team
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

from cloudplayer.iokit import Input, Potentiometer, RotaryEncoder
from cloudplayer.iokit import GPIO, EventManager
from cloudplayer.radio.component import Display, Server, Player, Volume


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
    opt.define('allowed_origins', type=list, default=['*'])
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
        display = Display(device)

    server = Server()
    player = Player()

    server.subscribe(server.SOCKET_OPENED, player.on_open)
    server.subscribe(server.SOCKET_MESSAGE, player.on_message)
    player.subscribe(player.AUTH_START, display.show_token)
    player.subscribe(player.CTRL_NEXT, server.update_queue)
    player.subscribe(player.QUEUE_ITEM, display.current_track)

    mute = Input(13)
    volume = Volume(5, 6, initial=0.2)
    mute.subscribe(mute.VALUE_CHANGED, volume.toggle_mute)
    volume.subscribe(volume.VALUE_CHANGED, display.show_volume)
    volume.subscribe(volume.VALUE_CHANGED, server.update_volume)

    frequency = Potentiometer(27, 17, steps=10.0)
    frequency.subscribe(frequency.VALUE_CHANGED, display.filter_image)
    frequency.subscribe(frequency.VALUE_CHANGED, player.frequency_changed)
    frequency.subscribe(frequency.VALUE_CHANGED, server.update_noise)

    skip = Input(26)


def teardown(*_):
    """Teardown raspberry gpio and tornado ioloop"""
    app_log.info('radio shutting down')
    ioloop = tornado.ioloop.IOLoop.current()
    ioloop.stop()
    GPIO.teardown()
    sys.exit(0)


def main():
    """Main application entry point"""
    define_options()
    configure_httpclient()
    em = EventManager()
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
