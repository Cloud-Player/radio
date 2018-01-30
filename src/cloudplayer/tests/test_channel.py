from cloudplayer.iokit import Input, Output


def test_input_channel_should_publish_value_on_callback(mock_gpio):
    Input(42).callback(42)
    mock_gpio.input.assert_called_with(42)


def test_output_channel_should_return_value_on_get(mock_gpio):
    Output(45).get()
    mock_gpio.input.assert_called_with(45)


def test_output_channel_should_put_given_state(mock_gpio):
    Output(45).put(False)
    mock_gpio.output.assert_called_with(45, False)
