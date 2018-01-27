"""
    cloudplayer.iokit.channel
    ~~~~~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2018 by the cloudplayer team
    :license: Apache-2.0, see LICENSE for details
"""
from cloudplayer.iokit.component import Component
from cloudplayer.iokit.channel import Input


class RotaryEncoder(Component):

    ROTATE_LEFT = 'ROTATE_LEFT'
    ROTATE_RIGHT = 'ROTATE_RIGHT'

    def __init__(self, clk, dt):
        super().__init__()
        self.clk = Input(clk)
        self.dt = Input(dt)
        self.subscribe(Input.VALUE_CHANGED, self.clk)
        self.subscribe(Input.VALUE_CHANGED, self.dt)
        self.last_clk_state = self.clk.get()

    def __call__(self, event):
        if event.action == Input.VALUE_CHANGED:
            if event.source is self.clk:
                clk_state, dt_state = event.value, self.dt.get()
            elif event.source is self.dt:
                clk_state, dt_state = self.clk.get(), event.value
            else:
                return
            if clk_state != self.last_clk_state:
                self.last_clk_state = clk_state
                if dt_state == clk_state:
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
        self.publish(Potentiometer.VALUE_CHANGED, int(self.value * 100))
