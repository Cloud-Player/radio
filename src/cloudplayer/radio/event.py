"""
    cloudplayer.radio.event
    ~~~~~~~~~~~~~~~~~~~~~~~

    :copyright: (c) 2017 by the cloudplayer team
    :license: Apache-2.0, see LICENSE for details
"""
import collections
import traceback

import tornado.ioloop
import tornado.queues


class Event(object):

    def __init__(self, action=None, source=None, value=None):
        self.action = action
        self.source = source
        self.value = value

    def __repr__(self):
        return '<{}.{} action="{}" source="{}" value="{}">'.format(
            self.__class__.__module__, self.__class__.__name__,
            self.action, self.source.__class__.__name__, self.value)


class EventManager(tornado.ioloop.PeriodicCallback):

    subscriptions = collections.defaultdict(set)
    queue = tornado.queues.Queue(maxsize=1024)

    def __init__(self, callback_time=30):
        super().__init__(self.process, callback_time)

    @classmethod
    def add_subscription(cls, action, source, target):
        trigger = '{}@{}'.format(action, source.uuid)
        if trigger not in cls.subscriptions:
            cls.subscriptions[trigger] = set()
        cls.subscriptions[trigger].add(target)

    @classmethod
    def remove_subscription(cls, action, source, target):
        trigger = '{}@{}'.format(action, source.uuid)
        if trigger in cls.subscriptions:
            cls.subscriptions[trigger].discard(target)

    @classmethod
    def publish(cls, event):
        cls.queue.put_nowait(event)

    @classmethod
    async def process(cls):
        async for event in cls.queue:
            try:
                trigger = '{}@{}'.format(event.action, event.source.uuid)
                for component in cls.subscriptions[trigger]:
                    component(event)
            except:
                traceback.print_exc()
            finally:
                cls.queue.task_done()
