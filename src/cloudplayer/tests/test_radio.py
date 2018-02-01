from cloudplayer.iokit.event import Event
import cloudplayer.radio.component as radio


def test_volume_should_toggle_mute_state(event_manager):
    vol = radio.Volume(1, 2)
    vol.value = 42
    vol.toggle_mute(Event(None, None, value=1))
    event = event_manager.queue.get_nowait()
    assert event.action == vol.VALUE_CHANGED
    assert event.publisher is vol
    assert event.value == 0
    vol.toggle_mute(Event(None, None, value=1))
    event = event_manager.queue.get_nowait()
    assert event.action == vol.VALUE_CHANGED
    assert event.publisher is vol
    assert event.value == 42
