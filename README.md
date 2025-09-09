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

 [](https://github.com/hacs/integration)
[](https://www.google.com/search?q=https://github.com/eyalgal/hatch-card/releases)
[](https://www.google.com/search?q=https://github.com/eyalgal/hatch-card/actions/workflows/release.yml)

> This card was built for and tested with the **Hatch Rest+**. It may work with other Hatch products (like the Rest, Rest Mini, or Restore) if they are supported by the underlying Hatch integration, but functionality is not guaranteed. The card is also flexible enough to be used with other sound and light devices from different brands.

## **✨ Features**

* **All-in-One Control:** Manage your device's light and sound from a single, unified card.  
* **Sound-Only Mode:** The light entity is now optional, allowing the card to function as a dedicated media player controller.  
* **Persistent Sleep Timer:** Link to an `input_text` helper to create a timer that survives browser reloads and stays in sync across devices.  
* **Device-Specific Controls:** Native support for Toddler Lock, Clock Brightness, and Battery Level indicators (requires corresponding entities).  
* **Customizable Layouts & Controls:** Choose between `vertical` or `horizontal` layouts and re-order controls to build your perfect interface.  
* **Dynamic Backgrounds:** Set the card background to reflect the light's color, visually represent the volume level, or keep it standard.  
* **Full Action Support:** Supports standard Home Assistant `tap_action`, `hold_action`, and `double_tap_action`.  
* **Custom Icons & Photos:** Use dynamic icons that change with the sound, set your own static icon, or even use a photo for a personal touch.  
* **Easy Configuration:** Fully configurable through the Lovelace visual UI editor.  
* **Haptic Feedback:** Get optional tactile feedback on mobile devices when you interact with the card.
* **Volume Slider:** Add a volume slider to the expanded controls for finer volume adjustment.
* **Custom Controls Order:** You can now fully customize the order of expanded controls, including the new slider.
* **Improved Scene Actions:** Scenes now support transition times and better input handling.
* **Synchronized Timers Across Dashboards:** Timers are now fully synchronized. When using a `timer_entity`, the card saves both the countdown and the specific end-actions (light color, sound, etc.) to a central helper. Set a timer on any device, and all other cards will stay in sync.  
**Persistent & Intelligent Timer Actions:** The last used timer actions are now saved and become the default for the next timer, ensuring a consistent experience. The editor also reads this shared state, so your configuration is always transparent.

## **✅ Requirements**

* **Home Assistant:** Version 2023.4 or newer.  
* **Hatch Integration (Optional):** For Hatch devices, the [Hatch Rest Integration](https://github.com/dahlb/ha_hatch) by `dahlb` is required.  
* For other devices, you just need a `media_player` entity.

## **🚀 Installation**

### **HACS**

Hatch Card is available in [HACS](https://hacs.xyz/) (Home Assistant Community Store).

Use this link to directly go to the repository in HACS:

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=eyalgal&repository=hatch-card)

_or_

1. Install HACS if you don't have it already  
2. Open HACS in Home Assistant  
3. Search for "Hatch Card"  
4. Click the download button. ⬇️

### **Main Configuration**

| Name                      | Type      | Default             | Description                                                                                    |
| :------------------------ | :-------- | :------------------ | :--------------------------------------------------------------------------------------------- |
| `type`                    | `string`  | **Required**        | `custom:hatch-card`                                                                            |
| `media_player_entity`     | `string`  | **Required**        | The entity ID of your media player.                                                            |
| `light_entity`            | `string`  | `null`              | The entity ID of your light. **Now optional!**                                                 |
| `name`                    | `string`  | Entity Name         | A custom name for the card.                                                                    |
| `icon`                    | `string`  | `mdi:speaker`       | A custom icon. If not set, it uses a dynamic, sound-specific icon.                             |
| `user_photo`              | `string`  | `null`              | A URL to a photo to use instead of an icon.                                                    |
| `layout`                  | `string`  | `horizontal`        | Card layout. Can be `horizontal` or `vertical`.                                                |
| `background_mode`         | `string`  | `full`              | Card background style: `full` (color fill), `volume` (fill based on volume), or `none`.        |
| `secondary_info`          | `string`  | `Volume {volume}%`  | Custom text. Use placeholders like `{volume}`, `{sound}`, `{brightness}`. Set to `''` to hide. |
| `controls_order`          | `array`   | `[...]`             | A comma-separated list to re-order expanded controls. Now includes `volume_slider`.            |
| `show_volume_buttons`     | `boolean` | `true`              | Show the volume up/down buttons.                                                               |
| `show_volume_slider`      | `boolean` | `false`             | Show a volume slider in the expanded controls. *(NEW in v1.2.1)*                               |
| `show_expand_button`      | `boolean` | `false`             | If `true`, additional controls are hidden behind an expand button.                             |
| `show_sound_control`      | `boolean` | `false`             | Show the sound-mode dropdown in the expanded view.                                             |
| `show_brightness_control` | `boolean` | `false`             | Show the brightness slider in the expanded view.                                               |
| `show_brightness_when_off`| `boolean` | `false`             | Show the brightness slider even when the light is off.                                         |
| `show_timer`              | `boolean` | `false`             | Show the sleep-timer presets in the expanded view.                                             |
| `show_scenes`             | `boolean` | `false`             | Show the scene buttons in the expanded view.                                                   |
| `show_toddler_lock`       | `boolean` | `false`             | Show the toddler-lock toggle (requires `toddler_lock_entity`).                                 |
| `show_clock_brightness`   | `boolean` | `false`             | Show the clock-brightness slider (requires `clock_brightness_entity`).                         |
| `show_battery_indicator`  | `boolean` | `false`             | Show the battery indicator (requires `battery_level_entity`).                                  |
| `timer_entity`            | `string`  | `null`              | Entity ID for an `input_text` helper. **Required for timer synchronization across devices**.   |
| `toddler_lock_entity`     | `string`  | `null`              | Entity ID for the toddler-lock switch entity.                                                  |
| `clock_brightness_entity` | `string`  | `null`              | Entity ID for the clock-brightness light entity.                                               |
| `battery_level_entity`    | `string`  | `null`              | Entity ID for the battery-level sensor entity.                                                 |
| `charging_status_entity`  | `string`  | `null`              | Entity ID for the charging-status `binary_sensor`.                                             |
| `volume_presets`          | `array`   | `null`              | An array of volume presets (0–1) for buttons. E.g. `[0.25, 0.5, 0.75]`.                        |
| `volume_step`             | `number`  | `0.01`              | The amount to change the volume with each button press.                                        |
| `animation_duration`      | `number`  | `250`               | Duration of animations in milliseconds. Set to `0` to disable.                                 |
| `haptic`                  | `boolean` | `true`              | Enable haptic feedback (vibration) on touch.                                                   |
| `volume_click_control`    | `boolean` | `true`              | When `background_mode` is `volume`, allows setting volume by clicking the card.                |
| `tap_action`              | `object`  | `action: toggle`    | Action to perform on a single tap.                                                             |
| `hold_action`             | `object`  | `action: more-info` | Action to perform on a long press.                                                             |
| `double_tap_action`       | `object`  | `action: none`      | Action to perform on a double tap.                                                             |

---

### **Timer Actions**

These options define what happens when a sleep timer, initiated from the card, expires.

| Name                            | Type      | Default             | Description                                                       |
| :------------------------------ | :-------- | :------------------ | :---------------------------------------------------------------- |
| `timer_presets`                 | `array`   | `[15, 30, 60, 120]` | An array of timer presets in minutes.                             |
| `timer_action_turn_off_light`   | `boolean` | `true`              | Turn off the light when the timer expires.                        |
| `timer_action_turn_off_media`   | `boolean` | `false`             | Turn off the media player when the timer expires.                 |
| `timer_action_light_color`      | `string`  | `null`              | Change light to a specific color. E.g., `'red'` or `'255,100,0'`. |
| `timer_action_light_brightness` | `number`  | `null`              | Change light to a specific brightness (1–100).                    |
| `timer_action_sound_mode`       | `string`  | `null`              | Change the sound to a specific mode.                              |
| `timer_action_volume`           | `number`  | `null`              | Change the volume to a specific level (0–100).                    |

---

### **Scene Configuration**

The `scenes` option takes a list of scene objects. Each object can define its own set of parameters.

| Name             | Type      | Description                                                                                     |
| :--------------- | :-------- | :---------------------------------------------------------------------------------------------- |
| `name`           | `string`  | **Required.** The name displayed on the scene button.                                           |
| `icon`           | `string`  | An icon for the scene button (e.g., `mdi:weather-night`).                                       |
| `entity_id`      | `string`  | The entity ID of a Home Assistant scene. If used, it overrides all other manual settings below. |
| `transition`     | `number`  | Transition time (seconds) for the scene. *(NEW in v1.2.1)*                                      |
| `turn_off_light` | `boolean` | Set to `true` to turn the light off.                                                            |
| `turn_off_media` | `boolean` | Set to `true` to turn the media player off.                                                     |
| `color`          | `string`  | Set the light color by name (`'red'`) or RGB (`'255,0,0'`).                                     |
| `brightness`     | `number`  | Set the light brightness from 1–100.                                                            |
| `sound_mode`     | `string`  | The name of the sound to play (e.g., `'WhiteNoise'`).                                           |
| `volume`         | `number`  | Set the volume from 0–100.                                                                      |

## Use Cases & Examples

### Toddler "OK-to-Wake" Nap Timer

This config creates a timer for an afternoon nap. When the timer expires, the white noise turns off, and the light turns on to a soft green color, signaling to your child that it's okay to wake up.

<img width="400" alt="Toddler 'OK-to-Wake' Nap Timer" src="https://github.com/user-attachments/assets/5210a972-e4a2-4c28-bfa6-3909075ebced" />

```yaml
type: custom:hatch-card
light_entity: light.rest_plus
media_player_entity: media_player.rest_plus
name: Johnny's Hatch
show_expand_button: true
show_timer: true
timer_presets: [60, 90, 120]
timer_action_turn_off_light: false # Keep light on
timer_action_turn_off_media: true # Turn sound off
timer_action_light_color: 'green'
timer_action_light_brightness: 40
```

### Simple Vertical Sound Machine

A compact, vertical card perfect for a mobile dashboard. It focuses on the essential controls: turning on/off and adjusting volume.

<img width="230" alt="Simple Vertical Sound Machine" src="https://github.com/user-attachments/assets/46728d42-7520-45db-aa2a-9c7f7d64d83a" />

```yaml
type: custom:hatch-card
light_entity: light.rest_plus
media_player_entity: media_player.rest_plus
layout: vertical
name: Johnny's Hatch
secondary_info: '{sound}' # Only show the name of the current sound
```

### "All-in-One" Control Center

This example exposes all major controls (brightness, sound, timer, and volume presets) behind an expand button for a powerful, all-in-one interface. The background color dynamically fills based on the volume level.

<img width="400" alt="'All-in-One' Control Center" src="https://github.com/user-attachments/assets/cfeb4e8a-694d-40c0-96b5-d8cf61fcce37" />

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
volume_presets: [0.25, 0.5, 0.75, 1.0]
```

### Minimalist Nightstand Control

Perfect for a phone dashboard or small tablet. This compact vertical card uses scenes for the two most common states: 'White Noise' and 'Off'. The main icon still allows you to toggle the last state on and off, and volume controls are always visible for quick adjustments.

<img width="400" alt="'Minimalist Nightstand Control' Control Center" src="https://github.com/user-attachments/assets/102f6460-e555-4429-afd8-b76d4f89f930" />

```yaml
type: custom:hatch-card
light_entity: light.dean_s_hatch_light
media_player_entity: media_player.dean_s_hatch_media_player
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
  - name: "Off"
    icon: mdi:power-off
    turn_off_light: true
    turn_off_media: true
```

## Actions

The card fully supports standard Home Assistant [actions](https://www.home-assistant.io/dashboards/actions/) for `tap_action`, `hold_action`, and `double_tap_action`. This allows you to call services, navigate, or show more info.

**Example:** Change the light to green on a long press.

```yaml
type: custom:hatch-card
light_entity: light.rest_plus
media_player_entity: media_player.rest_plus
hold_action:
  action: call-service
  service: light.turn_on
  target:
    entity_id: light # Special target 'light' refers to the card's light_entity
  data:
    color_name: green
```

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## ❤️ Support

If you find this card useful and would like to show your support, you can buy me a coffee:

<a href="https://coff.ee/eyalgal" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

		
