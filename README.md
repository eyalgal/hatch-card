# 🌙 Hatch Card for Home Assistant
[![GitHub Release][release_badge]][release]
[![Buy Me A Coffee][bmac_badge]][bmac]
<!--[![Community Forum][forum_badge]][forum] -->

<!-- Link references -->
[release_badge]: https://img.shields.io/github/v/release/eyalgal/hatch-card
[release]: https://github.com/eyalgal/hatch-card/releases
[forum_badge]: https://img.shields.io/badge/Community-Forum-5294E2.svg
<!--[forum]: https://community.home-assistant.io/t/shopping-list-card-a-simple-card-for-quick-adding-items-to-any-to-do-list/905005-->
[bmac_badge]: https://img.shields.io/badge/buy_me_a-coffee-yellow
[bmac]: https://www.buymeacoffee.com/eyalgal
A sleek, modern, and highly customizable Lovelace card to control your Hatch Rest devices in Home Assistant. This card combines light and media player controls into a single, intuitive interface.

 [](https://github.com/hacs/integration)
[](https://www.google.com/search?q=https://github.com/eyalgal/hatch-card/releases)
[](https://www.google.com/search?q=https://github.com/eyalgal/hatch-card/actions/workflows/release.yml)

> **Note**
> This card was built for and tested with the **Hatch Rest+**. It may work with other Hatch products (like the Rest, Rest Mini, or Restore) if they are supported by the underlying Hatch integration, but functionality is not guaranteed.

## ✨ Features

-   **All-in-One Control:** Manage your Hatch light and sound from a single, unified card.
-   **Two Layouts:** Choose between a compact `vertical` or a detailed `horizontal` layout to fit your dashboard.
-   **Dynamic Backgrounds:** Set the card background to reflect the light's color, visually represent the volume level, or keep it standard.
-   **Powerful Sleep Timer:** Create timers with custom presets and define actions upon expiration (e.g., turn sound off and change light to green for an "OK-to-Wake" clock).
-   **Full Action Support:** Supports standard Home Assistant `tap_action`, `hold_action`, and `double_tap_action` for endless possibilities.
-   **Highly Customizable:** Toggle visibility for volume buttons, brightness sliders, sound selectors, and timers to create your perfect interface.
-   **Custom Icons & Photos:** Use dynamic icons that change with the sound, set your own static icon, or even use a photo for a personal touch.
-   **Easy Configuration:** Fully configurable through the Lovelace visual UI editor.
-   **Haptic Feedback:** Get optional tactile feedback on mobile devices when you interact with the card.

## ✅ Requirements

  * **Home Assistant:** Version 2023.4 or newer.
  * **Hatch Integration:** This card requires the [Hatch Rest Integration](https://github.com/dahlb/ha_hatch) by `dahlb` to be installed and configured in Home Assistant.

## 🚀 Installation

### HACS (Recommended)

1.  Navigate to HACS \> Frontend.
2.  Click the three dots in the top right and select **Custom Repositories**.
3.  Add the URL to this repository and select the category **Lovelace**.
4.  Click the **+ EXPLORE & ADD REPOSITORIES** button and search for "Hatch Card".
5.  Click **Install** and then follow the on-screen instructions.
6.  Add the card to your Lovelace dashboard.

```yaml
resources:
  - url: /hacsfiles/hatch-card/hatch-card.js
    type: module
```

### Manual Installation

1.  Download the `hatch-card.js` file from the [latest release](https://www.google.com/search?q=https://github.com/eyalgal/hatch-card/releases).
2.  Upload the file to your Home Assistant `config/www` folder.
3.  Add the resource to your Lovelace configuration.

<!-- end list -->

```yaml
resources:
  - url: /local/hatch-card.js
    type: module
```

## Configuration

Add the card to your dashboard by using the visual editor or by adding the YAML configuration. The table below outlines all available options.

| Name                          | Type    | Default               | Description                                                                                                                              |
| ----------------------------- | ------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `type`                        | string  | **Required** | `custom:hatch-card`                                                                                                                      |
| `light_entity`                | string  | **Required** | The entity ID of your Hatch light.                                                                                                       |
| `media_player_entity`         | string  | **Required** | The entity ID of your Hatch media player.                                                                                                |
| `name`                        | string  | Entity Name           | A custom name for the card.                                                                                                              |
| `icon`                        | string  | `mdi:speaker`         | A custom icon to display. If not set, it will use the media player's icon or a sound-specific icon.                                      |
| `user_photo`                  | string  | `null`                | A URL to a photo to use instead of an icon.                                                                                              |
| `layout`                      | string  | `horizontal`          | The layout of the card. Can be `horizontal` or `vertical`.                                                                               |
| `background_mode`             | string  | `full`                | Card background style. `full` (color fill), `volume` (color fill based on volume), or `none`.                                            |
| `secondary_info`              | string  | `Volume {volume}%`    | Custom text to display. Use placeholders like `{volume}`, `{sound}`, and `{brightness}`. Set to `''` to hide.                              |
| `show_volume_buttons`         | boolean | `true`                | Show the volume up/down buttons.                                                                                                         |
| `show_expand_button`          | boolean | `false`               | If true, additional controls are hidden behind an expand button. If false, they are always visible.                                      |
| `show_sound_control`          | boolean | `false`               | Show the sound mode dropdown selector in the expanded view.                                                                              |
| `show_brightness_control`     | boolean | `false`               | Show the brightness slider in the expanded view.                                                                                         |
| `show_timer`                  | boolean | `false`               | Show the sleep timer presets in the expanded view.                                                                                       |
| `volume_presets`              | array   | `null`                | An array of volume presets (0-1) to show as buttons in the expanded view. Example: `[0.25, 0.5, 0.75]`                                     |
| `volume_step`                 | number  | `0.01`                | The amount to change the volume with each button press (1% = 0.01).                                                                      |
| `animation_duration`          | number  | `250`                 | Duration of animations in milliseconds. Set to `0` to disable.                                                                           |
| `haptic`                      | boolean | `true`                | Enable haptic feedback (vibration) on touch.                                                                                             |
| `volume_click_control`        | boolean | `true`                | When `background_mode` is `volume`, allows setting the volume by clicking on the card background.                                        |
| `tap_action`                  | object  | `action: toggle`      | Action to perform on a single tap.                                                                                                       |
| `hold_action`                 | object  | `action: more-info`   | Action to perform on a long press.                                                                                                       |
| `double_tap_action`           | object  | `action: none`        | Action to perform on a double tap.                                                                                                       |
| `timer_presets`               | array   | `[15, 30, 60, 120]`   | An array of timer presets in minutes.                                                                                                    |
| `timer_action_turn_off_light` | boolean | `true`                | Turn off the light when the timer expires.                                                                                               |
| `timer_action_turn_off_media` | boolean | `false`               | Turn off the media player when the timer expires.                                                                                        |
| `timer_action_light_color`    | string  | `null`                | Change light to a specific color when timer expires. E.g., `'red'` or `'255, 100, 0'`.                                                    |
| `timer_action_light_brightness`| number | `null`                | Change light to a specific brightness (1-100) when timer expires.                                                                        |
| `timer_action_sound_mode`     | string  | `null`                | Change the sound to a specific mode when timer expires.                                                                                  |
| `timer_action_volume`         | number  | `null`                | Change the volume to a specific level (0-100) when timer expires.                                                                        |

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
