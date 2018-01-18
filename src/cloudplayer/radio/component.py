"""
    cloudplayer.radio.component
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2017 by the cloudplayer team
    :license: Apache-2.0, see LICENSE for details
"""
import functools
import uuid

import luma.core.render

from cloudplayer.radio.gpio import GPIO
from cloudplayer.radio.event import Event, EventManager


class Component(object):

    def __init__(self):
        self.uuid = uuid.uuid4().hex

    def __call__(self, event):
        raise NotImplementedError()

    def publish(self, action, value=None):
        event = Event(action=action, target=self, value=value)
        EventManager.publish(event)

    def subscribe(self, action, target):
        EventManager.add_subscription(action, target, self)


class Channel(Component):

    def __init__(self, channel, in_out, **kw):
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
        super(Input, self).__init__(
            channel, GPIO.IN, pull_up_down=GPIO.PUD_UP)
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

    def __new__(cls, driver_class, **kw):
        name = '%sDisplay' % driver_class.__name__.upper()
        inst = type(name, (cls, driver_class), {}).__new__()
        inst.__init__(**kw)
        return inst

    def __init__(self, contrast=0xE0, **kw):
        super().__init__(**kw)
        self.contrast(contrast)
        # self.show()

    def preprocess(self, image):
        draft = image.draft(self.mode, self.size)
        # TODO: Ensure correct cropping and PNG support (draft dont do it)
        return draft

    def __call__(self, event):
        if (event.action == Potentiometer.VALUE_CHANGED):
            with luma.core.render.canvas(self) as draw:
                draw.text((30, 40), event.value, fill='white')


class RotaryEncoder(Component):

    ROTATE_LEFT = 'ROTATE_LEFT'
    ROTATE_RIGHT = 'ROTATE_RIGHT'
    PUSH_BUTTON = 'PUSH_BUTTON'

    def __init__(self, clk, dt):
        self.clk = Input(clk)
        self.dt = Input(dt)
        self.subscribe(Output.RISING, self.clk)
        self.subscribe(Output.FALLING, self.clk)

    def __call__(self, event):
        if (event.action == Output.RISING) == self.dt.get():
            self.publish(RotaryEncoder.ROTATE_LEFT)
        else:
            self.publish(RotaryEncoder.ROTATE_RIGHT)


class Potentiometer(Component):

    VALUE_CHANGED = 'VALUE_CHANGED'

    def __init__(self, clk, dt, initial=0.0, steps=32.0):
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


class LEDArray(Component):

    def __init__(self, *leds):
        self.leds = list(Output(l) for l in leds)

    def __call__(self, event):
        for index, led in enumerate(self.leds):
            if (event.value / (1.0 / len(self.leds))) > index:
                self.put(GPIO.HIGH)
            else:
                self.put(GPIO.LOW)
