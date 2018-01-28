"""
    cloudplayer.radio.component
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2018 by the cloudplayer team
    :license: Apache-2.0, see LICENSE for details
"""
import functools
import random

from PIL import Image
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

    def __init__(self, *args, **kw):
        super().__init__(*args, **kw)
        self.mute = False

    def toggle_mute(self, event):
        if event.value:
            self.publish(Potentiometer.VALUE_CHANGED, self.mute * self.value)
            self.mute = not self.mute


class Display(BaseDisplay):

    def show_volume(self, event):
        self.text('volume\n{}%'.format(int(event.value * 100)))

    def show_token(self, event):
        self.text('token\n{}'.format(event.value['id']))

    def pixelate(self, event):
        width = int(self.device.width / 16)
        height = int(self.device.height / 16)
        image = self.buffer.copy()
        for _ in range(5):
            sx, tx = random.sample(range(self.device.width - 16), 2)
            sy, ty = random.sample(range(self.device.height - 16), 2)
            color = self.buffer.getpixel((sx, sy))
            image.paste(color, (tx, ty, tx + 16, ty + 16))
        self.draw(image)

    def now_playing(self, event):
        http_client = tornado.httpclient.HTTPClient()
        response = http_client.fetch(event.value['image']['small'])
        image = Image.open(response.buffer)
        self.draw(image)


class Server(BaseServer):

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


class Player(Component):

    AUTH_START = 'AUTH_START'
    AUTH_DONE = 'AUTH_DONE'
    CTRL_NEXT = 'CTRL_NEXT'
    QUEUE_ITEM = 'QUEUE_ITEM'

    def __init__(self):
        super().__init__()
        self.http_client = tornado.httpclient.AsyncHTTPClient()
        self.cookie = None
        self.token = None
        self.login_callback = None
        self.token_callback = None
        try:
            with open('tok_v1.cookie', 'r') as fh:
                self.cookie = fh.read()
            assert self.cookie
        except (AssertionError, IOError):
            self.start_login()
        else:
            self.say_hello()

    def on_message(self, event):
        ioloop = tornado.ioloop.IOLoop.current()
        if event.value['channel'] == 'queue_item':
            ioloop.add_callback(
                functools.partial(self.queue_item, event.value['body']))

    @tornado.gen.coroutine
    def queue_item(self, item):
        response = yield self.fetch('/track/{}/{}'.format(
            item['track_provider_id'], item['track_id']))
        track = tornado.escape.json_decode(response.body)
        self.publish(self.QUEUE_ITEM, track)

    def tune(self, event):
        if event.value == 100:
            self.skip(event)

    def skip(self, event):
        ioloop = tornado.ioloop.IOLoop.current()
        ioloop.add_callback(self.switch_station)

    @tornado.gen.coroutine
    def switch_station(self):
        response = yield self.fetch('/playlist/cloudplayer/40rrim0y7vn725ts')
        playlist = tornado.escape.json_decode(response.body)
        self.publish(self.CTRL_NEXT, playlist['items'])

    @tornado.gen.coroutine
    def fetch(self, url, **kw):
        url = '{}/{}'.format(opt.options['api_base_url'], url.lstrip('/'))
        headers = kw.pop('headers', {})
        if self.cookie:
            headers['Cookie'] = self.cookie

        response = yield self.http_client.fetch(
            url, headers=headers, validate_cert=False, **kw)

        cookie_headers = response.headers.get_list('Set-Cookie')
        new_cookies = ';'.join(c.split(';', 1)[0] for c in cookie_headers)
        if new_cookies:
            self.cookie = new_cookies
            with open('tok_v1.cookie', 'w') as fh:
                fh.write(self.cookie)
        return response

    def start_login(self):
        self.login_callback = tornado.ioloop.PeriodicCallback(
            self.create_token, 1 * 60 * 1000)
        self.login_callback.start()
        ioloop = tornado.ioloop.IOLoop.current()
        ioloop.add_callback(self.create_token)

    @tornado.gen.coroutine
    def create_token(self):
        if self.token_callback:
            self.token_callback.stop()

        response = yield self.fetch('/token', method='POST', body='')

        self.token = tornado.escape.json_decode(response.body)
        self.token_callback = tornado.ioloop.PeriodicCallback(
            self.check_token, 1 * 1000)
        self.token_callback.start()
        self.publish(self.AUTH_START, self.token)
        app_log.info('create %s' % self.token)

    @tornado.gen.coroutine
    def check_token(self):
        response = yield self.fetch('/token/{}'.format(self.token['id']))
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
        self.publish(self.AUTH_DONE, 'hello\n{}'.format(title))
