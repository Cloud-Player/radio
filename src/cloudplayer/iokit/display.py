"""
    cloudplayer.iokit.display
    ~~~~~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2018 by the cloudplayer team
    :license: Apache-2.0, see LICENSE for details
"""
import functools

from PIL import ImageFont, ImageDraw, Image
from luma.core.render import canvas
import tornado.ioloop
import tornado.options as opt

from cloudplayer.iokit.component import Component


class Display(Component):

    FONT_SIZE = 20

    def __init__(self, device):
        super().__init__()
        self.font = ImageFont.truetype(
            opt.options['font_file'], self.FONT_SIZE, 0, 'unic')
        self.device = device
        self.runner = None
        self.frame = Image.new(device.mode, device.size)
        self.key_frame = Image.new(device.mode, device.size)

    def draw(self, image, frame=True, key_frame=False):
        if image is None:
            return
        width, height = image.size
        min_edge = float(min(width, height))
        pad_left = (width - min_edge) / 2.0
        pad_top = (height - min_edge) / 2.0
        pad_right = width - pad_left
        pad_bottom = height - pad_top
        image = image.crop((pad_left, pad_top, pad_right, pad_bottom))
        image = image.resize((self.device.width, self.device.height))
        if key_frame:
            self.key_frame = image.copy()
        if frame:
            image = image.filter(self.filter)
            self.frame = image.copy()
        self.device.display(image)

    def text(self, text, timeout=None):
        image = Image.new(self.device.mode, self.device.size)
        draw = ImageDraw.Draw(image)
        draw.text((5, 35), text, fill='white', align='center', font=self.font)
        self.draw(image, frame=False)
        if timeout:
            ioloop = tornado.ioloop.IOLoop.current()
            if self.runner:
                ioloop.remove_timeout(self.runner)
            func = functools.partial(self.draw, self.frame, frame=False)
            self.runner = ioloop.call_later(timeout / 1000.0, func)
