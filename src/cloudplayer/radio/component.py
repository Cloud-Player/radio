"""
    cloudplayer.radio.component
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2017 by the cloudplayer team
    :license: Apache-2.0, see LICENSE for details
"""
import functools
import uuid

from PIL import ImageFont
from tornado.log import app_log
import luma.core.render
import tornado.escape
import tornado.gen
import tornado.httpclient
import tornado.ioloop
import tornado.options as opt

from cloudplayer.radio.gpio import GPIO
from cloudplayer.radio.socket import WebSocketHandler
from cloudplayer.radio.event import Event, EventManager


class Component(object):

    def __init__(self, *args, **kw):
        self.uuid = uuid.uuid4().hex
        super().__init__(*args, **kw)

    def __call__(self, event):
        raise NotImplementedError()

    def publish(self, action, value=None):
        event = Event(action=action, source=self, value=value)
        EventManager.publish(event)

    def subscribe(self, action, target):
        EventManager.add_subscription(action, target, self)

    def unsubscribe(self, action, target):
        EventManager.remove_subscription(action, target, self)


class Channel(Component):

    def __init__(self, channel, in_out, **kw):
        super().__init__()
        GPIO.setup(channel, in_out, **kw)
        self.channel = channel

    def __del__(self):
        GPIO.cleanup(self.channel)

    def get(self):
        return GPIO.input(self.channel)


class Input(Channel):

    RISING = 'RISING'
    FALLING = 'FALLING'

    def __init__(self, channel):
        super().__init__(channel, GPIO.IN, pull_up_down=GPIO.PUD_UP)
        GPIO.add_event_detect(
            channel,
            GPIO.RISING,
            callback=functools.partial(self.publish, self, Input.RISING))
        GPIO.add_event_detect(
            channel,
            GPIO.FALLING,
            callback=functools.partial(self.publish, self, Input.FALLING))

    def __del__(self):
        GPIO.remove_event_detect(self.channel)
        super(Input, self).__del__()


class Output(Channel):

    def __init__(self, channel):
        self.__init__(channel, GPIO.OUT, initial=GPIO.LOW)

    def put(self, state):
        GPIO.output(self.channel, state)

    def toggle(self):
        self.put(not self.get())


class Display(Component):

    light_font = ImageFont.truetype(
        'src/cloudplayer/radio/font/RobotoMono-Light.ttf', 20, 0, 'unic')
    regular_font = ImageFont.truetype(
        'src/cloudplayer/radio/font/RobotoMono-Regular.ttf', 20, 0, 'unic')
    bold_font = ImageFont.truetype(
        'src/cloudplayer/radio/font/RobotoMono-Bold.ttf', 20, 0, 'unic')

    def __init__(self, device):
        super().__init__()
        self.device = device

    def preprocess(self, image):
        draft = image.draft(self.device.mode, self.device.size)
        # TODO: Ensure correct cropping and PNG support (draft dont do it)
        return draft

    def text(self, text):
        with luma.core.render.canvas(self.device) as draw:
            draw.text((20, 20), text, fill='white', font=self.regular_font)

    def __call__(self, event):
        if event.action == Potentiometer.VALUE_CHANGED:
            self.text(event.value)
        elif event.action == CloudPlayer.AUTHORIZATION_PROMPT:
            self.text(event.value)


class RotaryEncoder(Component):

    ROTATE_LEFT = 'ROTATE_LEFT'
    ROTATE_RIGHT = 'ROTATE_RIGHT'
    PUSH_BUTTON = 'PUSH_BUTTON'

    def __init__(self, clk, dt):
        super().__init__()
        self.clk = Input(clk)
        self.dt = Input(dt)
        self.subscribe(Input.RISING, self.clk)
        self.subscribe(Input.FALLING, self.clk)

    def __call__(self, event):
        if (event.action == Input.RISING) == self.dt.get():
            self.publish(RotaryEncoder.ROTATE_LEFT)
        else:
            self.publish(RotaryEncoder.ROTATE_RIGHT)


class Potentiometer(Component):

    VALUE_CHANGED = 'VALUE_CHANGED'

    def __init__(self, clk, dt, initial=0.0, steps=32.0):
        super().__init__()
        self.rotary_encoder = RotaryEncoder(clk, dt)
        self.subscribe(RotaryEncoder.ROTATE_LEFT, self.rotary_encoder)
        self.subscribe(RotaryEncoder.ROTATE_RIGHT, self.rotary_encoder)
        self.value = initial
        self.step = 1.0 / steps

    def __call__(self, event):
        if event.action == RotaryEncoder.ROTATE_LEFT:
            self.value = min(self.value + self.step, 1.0)
        else:
            self.value = max(self.value - self.step, 0.0)
        self.publish(Potentiometer.VALUE_CHANGED, self.value)


class WebSocket(Component, WebSocketHandler):

    def __init__(self, request, application, volume=None):
        super().__init__(request, application)
        self.volume = volume

    def open(self):
        self.subscribe(Potentiometer.VALUE_CHANGED, self.volume)

    def on_close(self):
        self.unsubscribe(Potentiometer.VALUE_CHANGED, self.volume)

    def __call__(self, event):
        if event.action == Potentiometer.VALUE_CHANGED:
            self.write_message(volume=event.value)
        elif event.action == CloudPlayer.AUTHORIZATION_PROMPT:
            self.write_message(volume=event.value)


class CloudPlayer(Component):

    AUTHORIZATION_PROMPT = 'AUTHORIZATION_PROMPT'

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
            self.check_token, 5 * 1000)
        self.token_callback.start()
        self.publish(self.AUTHORIZATION_PROMPT, 'enter\n%s' % self.token['id'])
        app_log.info('create %s' % self.token)

    @tornado.gen.coroutine
    def check_token(self):
        response = yield self.fetch('/token/{}'.format(self.token['id']))
        self.token = tornado.escape.json_decode(response.body)
        if self.token['claimed']:
            self.token_callback.stop()
            self.login_callback.stop()
            self.publish(self.AUTHORIZATION_PROMPT, 'auth done')
        app_log.info('check %s' % self.token)
