import collections

import tornado.ioloop
import tornado.queues


class Event(object):

    def __init__(self, action=None, target=None, value=None):
        self.action = action
        self.target = target
        self.value = value


class EventManager(tornado.ioloop.PeriodicCallback):

    subscriptions = collections.defaultdict(set)
    queue = tornado.queues.Queue(maxsize=1024)

    def __init__(self, callback_time=100):
        super().__init__(self.process, callback_time)

    @classmethod
    def add_subscription(cls, action, component):
        if action not in subscriptions:
            cls.subscriptions[action] = set()
        cls.subscriptions[action].add(component)

    @classmethod
    def publish(cls, event):
        cls.queue.put_nowait(event)

    @classmethod
    async def process(cls):
        async for event in cls.queue:
            try:
                for component in self.subscriptions[event.action]:
                    component(event)
            finally:
                cls.queue.task_done()
