"""
    cloudplayer.iokit.event
    ~~~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2018 by the cloudplayer team
    :license: Apache-2.0, see LICENSE for details
"""
import collections
import traceback

import tornado.ioloop
import tornado.queues


class Event(object):
    """Event that was fired by a publisher and describes an action.
    The attached value is optional.
    """

    def __init__(self, action, publisher, value=None):
        self.action = action
        self.publisher = publisher
        self.value = value

    def __repr__(self):
        return '<{}.{} action="{}" publisher="{}" value="{}">'.format(
            self.__class__.__module__, self.__class__.__name__,
            self.action, self.publisher.__class__.__name__, self.value)


class EventManager(tornado.ioloop.PeriodicCallback):
    """Event manager that runs itself as a tornado ioloop callback.
    On each tick, it routes any queued events according to the current
    subscription map, and asynchronously executes the callbacks.
    Between ticks, it accepts new events and queues them.
    """

    subscriptions = collections.defaultdict(set)
    queue = tornado.queues.Queue(maxsize=1024)

    def __init__(self, callback_time=30):
        super().__init__(self.tick, callback_time)

    @classmethod
    def add_subscription(cls, action, publisher, subscriber):
        trigger = '{}@{}'.format(action, publisher.uuid)
        if trigger not in cls.subscriptions:
            cls.subscriptions[trigger] = set()
        cls.subscriptions[trigger].add(subscriber)

    @classmethod
    def remove_subscription(cls, action, publisher, subscriber):
        trigger = '{}@{}'.format(action, publisher.uuid)
        if trigger in cls.subscriptions:
            cls.subscriptions[trigger].discard(subscriber)

    @classmethod
    def publish(cls, event):
        cls.queue.put_nowait(event)

    @classmethod
    async def tick(cls):
        async for event in cls.queue:
            try:
                trigger = '{}@{}'.format(event.action, event.publisher.uuid)
                for subscriber in cls.subscriptions[trigger]:
                    subscriber(event)
            except:
                traceback.print_exc()
            finally:
                cls.queue.task_done()
