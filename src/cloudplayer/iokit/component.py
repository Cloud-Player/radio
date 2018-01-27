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
        event = Event(action=action, source=self, value=value)
        EventManager.publish(event)

    def subscribe(self, action, target):
        EventManager.add_subscription(action, target, self)

    def unsubscribe(self, action, target):
        EventManager.remove_subscription(action, target, self)
