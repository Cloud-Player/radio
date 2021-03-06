"""
    cloudplayer.radio.component
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2018 by the cloudplayer team
    :license: Apache-2.0, see LICENSE for details
"""
import functools
import math
import random

from PIL import Image, ImageFilter
from tornado.log import app_log
import tornado.escape
import tornado.gen
import tornado.httpclient
import tornado.ioloop
import tornado.options as opt

from cloudplayer.iokit import Display as BaseDisplay
from cloudplayer.iokit import Server as BaseServer
from cloudplayer.iokit import Component, Potentiometer


class Volume(Potentiometer):
    """Volume poti that can toggle its mute state and echo its value"""

    def __init__(self, *args, **kw):
        super().__init__(*args, **kw)
        self.mute = False

    def toggle_mute(self, event):
        if event.value:
            self.publish(Volume.VALUE_CHANGED, self.mute * self.value)
            self.mute = not self.mute

    def echo_volume(self, event):
        self.publish(Volume.VALUE_CHANGED, self.value)


class Frequency(Potentiometer):
    """Frequency poti that emulates a frequency band, snaps into stations
    and locks into an ether state, which can only be escaped when the
    player has finished loading the next track.
    """

    ENTER_ETHER = 'ENTER_ETHER'
    EXIT_ETHER = 'EXIT_ETHER'

    _STATE_TUNING = 'STATE_TUNING'
    _STATE_PENDING = '_STATE_PENDING'
    _STATE_ETHER = '_STATE_ETHER'

    def __init__(self, *args, **kw):
        super().__init__(*args, **kw)
        self.state = self._STATE_TUNING
        self.burn = None

    def update_value(self, value):
        freq = math.pow(math.sin(value * math.pi), 2)
        if self.state == self._STATE_TUNING:
            if freq < 0.05 and self.burn is not None:
                self.burn = None
                app_log.info('snap')
            elif freq > 0.95:
                if self.burn is None or abs(value - self.burn) > 0.05:
                    self.state = self._STATE_PENDING
                    freq = 1.0
                    self.burn = value
                    app_log.info('pending + burn %s' % value)
            self.value = value
            self.publish(Frequency.VALUE_CHANGED, freq)
        elif self.state == self._STATE_PENDING:
            if random.random() > 0.75:
                app_log.info('ether says yes')
                self.publish(Frequency.ENTER_ETHER, value)
            else:
                app_log.info('ether says no')
        elif self.state == self._STATE_ETHER:
            self.state = self._STATE_TUNING
            app_log.info('back to tuning')

    def exit_ether(self, event):
        if self.state == self._STATE_PENDING:
            self.state = self._STATE_ETHER
            app_log.info('exit ether')


class Display(BaseDisplay):
    """Custom display class that represents the different visual screens
    of the cloud-player radio. Token, volume, and cover art - for now.
    """

    def __init__(self, device):
        super().__init__(device)
        self.filter = ImageFilter.ModeFilter(0)

    def show_volume(self, event):
        self.text('volume\n{}%'.format(int(event.value * 100)), 1000)

    def show_token(self, event):
        self.text('token\n{}'.format(event.value['id']))

    def filter_image(self, event):
        self.filter = ImageFilter.ModeFilter(int(event.value * 10.0))
        self.draw(self.key_frame)

    def current_track(self, event):
        http_client = tornado.httpclient.HTTPClient()
        image = event.value.get('image')
        if not image:
            image = event.value['account'].get('image')
            if not image:
                return
        response = http_client.fetch(image['medium'])
        self.draw(Image.open(response.buffer), key_frame=True)


class Server(BaseServer):
    """Websocket server that connects hardware events to the player
    via a custom JSON protocol.
    """

    def write(self, **kw):
        for channel, body in kw.items():
            message = {'channel': channel, 'body': body, 'method': 'PUT'}
            super().write(message)

    def update_volume(self, event):
        self.write(volume=int(event.value * 100))

    def update_noise(self, event):
        self.write(noise=int(event.value * 100))

    def update_queue(self, event):
        self.write(queue=event.value)

    def skip_track(self, event):
        if event.value:
            self.write(playerState='next')


