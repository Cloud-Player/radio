"""
    cloudplayer.iokit.component
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2018 by the cloudplayer team
    :license: Apache-2.0, see LICENSE for details
"""
import uuid

from cloudplayer.iokit.event import Event, EventManager


class Component(object):

    def __init__(self, *args, **kw):
        self.uuid = uuid.uuid4().hex
        super().__init__(*args, **kw)

    def __call__(self, event):
        raise NotImplementedError()

    def publish(self, action, value=None):
        event = Event(action=action, publisher=self, value=value)
        EventManager.publish(event)

    def subscribe(self, action, subscriber):
        EventManager.add_subscription(action, self, subscriber)

    def unsubscribe(self, action, subscriber):
        EventManager.remove_subscription(action, self, subscriber)
