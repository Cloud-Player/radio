from luma.core.device import dummy as DummyDevice
from PIL import ImageFont, ImageFilter, Image
import tornado.options as opt

from cloudplayer.iokit.display import Display


def test_display_should_initialize_with_empty_frames():
    display = Display(DummyDevice(16, 16))
    assert display.frame.size == (16, 16)
    assert display.key_frame.size == (16, 16)


def test_display_should_initialize_with_true_type_font():
    display = Display(DummyDevice())
    assert display.font.path == opt.options['font_file']


def test_display_should_draw_image_without_frame_buffering(mocker):
    device = DummyDevice(16, 16)
    mocker.spy(device, 'display')
    display = Display(device)
    im1 = Image.new(device.mode, (32, 32), color='red')
    display.draw(im1, False, False)
    im2 = device.display.call_args[0][0]
    assert im2.size == (16, 16)
    assert display.frame.tobytes() != im2.tobytes()
    assert display.key_frame.tobytes() != im2.tobytes()


def test_display_should_draw_image_as_frame(mocker):
    device = DummyDevice()
    mocker.spy(device, 'display')
    display = Display(device)
    im1 = Image.new(device.mode, device.size, color='red')
    display.draw(im1, True, False)
    im2 = device.display.call_args[0][0]
    assert display.frame.tobytes() == im2.tobytes()
    assert display.key_frame.tobytes() != im2.tobytes()


def test_display_should_filter_image(mocker):
    device = DummyDevice(3, 3)
    mocker.spy(device, 'display')
    display = Display(device)
    im1 = Image.new(device.mode, device.size, color='red')
    im1.putpixel((1, 1), 0)
    display.filter = ImageFilter.GaussianBlur(9)
    display.draw(im1, True, False)
    im2 = device.display.call_args[0][0]
    assert im1.tobytes() != im2.tobytes()


def test_display_should_draw_image_as_key_frame(mocker):
    device = DummyDevice()
    mocker.spy(device, 'display')
    display = Display(device)
    im1 = Image.new(device.mode, device.size, color='red')
    display.draw(im1, True, True)
    im2 = device.display.call_args[0][0]
    assert display.frame.tobytes() == im2.tobytes()
    assert display.key_frame.tobytes() == im2.tobytes()


def test_display_should_draw_text_as_non_frame(mocker):
    device = DummyDevice()
    display = Display(device)
    mocker.spy(display, 'draw')
    display.text('Hello World')
    args, kw = display.draw.call_args
    assert isinstance(args[0], Image.Image)
    assert not kw['frame']
