# 🌙 Hatch Card for Home Assistant
[![GitHub Release][release_badge]][release]
[![Community Forum][forum_badge]][forum]
[![Buy Me A Coffee][bmac_badge]][bmac]

<!-- Link references -->
[release_badge]: https://img.shields.io/github/v/release/eyalgal/hatch-card
[release]: https://github.com/eyalgal/hatch-card/releases
[forum_badge]: https://img.shields.io/badge/Community-Forum-5294E2.svg
[forum]: https://community.home-assistant.io/t/hatch-card-the-all-in-one-card-for-your-hatch-sound-machine/913174
[bmac_badge]: https://img.shields.io/badge/buy_me_a-coffee-yellow
[bmac]: https://www.buymeacoffee.com/eyalgal

A sleek, modern, and highly customizable Lovelace card to control your Hatch Rest devices in Home Assistant. This card combines light and media player controls into a single, intuitive interface.

> This card was built for and tested with the **Hatch Rest+**. It may work with other Hatch products (like the Rest, Rest Mini, or Restore) if they are supported by the underlying Hatch integration, but functionality is not guaranteed. The card is also flexible enough to be used with other sound and light devices from different brands.

## ✨ Features

- **All-in-One Control:** Manage your device's light and sound from a single card.
- **Sound-Only Mode:** The light entity is optional, so the card can be used as a dedicated media player controller.
- **Sleep Timer Presets (v1.3.0+):** Start and cancel a Home Assistant `timer.*` helper from the card. Presets are available only when a timer helper is configured.
- **Device-Specific Controls:** Native support for Toddler Lock, Clock Brightness, and Battery Level indicators (requires corresponding entities).
- **Customizable Layouts & Controls:** Choose `vertical` or `horizontal` layouts and re-order controls to build your interface.
- **Dynamic Backgrounds:** Set the card background to reflect the light's color, visually represent the volume level, or keep it standard.
- **Full Action Support:** Supports standard Home Assistant `tap_action`, `hold_action`, and `double_tap_action` (tap is icon-only by default).
- **Custom Icons & Photos:** Use dynamic icons that change with the sound, set a static icon, or use a photo.
- **Easy Configuration:** Configurable through the Lovelace visual UI editor.
- **Haptic Feedback:** Optional tactile feedback on mobile devices.
- **Volume Slider:** Optional volume slider in expanded controls.
- **Custom Controls Order:** Fully customize the order of expanded controls.

## ✅ Requirements

