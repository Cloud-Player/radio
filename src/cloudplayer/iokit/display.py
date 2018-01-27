"""
    cloudplayer.iokit.display
    ~~~~~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2018 by the cloudplayer team
    :license: Apache-2.0, see LICENSE for details
"""
from PIL import ImageFont, Image
from luma.core.render import canvas

from cloudplayer.iokit.component import Component


class Display(Component):

    FONT_SIZE = 20
    FONT_FILE = 'src/cloudplayer/iokit/font/RobotoMono-Regular.ttf'

    def __init__(self, device):
        super().__init__()
        self.font = ImageFont.truetype(
            self.FONT_FILE, self.FONT_SIZE, 0, 'unic')
        self.device = device
        self.buffer = None

    def draw(self, image):
        width, height = image.size
        min_edge = float(min(width, height))
        pad_left = (width - min_edge) / 2.0
        pad_top = (height - min_edge) / 2.0
        pad_right = width - pad_left
        pad_bottom = height - pad_top
        cropped = image.crop((pad_left, pad_top, pad_right, pad_bottom))
        sized = cropped.resize((self.device.width, self.device.height))
        self.buffer = sized.copy()
        self.device.display(sized)

    def text(self, text):
        with canvas(self.device) as draw:
            draw.text(
                (0, 0), text, fill='white', align='center', font=self.font)
