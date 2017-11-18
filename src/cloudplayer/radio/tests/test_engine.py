import pygame
import pytest

import cloudplayer.radio.engine


def test_engine_should_setup_correctly(mock_gpio):
    cloudplayer.radio.engine.setup()
    mock_gpio.setmode.assert_called_with(mock_gpio.BCM)
    mock_gpio.setwarnings.assert_called_with(False)


def test_pygame_should_initialize_correctly():
    cloudplayer.radio.engine.setup()
    assert pygame.base.get_sdl_version()
    assert not pygame.event.get_blocked(pygame.USEREVENT)
    assert pygame.event.get_blocked(pygame.MOUSEMOTION)


def test_engine_should_teardown_correctly(mock_gpio):
    cloudplayer.radio.engine.teardown()
    mock_gpio.cleanup.assert_called()
