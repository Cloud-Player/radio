"""
    cloudplayer.iokit.socket
    ~~~~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2018 by the cloudplayer team
    :license: Apache-2.0, see LICENSE for details
"""
from tornado.log import app_log
import tornado.escape
import tornado.options as opt
import tornado.web
import tornado.websocket

from cloudplayer.iokit.component import Component


class Handler(tornado.websocket.WebSocketHandler):

    def __init__(self, request, application, on_open=None, on_close=None):
        super().__init__(request, application)
        self.on_open = on_open
        self.on_close = on_close

    def set_default_headers(self):
        headers = [
            ('Access-Control-Allow-Credentials', 'true'),
            ('Access-Control-Allow-Headers', 'Accept, Content-Type, Origin'),
            ('Access-Control-Allow-Methods', 'GET, OPTIONS'),
            ('Access-Control-Allow-Origin', self.allowed_origin),
            ('Access-Control-Max-Age', '600'),
            ('Content-Language', 'en-US'),
            ('Content-Type', 'application/json'),
            ('Pragma', 'no-cache'),
            ('Server', 'cloudplayer')
        ]
        for header, value in headers:
            self.set_header(header, value)

    def open(self):
        self.on_open(self.ws_connection)

    def on_close(self):
        self.on_close()

    def check_origin(self, origin):
        return origin in opt.options['allowed_origins']

    @property
    def allowed_origin(self):
        proposed_origin = self.request.headers.get('Origin')
        if proposed_origin in opt.options['allowed_origins']:
            return proposed_origin
        return opt.options['allowed_origins'][0]

    @tornado.gen.coroutine
    def options(self, *_, **__):
        self.finish()


class Server(Component):

    def __init__(self):
        super().__init__()
        self.subscriptions = set()
        self.ws_connection = None
        self.app = tornado.web.Application([
            (r'^/websocket', Handler,
             {'on_open': self.on_open, 'on_close': self.on_close}),
        ], **opt.options.group_dict('server'))
        self.app.listen(opt.options.port)

    def on_open(self, ws_connection):
        app_log.info('socket open')
        self.ws_connection = ws_connection
        for action, target in self.subscriptions:
            super().subscribe(action, target)
            app_log.info('sub {} {}'.format(action, target))

    def on_close(self):
        app_log.info('socket close')
        for action, target in self.subscriptions:
            super().unsubscribe(action, target)
            app_log.info('desub {} {}'.format(action, target))

    def subscribe(self, action, target):
        self.subscriptions.add((action, target))

    def unsubscribe(self, action, target):
        self.subscriptions.discard((action, target))

    def write(self, message):
        if self.ws_connection:
            data = tornado.escape.json_encode(message)
            app_log.info('message was sent %s' % data)
            self.ws_connection.write_message(data, binary=False)
        else:
            app_log.error('message was lost %s' % message)
