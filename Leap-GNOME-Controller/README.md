# Leap Motion GNOME Controller

This is a relatively small Python script that uses Leap Motion's libs to
detect hands' motion and gestures and interprets them, producing a
corresponding action for the GNOME Desktop.


## How to Use

Copy the following LeapMotion SDK v2 files into this application folder.
* leap.py
* LeapPython.so
* libLeap.so

Run the leapd daemon, then run leap-gnome-controller.py:
```
$ leapd &
$ ./leap-gnome-controller.py
```

## Gestures

Point with your index finger and thumb to move the mouse.
Tap down to click.
The click motion slightly moves the mouse, so retract your thumb to freeze the cursor.

If the mouse doesn't move too much for a little while, it will be stopped
until a there is a big move again. This makes it easier to perform a click.



## List of Gestures


### One Handed Gestures
| Action                        | Gesture                                         |
| ------------------------------|-------------------------------------------------|
| Move Cursor                   | Point with Index and Thumb                      |
| Freeze Cursor                 | Point with just index, useful for clicking      |
| Click                         | Key tap gesture with one or two fingers extended|
| Drag Window                   | Pinch with thumb and index, other fingers out   |
| Toggle Activities View        | Circle gesture with open hand counter clockwise |
| Start new Terminal            | Circle gesture with open hand clockwise         |
| Move to Previous/Next Desktop | Swipe up/down using one opened hand, thumb in   |

### Two Handed Gestures
| Action                        | Gesture                                         |
| ------------------------------|-------------------------------------------------|
| Increase/Decrease Zoom        | Pinch gesture using two hands' pointing fingers |

Gestures may be added or changed in the future!


## Thanks to
joaquimrocha for doing most of this work:
https://github.com/joaquimrocha/Leap-GNOME-Controller

## License

This script is released under GPLv3's terms and conditions.
