import mock
import tornado.ioloop

from cloudplayer.iokit import Component
from cloudplayer.iokit import EventManager


def test_component_should_provide_uuid():
    assert len(Component().uuid) == 32


def test_component_should_publish_event_to_manager():
    comp = Component()
    comp.publish('ACTION', 42)
    event = EventManager.queue.get_nowait()
    assert event.action == 'ACTION'
    assert event.value == 42
    assert event.publisher == comp


def test_component_should_subscribe_to_event():
    c1 = Component()
    c2 = Component()
    c1.subscribe('ACTION', c2)
    trigger = 'ACTION@{}'.format(c1.uuid)
    assert c2 in EventManager.subscriptions.get(trigger)


def test_component_should_unsubscribe_from_event():
    c1 = Component()
    c2 = Component()
    c1.subscribe('ACTION', c2)
    trigger = 'ACTION@{}'.format(c1.uuid)
    assert c2 in EventManager.subscriptions.get(trigger)
    c1.unsubscribe('ACTION', c2)
    assert c2 not in EventManager.subscriptions.get(trigger)


def test_component_should_register_callback_on_ioloop(mocker):
    def callback(*_):
        pass
    ioloop = mock.MagicMock()
    mocker.patch('tornado.ioloop.IOLoop.current', lambda: ioloop)
    comp = Component()
    comp.add_callback(callback)
    ioloop.add_callback.assert_called_once_with(callback)