class Player(Component):
    """Player state handler that completes the token authorization flow and
    talks to the cloud-player API backend on behalf of the user.
    """

    AUTH_START = 'AUTH_START'
    AUTH_DONE = 'AUTH_DONE'
    QUEUE_CHANGED = 'QUEUE_CHANGED'
    QUEUE_ITEM = 'QUEUE_ITEM'

    def __init__(self):
        super().__init__()
        self.http_client = tornado.httpclient.AsyncHTTPClient()
        self.cookie = None
        self.token = None
        self.track = None
        self.login_callback = None
        self.token_callback = None
        try:
            with open(opt.options['cookie_file'], 'r') as fh:
                self.cookie = fh.read()
            assert self.cookie
        except (AssertionError, IOError):
            self.start_login()
        else:
            self.say_hello()

    @property
    def is_logged_in(self):
        if self.login_callback:
            if self.login_callback.is_running():
                return False
        if self.token_callback:
            if self.token_callback.is_running():
                return False
        if not self.cookie:
            return False
        return True

    def on_open(self, event):
        if not self.track:
            self.add_callback(self.switch_station)

    def on_message(self, event):
        if event.value['channel'] == 'queue_item':
            func = functools.partial(self.resolve_item, event.value['body'])
            self.add_callback(func)

    def frequency_changed(self, event):
        self.track = None
        self.add_callback(self.switch_station)

    @tornado.gen.coroutine
    def resolve_item(self, item):
        response = yield self.fetch('/track/{}/{}'.format(
            item['track_provider_id'], item['track_id']))
        self.track = tornado.escape.json_decode(response.body)
        self.publish(self.QUEUE_ITEM, self.track)

    @tornado.gen.coroutine
    def switch_station(self):
        if self.is_logged_in:
            response = yield self.fetch('/playlist/cloudplayer/random')
            playlist = tornado.escape.json_decode(response.body)
            self.publish(self.QUEUE_CHANGED, playlist['items'])
        else:
            app_log.info('not logged in yet')

    @tornado.gen.coroutine
    def fetch(self, url, capture_cookies=True, **kw):
        url = '{}/{}'.format(opt.options['api_base_url'], url.lstrip('/'))
        headers = kw.pop('headers', {})
        if self.cookie:
            headers['Cookie'] = self.cookie

        response = yield self.http_client.fetch(url, headers=headers, **kw)

        cookie_headers = response.headers.get_list('Set-Cookie')
        new_cookies = ';'.join(c.split(';', 1)[0] for c in cookie_headers)
        if new_cookies and capture_cookies:
            self.cookie = new_cookies
            with open(opt.options['cookie_file'], 'w') as fh:
                fh.write(self.cookie)
        return response

    def start_login(self):
        self.login_callback = tornado.ioloop.PeriodicCallback(
            self.create_token, 1 * 60 * 1000)
        self.login_callback.start()
        self.add_callback(self.create_token)

    @tornado.gen.coroutine
    def create_token(self):
        response = yield self.fetch('/token', False, method='POST', body='')
        self.token = tornado.escape.json_decode(response.body)
        if self.token_callback:
            self.token_callback.stop()
        self.token_callback = tornado.ioloop.PeriodicCallback(
            self.check_token, 1 * 1000)
        self.token_callback.start()
        self.publish(self.AUTH_START, self.token)
        app_log.info('create %s' % self.token)

    @tornado.gen.coroutine
    def check_token(self):
        uri = '/token/{}'.format(self.token['id'])
        response = yield self.fetch(uri, False)
        self.token = tornado.escape.json_decode(response.body)
        if self.token['claimed']:
            self.token_callback.stop()
            self.login_callback.stop()
            yield self.say_hello()
        else:
            app_log.info('check %s' % self.token)

    @tornado.gen.coroutine
    def say_hello(self):
        response = yield self.fetch('/user/me')
        user = tornado.escape.json_decode(response.body)
        title = 'you'
        for account in user['accounts']:
            if account['provider_id'] == 'cloudplayer':
                if account['title']:
                    title = account['title']
        app_log.info('hello {}'.format(title))
        self.add_callback(self.switch_station)
        self.publish(self.AUTH_DONE, 'hello\n{}'.format(title))