- **Home Assistant:** Version 2023.4 or newer.
- **Hatch Integration (Optional):** For Hatch devices, the [Hatch Rest Integration](https://github.com/dahlb/ha_hatch) by `dahlb` is required.
- For other devices, you only need a `media_player` entity.
- **Timer feature (optional):** A Home Assistant `timer.*` helper entity.

## 🚀 Installation

### HACS

Hatch Card is available in [HACS](https://hacs.xyz/) (Home Assistant Community Store).

Use this link to directly go to the repository in HACS:

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=eyalgal&repository=hatch-card)

or

1. Install HACS if you don't have it already
2. Open HACS in Home Assistant
3. Search for "Hatch Card"
4. Click the download button

## Main Configuration

| Name                       | Type      | Default             | Description                                                                                    |
| :------------------------- | :-------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| `type`                     | `string`  | **Required**        | `custom:hatch-card`                                                                            |
| `media_player_entity`      | `string`  | **Required**        | The entity ID of your media player.                                                            |
| `light_entity`             | `string`  | `null`              | The entity ID of your light. Optional.                                                         |
| `name`                     | `string`  | Entity Name         | A custom name for the card.                                                                    |
| `icon`                     | `string`  | `mdi:speaker`       | A custom icon. If not set, it uses a dynamic, sound-specific icon.                             |
| `user_photo`               | `string`  | `null`              | A URL to a photo to use instead of an icon.                                                    |
| `layout`                   | `string`  | `horizontal`        | Card layout. Can be `horizontal` or `vertical`.                                                |
| `background_mode`          | `string`  | `full`              | Card background style: `full` (color fill), `volume` (fill based on volume), or `none`.        |
| `secondary_info`           | `string`  | `Volume {volume}%`  | Custom text. Use placeholders like `{volume}`, `{sound}`, `{brightness}`. Set to `''` to hide. |
| `controls_order`           | `array`   | `[...]`             | A list to re-order expanded controls (includes `volume_slider`).                               |
| `show_volume_buttons`      | `boolean` | `true`              | Show the volume up/down buttons.                                                               |
| `show_volume_slider`       | `boolean` | `false`             | Show a volume slider in the expanded controls.                                                 |
| `show_expand_button`       | `boolean` | `false`             | If `true`, additional controls are hidden behind an expand button.                             |
| `show_sound_control`       | `boolean` | `false`             | Show the sound-mode dropdown in the expanded view.                                             |
| `show_brightness_control`  | `boolean` | `false`             | Show the brightness slider in the expanded view.                                               |
| `show_brightness_when_off` | `boolean` | `false`             | Show the brightness slider even when the light is off.                                         |
| `show_timer`               | `boolean` | `false`             | Show sleep timer presets in the expanded view (requires `timer_entity`).                       |
| `timer_entity`             | `string`  | `null`              | Entity ID of a Home Assistant `timer.*` helper. Required to enable timer presets.              |
| `timer_presets`            | `array`   | `[15, 30, 60, 120]` | Timer presets in minutes.                                                                      |
| `sync_hatch_timer`         | `boolean` | `true`              | Also call Hatch timer services when supported by the integration.                              |
| `show_scenes`              | `boolean` | `false`             | Show the scene buttons in the expanded view.                                                   |
| `show_toddler_lock`        | `boolean` | `false`             | Show the toddler-lock toggle (requires `toddler_lock_entity`).                                 |
| `show_clock_brightness`    | `boolean` | `false`             | Show the clock-brightness slider (requires `clock_brightness_entity`).                         |
| `show_battery_indicator`   | `boolean` | `false`             | Show the battery indicator (requires `battery_level_entity`).                                  |
| `toddler_lock_entity`      | `string`  | `null`              | Entity ID for the toddler-lock switch entity.                                                  |
| `clock_brightness_entity`  | `string`  | `null`              | Entity ID for the clock-brightness light entity.                                               |
| `battery_level_entity`     | `string`  | `null`              | Entity ID for the battery-level sensor entity.                                                 |
| `charging_status_entity`   | `string`  | `null`              | Entity ID for the charging-status `binary_sensor`.                                             |
| `volume_presets`           | `array`   | `null`              | An array of volume presets (0–1) for buttons. Example: `[0.25, 0.5, 0.75]`.                     |
| `volume_step`              | `number`  | `0.01`              | Amount to change the volume with each button press.                                            |
| `animation_duration`       | `number`  | `250`               | Duration of animations in ms. Set to `0` to disable.                                           |
| `haptic`                   | `boolean` | `true`              | Enable haptic feedback (vibration) on touch.                                                   |
| `volume_click_control`     | `boolean` | `true`              | When `background_mode` is `volume`, allows setting volume by clicking the card.                |
| `tap_action`               | `object`  | `action: toggle`    | Action to perform on icon tap.                                                                 |
| `hold_action`              | `object`  | `action: more-info` | Action to perform on icon hold.                                                                |
| `double_tap_action`        | `object`  | `action: none`      | Action to perform on icon double tap.                                                          |

---

## Timer (v1.3.0+)

The Hatch Card timer UI uses a Home Assistant `timer.*` helper.

### Setup
1. Create a timer helper:
   - Settings -> Devices & Services -> Helpers -> Create Helper -> Timer
2. Add it to your card config:

```yaml
type: custom:hatch-card
media_player_entity: media_player.rest_plus
light_entity: light.rest_plus
show_expand_button: true
show_timer: true
timer_entity: timer.johnny_sleep
timer_presets: [15, 30, 60, 120]
sync_hatch_timer: true
```
### Important
The card starts and cancels the timer. It does not execute "when the timer is up" actions inside the card.

Use an automation triggered by `timer.finished` (examples below).

### Recommended for advanced timer UI
If you want a richer timer UI (progress displays, multiple timers, more customization), use my Simple Timer Card:
https://github.com/eyalgal/simple-timer-card

---

## Automation examples (when the timer is up)

### Example: turn off light and stop sound
```yaml
alias: Hatch - Sleep timer finished
mode: single
trigger:
  - platform: event
    event_type: timer.finished
    event_data:
      entity_id: timer.johnny_sleep
action:
  - service: light.turn_off
    target:
      entity_id: light.rest_plus
  - service: media_player.media_stop
    target:
      entity_id: media_player.rest_plus
```

### Example: OK-to-wake style (sound off, light turns green)
```yaml
alias: Hatch - OK to wake
mode: single
trigger:
  - platform: event
    event_type: timer.finished
    event_data:
      entity_id: timer.johnny_nap
action:
  - service: media_player.media_stop
    target:
      entity_id: media_player.rest_plus
  - service: light.turn_on
    target:
      entity_id: light.rest_plus
    data:
      brightness_pct: 40
      color_name: green
      transition: 3
```

---

## Scene Configuration

The `scenes` option takes a list of scene objects. Each object can define its own set of parameters.

| Name             | Type      | Description                                                                                      |
| :--------------- | :-------- | :----------------------------------------------------------------------------------------------- |
| `name`           | `string`  | **Required.** The name displayed on the scene button.                                            |
| `icon`           | `string`  | An icon for the scene button (example: `mdi:weather-night`).                                     |
| `entity_id`      | `string`  | The entity ID of a Home Assistant scene. If used, it overrides all other manual settings below. |
| `transition`     | `number`  | Transition time (seconds) for the scene.                                                         |
| `turn_off_light` | `boolean` | Set to `true` to turn the light off.                                                             |
| `turn_off_media` | `boolean` | Set to `true` to turn the media player off.                                                      |
| `color`          | `string`  | Set the light color by name (`'red'`) or RGB (`'255,0,0'`).                                      |
| `brightness`     | `number`  | Set the light brightness from 1–100.                                                             |
| `sound_mode`     | `string`  | The name of the sound to play (example: `'WhiteNoise'`).                                         |
| `volume`         | `number`  | Set the volume from 0–100.                                                                       |

## Use Cases & Examples

### Toddler OK-to-wake nap timer (v1.3.0+)

<img width="400" alt="image" src="https://github.com/user-attachments/assets/a1d65498-b953-4db3-aafd-b9747061c93b" />

Card config:

```yaml
type: custom:hatch-card
light_entity: light.rest_plus
media_player_entity: media_player.rest_plus
name: Johnny's Hatch
show_expand_button: true
show_timer: true
timer_entity: timer.johnny_nap
timer_presets: [60, 90, 120]
```

Automation (what happens when the timer is up):

```yaml
alias: Hatch - OK to wake (nap done)
mode: single
trigger:
  - platform: event
    event_type: timer.finished
    event_data:
      entity_id: timer.johnny_nap
action:
  - service: media_player.media_stop
    target:
      entity_id: media_player.rest_plus
  - service: light.turn_on
    target:
      entity_id: light.rest_plus
    data:
      brightness_pct: 40
      color_name: green
      transition: 3
```

### Simple Vertical Sound Machine

<img width="400" alt="image" src="https://github.com/user-attachments/assets/ebfc3f2e-252a-4c75-97ac-924d93725cee" />

```yaml
type: custom:hatch-card
light_entity: light.rest_plus
media_player_entity: media_player.rest_plus
layout: vertical
name: Johnny's Hatch
secondary_info: '{sound}'
```

### All-in-One Control Center

<img width="400" alt="image" src="https://github.com/user-attachments/assets/d9dd8f72-f6f3-4c95-ad3b-9b5896784115" />

```yaml
type: custom:hatch-card
light_entity: light.rest_plus
media_player_entity: media_player.rest_plus
name: Johnny's Hatch
background_mode: volume
secondary_info: 'Sound: {sound} • Brightness: {brightness}%'
show_expand_button: true
show_brightness_control: true
show_sound_control: true
show_timer: true
timer_entity: timer.johnny_sleep
timer_presets: [15, 30, 60, 120]
volume_presets: [0.25, 0.5, 0.75, 1.0]
```

### Minimalist Nightstand Control

<img width="400" alt="image" src="https://github.com/user-attachments/assets/2cbcd45a-8e9c-4f34-8b46-7c07b5dab466" />

```yaml
type: custom:hatch-card
light_entity: light.rest_plus
media_player_entity: media_player.rest_plus
name: Johnny's Hatch
show_expand_button: true
show_scenes: true
show_brightness_control: true
show_sound_control: true
scenes_per_row: 3
scenes:
  - name: Reading
    icon: mdi:book-open-page-variant
    brightness: 40
    turn_off_media: true
    color: white
  - name: Sleep
    icon: mdi:weather-night
    color: red
    brightness: 5
    sound_mode: WhiteNoise
    volume: 35
  - name: Off
    icon: mdi:power-off
    turn_off_light: true
    turn_off_media: true
```

## Actions

The card supports standard Home Assistant actions for `tap_action`, `hold_action`, and `double_tap_action`.

Example: change the light to green on a long press:

```yaml
type: custom:hatch-card
light_entity: light.rest_plus
media_player_entity: media_player.rest_plus
hold_action:
  action: call-service
  service: light.turn_on
  target:
    entity_id: light
  data:
    color_name: green
```

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## ❤️ Support

If you find this card useful and would like to support it, you can buy me a coffee:

<a href="https://coff.ee/eyalgal" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>
