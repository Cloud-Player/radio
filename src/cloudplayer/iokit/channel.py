"""
    cloudplayer.iokit.channel
    ~~~~~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2018 by the cloudplayer team
    :license: Apache-2.0, see LICENSE for details
"""
from cloudplayer.iokit.component import Component
from cloudplayer.iokit.gpio import GPIO


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

    VALUE_CHANGED = 'VALUE_CHANGED'

    def __init__(self, channel):
        super().__init__(channel, GPIO.IN, pull_up_down=GPIO.PUD_UP)
        GPIO.add_event_detect(channel, GPIO.BOTH, self.callback)

    def __del__(self):
        GPIO.remove_event_detect(self.channel)
        super(Input, self).__del__()

    def callback(self, channel):
        if self.channel == channel:
            self.publish(self.VALUE_CHANGED, self.get())


class Output(Channel):

    def __init__(self, channel):
        self.__init__(channel, GPIO.OUT, initial=GPIO.LOW)

    def put(self, state):
        GPIO.output(self.channel, state)

    def toggle(self):
        self.put(not self.get())
