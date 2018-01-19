"""
    cloudplayer.radio.socket
    ~~~~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2017 by the cloudplayer team
    :license: Apache-2.0, see LICENSE for details
"""
import json

import tornado.websocket
import tornado.options as opt


class WebSocketHandler(tornado.websocket.WebSocketHandler):

    def set_default_headers(self):
        headers = [
            ('Access-Control-Allow-Credentials', 'true'),
            ('Access-Control-Allow-Headers', 'Accept, Content-Type, Origin'),
            ('Access-Control-Allow-Methods', 'GET, OPTIONS'),
            ('Access-Control-Allow-Origin', opt.options['allowed_origin']),
            ('Access-Control-Max-Age', '600'),
            ('Content-Language', 'en-US'),
            ('Content-Type', 'application/json'),
            ('Pragma', 'no-cache'),
            ('Server', 'cloudplayer')
        ]
        for header, value in headers:
            self.set_header(header, value)

    def write_message(self, **kw):
        super().write_message(json.dumps(kw))

    @tornado.gen.coroutine
    def options(self, *_, **__):
        self.finish()

    def check_origin(self, *_):
        return True
