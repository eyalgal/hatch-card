/*
 * Hatch Card
 *
 * A custom card to control a Hatch Rest device.
 *
 * Author: eyalgal
 * License: MIT
 * Version: 1.2.0
 * For more information, visit: https://github.com/eyalgal/hatch-card										   
 */		 
import {
    LitElement,
    html,
    css
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

const cardVersion = "1.2.0";
console.info(`%c HATCH-CARD %c v${cardVersion} `, "color: white; background: #039be5; font-weight: 700;", "color: #039be5; background: white; font-weight: 700;");																																						  

const SOUND_ICON_MAP = {
    BrownNoise: "mdi:volume-high",
    WhiteNoise: "mdi:waveform",
    Ocean: "mdi:waves",
    Thunderstorm: "mdi:weather-lightning",
    Rain: "mdi:weather-rainy",
    Water: "mdi:water",
    Wind: "mdi:weather-windy",
    Heartbeat: "mdi:heart-pulse",
    Vacuum: "mdi:robot-vacuum",
    Dryer: "mdi:tumble-dryer",
    Fan: "mdi:fan",
    ForestLake: "mdi:pine-tree",
    CalmSea: "mdi:waves",
    Crickets: "mdi:bug",
    CampfireLake: "mdi:campfire",
    Birds: "mdi:bird",
    Brahms: "mdi:music-note",
    Twinkle: "mdi:star-shooting",
    RockABye: "mdi:music-box",
    NONE: null,
};

function formatTimerDuration(minutes) {
    if (minutes < 60) {
        return `${minutes}m`;
    } else if (minutes === 60) {
        return "1h";
    } else if (minutes % 60 === 0) {
        return `${minutes / 60}h`;
    } else {
        return `${Math.floor(minutes / 60)}h${minutes % 60}m`;
    }
}

const COLOR_NAMES = {
    'red': [255, 0, 0],
    'green': [92, 210, 157],
    'blue': [0, 0, 255],
    'yellow': [255, 255, 0],
    'orange': [234, 141, 71],
    'purple': [128, 0, 128],
    'pink': [246, 98, 170],
    'white': [255, 255, 255],
    'warm white': [255, 206, 84],
    'cool white': [173, 216, 230],
    'amber': [255, 191, 0],
    'cyan': [0, 255, 255],
    'magenta': [255, 0, 255],
    'lime': [0, 255, 0],
    'maroon': [128, 0, 0],
    'navy': [0, 0, 128],
    'olive': [128, 128, 0],
    'teal': [0, 128, 128],
    'silver': [192, 192, 192],
    'gray': [128, 128, 128],
    'black': [0, 0, 0],
    'dark blue': [73, 143, 225],
    'light blue': [41, 193, 215]
};

function getColorNameFromRgb(rgbArray) {
    if (!rgbArray || !Array.isArray(rgbArray)) return '';
    
    const rgbString = rgbArray.join(',');
    for (const [name, rgb] of Object.entries(COLOR_NAMES)) {
        if (rgb.join(',') === rgbString) {
            return name;
        }
    }
    return rgbArray.join(', ');
}

function parseColorInput(input) {
    if (!input || !input.trim()) return null;
    
    const trimmed = input.trim().toLowerCase();
    
    if (COLOR_NAMES[trimmed]) {
        return COLOR_NAMES[trimmed];
    }
    
    const rgbMatch = trimmed.match(/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*$/);
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        if (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255) {
            return [r, g, b];
        }
    }
    
    return null;
}


class HatchCard extends LitElement {

    static get properties() {
        return {
            hass: {},
            _config: {},
            _timerRemaining: { type: String },
            _timerPercent: { type: Number },
            _showControls: { type: Boolean },
            _localTimerEnd: { type: Number },
            _localTimerDuration: { type: Number },
        };
    }

    constructor() {
        super();
        this._timerRemaining = '';
        this._timerPercent = 0;
        this._showControls = false;
        this._timerInterval = null;
        this._holdTimer = null;
        this._tapTimer = null;
        this._tapCount = 0;
        this._userProvidedIcon = null;
        this._localTimerEnd = null;
        this._localTimerDuration = null;
    }

    setConfig(config) {
        this._userProvidedIcon = config.icon;
        const oldResponsiveBg = config.responsive_background;

        this._config = {
            layout: "horizontal",
            icon: "mdi:speaker",
            show_volume_buttons: true,
            show_sound_control: false,
            show_brightness_control: false,
            show_brightness_when_off: false,
            show_timer: false,
            timer_entity: null,
            show_scenes: false,
            show_toddler_lock: false,
            toddler_lock_entity: null,
            show_clock_brightness: false,
            clock_brightness_entity: null,
            show_battery_indicator: false,
            show_battery_percentage: true,
            battery_level_entity: null,
            charging_status_entity: null,
            show_expand_button: false,
            background_mode: "full",
            volume_step: 0.01,
            volume_presets: null,
            haptic: true,
            animation_duration: 250,
            secondary_info: "Volume {volume}%",
            tap_action: { action: "toggle" },
            hold_action: { action: "more-info" },
            double_tap_action: { action: "none" },
            volume_click_control: true,
            timer_presets: [15, 30, 60, 120],
            timer_action_turn_off_light: true,
            timer_action_turn_off_media: false,
            timer_action_light_color: null,
            timer_action_light_brightness: null,
            timer_action_sound_mode: null,
            timer_action_volume: null,
            scenes: [],
            scenes_per_row: 4,
            controls_order: [
                'brightness',
                'clock_brightness',
                'volume_presets',
                'sound',
                'scenes',
                'timer',
                'toddler_lock'
            ],
            ...config,
        };
        
        this._config.volume_step = parseFloat(this._config.volume_step) || 0.01;
        
        if (oldResponsiveBg === false) {
            this._config.background_mode = "none";
        }
    }

    static getConfigElement() {
        if (!customElements.get("hatch-card-editor")) {
            customElements.define("hatch-card-editor", HatchCardEditor);
        }
        return document.createElement("hatch-card-editor");
    }
    
    static getStubConfig() {
        return {
            type: "custom:hatch-card",
            media_player_entity: "",
        };
    }

    connectedCallback() {
        super.connectedCallback();
        this._startTimerUpdate();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._stopTimerUpdate();
        this._clearHoldTimer();
    }

    _startTimerUpdate() {
        this._stopTimerUpdate();
        this._updateTimer();
        this._timerInterval = setInterval(() => this._updateTimer(), 1000);
    }

    _stopTimerUpdate() {
        if (this._timerInterval) {
            clearInterval(this._timerInterval);
            this._timerInterval = null;
        }
    }

    _getTimerData() {
        if (this._config.timer_entity && this.hass.states[this._config.timer_entity]) {
            try {
                const state = this.hass.states[this._config.timer_entity].state;
                if (state && state !== 'unknown' && state !== '') {
                    const data = JSON.parse(state);
                    if (data.end && data.duration) {
                        return data;
                    }
                }
            } catch (e) {
                console.error("Hatch Card: Invalid timer_entity state. Must be a JSON string.", e);
                return null;
            }
        }
        return {
            end: this._localTimerEnd,
            duration: this._localTimerDuration
        };
    }

    _updateTimer() {
        const timerData = this._getTimerData();

        if (!timerData || !timerData.end) {
            this._timerRemaining = '';
            this._timerPercent = 0;
            return;
        }

        const now = Date.now();
        const remaining = Math.max(0, timerData.end - now);

        if (remaining === 0) {
            this._timerRemaining = '';
            this._timerPercent = 0;
            if (this._config.timer_entity) {
                this.hass.callService("input_text", "set_value", {
                    entity_id: this._config.timer_entity,
                    value: ""
                });
            }
            this._executeTimerActions();
            return;
        }

        const totalDuration = timerData.duration || 60000;
        this._timerPercent = (remaining / totalDuration) * 100;

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        this._timerRemaining = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    render() {
        if (!this.hass || !this._config) return html``;
        
        if (!this._config.media_player_entity) {
            return html`
                <ha-card>
                    <div style="padding: 16px; text-align: center; color: var(--secondary-text-color);">
                        <ha-icon icon="mdi:sleep" style="width: 40px; height: 40px; margin-bottom: 8px;"></ha-icon>
                        <div style="font-weight: bold; margin-bottom: 4px;">Hatch Card</div>
                        <div>Please configure a Media Player entity.</div>
                    </div>
                </ha-card>
            `;
        }

        const mediaState = this.hass.states[this._config.media_player_entity];
        const lightState = this._config.light_entity ? this.hass.states[this._config.light_entity] : null;
        const hasLight = !!lightState;

        if (!mediaState) {
            return this._renderError("Media Player entity not found.");
        }

        const isOn = hasLight ? lightState.state === 'on' : mediaState.state === 'playing';
        const brightness = hasLight ? lightState.attributes.brightness || 0 : 0;
        const brightnessPercent = Math.round((brightness / 255) * 100);
        
        let lightColor = 'var(--state-icon-color)';
        let lightColorRgb = null;

        if (hasLight) {
            const rgbColor = lightState.attributes.rgb_color;
            const hsColor = lightState.attributes.hs_color;
            const isWhiteLight = isOn && rgbColor && ((rgbColor.join(',') === '0,0,0' && brightness > 0) || (hsColor && hsColor[1] === 0));

            if (isOn) {
                if (isWhiteLight) {
                    const warmWhite = [255, 206, 84];
                    lightColor = `rgb(${warmWhite.join(',')})`;
                    lightColorRgb = warmWhite.join(',');
                } else if (rgbColor) {
                    lightColor = `rgb(${rgbColor.join(',')})`;
                    lightColorRgb = rgbColor.join(',');
                }
            }
        } else if (isOn) {
            lightColor = 'var(--primary-color)';
        }
        
        const volumeLevel = mediaState.attributes.volume_level || 0;
        const volumePercent = Math.round(volumeLevel * 100);
        const soundMode = mediaState.attributes.sound_mode || 'None';
        
        const name = this._config.name || (hasLight ? lightState.attributes.friendly_name : mediaState.attributes.friendly_name);
        
        const activeIcon = this._userProvidedIcon || SOUND_ICON_MAP[soundMode] || mediaState.attributes.icon || this._config.icon;

        const cardStyle = this._getCardBackgroundStyle(lightColorRgb, volumePercent, hasLight);

        let secondaryInfo = '';
        if (this._config.secondary_info && this._config.secondary_info.trim() !== '') {
            secondaryInfo = this._config.secondary_info
                .replace('{volume}', volumePercent)
                .replace('{sound}', soundMode);
            if (hasLight) {
                secondaryInfo = secondaryInfo.replace('{brightness}', brightnessPercent);
            }
        }

        if (this._timerRemaining && secondaryInfo) {
            secondaryInfo = `${secondaryInfo} • ${this._timerRemaining}`;
        } else if (this._timerRemaining) {
            secondaryInfo = this._timerRemaining;
        }

        const layoutClass = this._config.layout === 'horizontal' ? 'horizontal-layout' : 'vertical-layout';
        const expandedClass = this._showControls ? 'expanded' : '';

        const hasExpandableControls = (this._config.controls_order || []).some(key => {
            switch (key) {
                case 'brightness': return hasLight && this._config.show_brightness_control;
                case 'clock_brightness': return hasLight && this._config.show_clock_brightness;
                case 'volume_presets': return this._config.volume_presets && this._config.volume_presets.length > 0;
                case 'sound': return this._config.show_sound_control;
                case 'scenes': return this._config.show_scenes;
                case 'timer': return this._config.show_timer;
                case 'toddler_lock': return this._config.show_toddler_lock;
                default: return false;
            }
        });

        const showExpandButton = this._config.show_expand_button && hasExpandableControls;
        const showExpandedControls = showExpandButton ? this._showControls : hasExpandableControls;
        const verticalExpandedClass = (this._config.layout === 'vertical' && showExpandButton) ? 'has-expand-button' : '';

        return html`
            <ha-card 
                style="${cardStyle}" 
                class="${layoutClass} ${expandedClass} ${verticalExpandedClass}"
                @click="${this._handleCardClick}"
            >
                ${this._config.layout === 'horizontal' 
                    ? this._renderHorizontalLayout(isOn, lightColor, secondaryInfo, activeIcon, volumePercent, name, showExpandButton)
                    : this._renderVerticalLayout(isOn, lightColor, secondaryInfo, activeIcon, volumePercent, name, showExpandButton)
                }
                ${showExpandedControls ? this._renderExpandedControls(isOn, lightColor, brightness, volumeLevel, mediaState, hasLight) : ''}
            </ha-card>
        `;
    }

    _renderHorizontalLayout(isOn, lightColor, secondaryInfo, activeIcon, volumePercent, name, showExpandButton) {
        return html`
            <div class="content-wrapper">
                <div class="header" 
                    @mousedown="${this._handleMouseDown}"
                    @mouseup="${this._handleMouseUp}"
                    @touchstart="${this._handleTouchStart}"
                    @touchend="${this._handleTouchEnd}"
                    @touchcancel="${this._handleTouchCancel}"
                >
                    <div class="icon-container">
                        ${this._renderIconOrPhoto(isOn, lightColor, activeIcon)}
                    </div>
                    <div class="info">
                        <div class="name">${name}</div>
                        ${secondaryInfo ? html`<div class="secondary-info">${secondaryInfo}</div>` : ''}
                    </div>
                </div>
                <div class="actions">
                    ${this._config.show_battery_indicator ? this._renderBatteryIndicator() : ''}
                    ${this._config.show_volume_buttons ? html`
                        ${this._renderVolumeButton(-Math.abs(this._config.volume_step), 'mdi:volume-minus', lightColor)}
                        <div class="volume-percent">${volumePercent}%</div>
                        ${this._renderVolumeButton(Math.abs(this._config.volume_step), 'mdi:volume-plus', lightColor)}
                    ` : ''}
                    ${showExpandButton ? html`
                        <div class="expand-button" @click="${this._toggleControls}">
                            <ha-icon icon="${this._showControls ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    _renderVerticalLayout(isOn, lightColor, secondaryInfo, activeIcon, volumePercent, name, showExpandButton) {
        return html`
            <div class="content-wrapper vertical">
                <div class="vertical-top-block">
                    <div class="vertical-icon-container">
                        ${this._config.show_volume_buttons ? this._renderVolumeButton(-Math.abs(this._config.volume_step), 'mdi:volume-minus', lightColor) : ''}
                        <div class="icon-container" 
                            @mousedown="${this._handleMouseDown}"
                            @mouseup="${this._handleMouseUp}"
                            @touchstart="${this._handleTouchStart}"
                            @touchend="${this._handleTouchEnd}"
                            @touchcancel="${this._handleTouchCancel}"
                        >
                            ${this._renderIconOrPhoto(isOn, lightColor, activeIcon, true)}
                        </div>
                        ${this._config.show_volume_buttons ? this._renderVolumeButton(Math.abs(this._config.volume_step), 'mdi:volume-plus', lightColor) : ''}
                    </div>
                </div>
                <div class="info vertical">
                    <div class="name">${name}</div>
                    ${secondaryInfo ? html`<div class="secondary-info">${secondaryInfo}</div>` : ''}
                </div>
                ${this._config.show_battery_indicator ? this._renderBatteryIndicator(true) : ''}
                ${showExpandButton ? html`
                    <div class="expand-button vertical" @click="${this._toggleControls}">
                        <ha-icon icon="${this._showControls ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    _renderExpandedControls(isOn, lightColor, brightness, volumeLevel, mediaState, hasLight) {
        const showAlways = !this._config.show_expand_button;

        const controlsMap = {
            brightness: {
                is_visible: () => hasLight && this._config.show_brightness_control && (isOn || this._config.show_brightness_when_off),
                render: () => this._renderBrightnessControl(isOn, lightColor, brightness),
            },
            clock_brightness: {
                is_visible: () => hasLight && this._config.show_clock_brightness && this._config.clock_brightness_entity,
                render: () => this._renderClockBrightnessControl(),
            },
            volume_presets: {
                is_visible: () => this._config.volume_presets && this._config.volume_presets.length > 0,
                render: () => this._renderVolumePresetsControl(volumeLevel, lightColor),
            },
            sound: {
                is_visible: () => this._config.show_sound_control,
                render: () => this._renderSoundControl(mediaState),
            },
            scenes: {
                is_visible: () => this._config.show_scenes && this._config.scenes && this._config.scenes.length > 0,
                render: () => this._renderScenesControl(lightColor, hasLight),
            },
            timer: {
                is_visible: () => this._config.show_timer,
                render: () => this._renderTimerControl(lightColor),
            },
            toddler_lock: {
                is_visible: () => this._config.show_toddler_lock && this._config.toddler_lock_entity,
                render: () => this._renderToddlerLockControl(),
            },
        };

        const orderedControls = (this._config.controls_order || [])
            .map(key => controlsMap[key])
            .filter(control => control && control.is_visible())
            .map(control => control.render());
        
        if (orderedControls.length === 0) {
            return html``;
        }

        return html`
            <div class="expanded-controls ${showAlways ? 'always-visible' : ''}">
                ${orderedControls}
            </div>
        `;
    }
    
    _getCardBackgroundStyle(rgb, volumePercent, hasLight) {
        const defaultBg = 'var(--ha-card-background, var(--card-background-color, #FFF))';
        if (!hasLight || !rgb || this._config.background_mode === 'none') {
            return `background: ${defaultBg};`;
        }
        
        const color = `rgba(${rgb}, 0.1)`;

        switch (this._config.background_mode) {
            case 'full':
                return `background: ${color};`;
            case 'volume':
                return `background: linear-gradient(to right, ${color} ${volumePercent}%, ${defaultBg} ${volumePercent}%);`;
            default:
                return `background: ${defaultBg};`;
        }
    }

    _renderIconOrPhoto(isOn, lightColorStyle, activeIcon, isVertical = false) {
        if (this._config.user_photo) {
            return html`<img class="user-photo ${isVertical ? 'vertical' : ''}" src="${this._config.user_photo}" alt="${this._config.name || 'User'}" />`;
        }

        const shapeStyle = `background-color: ${isOn ? lightColorStyle.replace('rgb', 'rgba').replace(')', ', 0.2)') : 'rgba(var(--rgb-primary-text-color), 0.05)'};`;
        const iconStyle = `color: ${isOn ? lightColorStyle : 'var(--primary-text-color, var(--paper-item-icon-color))'};`;

        const size = isVertical ? 48 : 42;
        const strokeWidth = 3;
        const svgSize = size + strokeWidth * 2;
        const center = svgSize / 2;
        const radius = (size / 2) + (strokeWidth / 2); 
        const circumference = radius * 2 * Math.PI;
        const strokeDashoffset = circumference - (this._timerPercent / 100) * circumference;

        const timerRing = this._timerPercent > 0 ? html`
            <svg 
                style="
                    position: absolute; 
                    top: -${strokeWidth}px; 
                    left: -${strokeWidth}px; 
                    width: ${svgSize}px; 
                    height: ${svgSize}px; 
                    transform: rotate(-90deg); 
                    pointer-events: none;
                "
            >
                <circle
                    stroke="rgba(var(--rgb-primary-text-color), 0.1)"
                    fill="transparent"
                    stroke-width="${strokeWidth}"
                    r="${radius}"
                    cx="${center}"
                    cy="${center}"
                />
                <circle
                    stroke="${lightColorStyle}"
                    fill="transparent"
                    stroke-width="${strokeWidth}"
                    stroke-dasharray="${circumference} ${circumference}"
                    style="stroke-dashoffset: ${strokeDashoffset}; transition: stroke-dashoffset 0.25s;"
                    r="${radius}"
                    cx="${center}"
                    cy="${center}"
                />
            </svg>
        ` : '';

        return html`
            <div class="shape ${isVertical ? 'vertical' : ''}" style="${shapeStyle}; position: relative;">
                ${timerRing}
                <ha-icon .icon="${activeIcon}" style="${iconStyle}"></ha-icon>
            </div>
        `;
    }

    _renderVolumeButton(change, icon, lightColorStyle) {
        const mediaState = this.hass.states[this._config.media_player_entity];
        const lightState = this._config.light_entity ? this.hass.states[this._config.light_entity] : null;
        const isOn = lightState ? lightState.state === 'on' : mediaState.state === 'playing';
        
        const buttonStyle = isOn ? 
            `background-color: ${lightColorStyle.replace('rgb', 'rgba').replace(')', ', 0.2)')}; color: ${lightColorStyle};` :
            `background-color: rgba(var(--rgb-primary-text-color), 0.05); color: var(--primary-text-color);`;
            
        return html`
            <div 
                class="volume-button" 
                style="${buttonStyle}" 
                @click="${(e) => { e.stopPropagation(); this._handleVolumeChange(change); }}"
                role="button"
                tabindex="0"
                aria-label="${change > 0 ? 'Increase' : 'Decrease'} volume"
            >
                <ha-icon .icon="${icon}"></ha-icon>
            </div>
        `;
    }

    _renderSoundSelect(mediaState) {
        const soundListFromAttr = mediaState.attributes.sound_mode_list;
        if (!soundListFromAttr || !Array.isArray(soundListFromAttr)) {
            return this._renderWarning("'sound_mode_list' attribute not available.");
        }
        const selectedOption = mediaState.attributes.sound_mode || 'NONE';

        const fullSoundList = [...soundListFromAttr];
        if (selectedOption && !fullSoundList.includes(selectedOption)) {
            fullSoundList.unshift(selectedOption);
        }

        return html`
            <ha-select
                label="Sound"
                .value="${selectedOption}"
                @selected="${this._handleSoundChange}"
                style="flex: 1;"
            >
                ${fullSoundList.map(option => html`<mwc-list-item .value="${option}">${option === 'NONE' ? 'No Sound' : option}</mwc-list-item>`)}
            </ha-select>
        `;
    }
    
    _renderBrightnessControl(isOn, lightColor, brightness) {
        return html`
            <div class="control-row">
                <ha-icon icon="mdi:brightness-6"></ha-icon>
                <div class="slider-container">
                    <div class="slider-track">
                        <div 
                            class="slider-fill" 
                            style="width: ${(brightness / 255) * 100}%; background-color: ${lightColor};"
                        ></div>
                    </div>
                    <input 
                        type="range" 
                        class="slider-input"
                        min="1" 
                        max="255" 
                        .value="${brightness}"
                        @input="${this._handleBrightnessChange}"
                    />
                </div>
                <span class="control-value">${Math.round((brightness / 255) * 100)}%</span>
            </div>
        `;
    }

    _renderClockBrightnessControl() {
        const clockEntity = this.hass.states[this._config.clock_brightness_entity];
        if (!clockEntity) {
            return this._renderWarning(`Entity not found: ${this._config.clock_brightness_entity}`);
        }
        const brightness = clockEntity.attributes.brightness || 0;
        const max = 255;
        const warmWhite = COLOR_NAMES['warm white'].join(',');

        return html`
            <div class="control-row">
                <ha-icon icon="mdi:clock-digital"></ha-icon>
                <div class="slider-container">
                    <div class="slider-track">
                        <div 
                            class="slider-fill" 
                            style="width: ${(brightness / max) * 100}%; background-color: rgb(${warmWhite});"
                        ></div>
                    </div>
                    <input 
                        type="range" 
                        class="slider-input"
                        min="1" 
                        max="${max}" 
                        .value="${brightness}"
                        @input="${this._handleClockBrightnessChange}"
                    />
                </div>
                <span class="control-value">${Math.round((brightness / max) * 100)}%</span>
            </div>
        `;
    }

    _renderVolumePresetsControl(volumeLevel, lightColor) {
        return html`
            <div class="control-row presets">
                <ha-icon icon="mdi:volume-high"></ha-icon>
                <div class="preset-buttons">
                    ${this._config.volume_presets.map(preset => html`
                        <button 
                            class="preset-button ${Math.abs(volumeLevel - preset) < 0.01 ? 'active' : ''}"
                            @click="${() => this._setVolume(preset)}"
                            style="--button-color: ${lightColor}"
                        >
                            ${Math.round(preset * 100)}%
                        </button>
                    `)}
                </div>
            </div>
        `;
    }

    _renderSoundControl(mediaState) {
        return html`
            <div class="control-row">
                <ha-icon icon="mdi:music-note"></ha-icon>
                ${this._renderSoundSelect(mediaState)}
            </div>
        `;
    }

    _renderTimerControl(lightColor) {
        const hasActiveTimer = !!this._timerRemaining;
        return html`
            <div class="control-row">
                <ha-icon icon="mdi:timer-outline"></ha-icon>
                <div class="timer-buttons">
                    ${this._getTimerPresets().map(preset => html`
                        <button 
                            class="timer-button"
                            @click="${() => this._setTimer(preset.value)}"
                            style="--button-color: ${lightColor}"
                        >
                            ${preset.label}
                        </button>
                    `)}
                    ${hasActiveTimer ? html`
                        <button 
                            class="timer-button cancel"
                            @click="${() => this._cancelTimer()}"
                        >
                            Cancel
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    _renderScenesControl(lightColor, hasLight) {
        return html`
            <div class="control-row scenes">
                ${this._config.layout === 'horizontal' ? html`
                    <ha-icon icon="mdi:palette"></ha-icon>
                ` : ''}
                <div class="scene-buttons ${this._config.layout === 'vertical' ? 'vertical' : ''}" 
                    style="--scenes-per-row: ${this._config.scenes_per_row || 4}">
                    ${this._config.scenes.map(scene => {
                        const sceneColor = hasLight && scene.color 
                            ? (Array.isArray(scene.color) ? `rgb(${scene.color.join(',')})` : scene.color) 
                            : lightColor;
                        return html`
                            <button 
                                class="scene-button"
                                @click="${() => this._activateScene(scene, hasLight)}"
                                aria-label="${scene.name || 'Scene'}"
                                style="--scene-color: ${sceneColor}"
                            >
                                <ha-icon icon="${scene.icon || 'mdi:palette'}"></ha-icon>
                                <span>${scene.name || 'Scene'}</span>
                            </button>
                        `;
                    })}
                </div>
            </div>
        `;
    }

    _renderToddlerLockControl() {
        const lockEntity = this.hass.states[this._config.toddler_lock_entity];
        if (!lockEntity) {
            return this._renderWarning(`Entity not found: ${this._config.toddler_lock_entity}`);
        }
        const isLocked = lockEntity.state === 'on';

        return html`
            <div class="control-row toggle-control">
                <div class="toggle-label">
                    <ha-icon icon="mdi:human-child"></ha-icon>
                    <span>Toddler Lock</span>
                </div>
                <div class="toggle-switch ${isLocked ? 'locked' : ''}" @click=${this._toggleToddlerLock} role="switch" aria-checked="${isLocked}" tabindex="0">
                    <div class="toggle-thumb">
                        <ha-icon icon="${isLocked ? 'mdi:lock' : 'mdi:lock-open-variant'}"></ha-icon>
                    </div>
                </div>
            </div>
        `;
    }

    _renderBatteryIndicator(isVertical = false) {
        const batteryEntity = this.hass.states[this._config.battery_level_entity];
        const chargingEntity = this.hass.states[this._config.charging_status_entity];

        if (!batteryEntity) return '';

        const level = parseInt(batteryEntity.state, 10);
        if (isNaN(level)) return '';

        let isCharging = false;
        if (chargingEntity) {
            isCharging = chargingEntity.state !== 'Not Charging' && chargingEntity.state !== 'off';
        }
        
        const lowBattery = level < 10;
        const color = lowBattery && !isCharging ? 'var(--error-color)' : 'var(--secondary-text-color)';

        let icon;
        if (isCharging) {
            if (level >= 95) {
                icon = 'mdi:battery-charging-100';
            } else {
                const roundedLevel = Math.round(level / 10) * 10;
                icon = `mdi:battery-charging-${roundedLevel}`;
            }
        } else {
            if (level <= 5) {
                icon = 'mdi:battery-outline';
            } else if (level <= 15) {
                icon = 'mdi:battery-alert-variant-outline';
            } else {
                const roundedLevel = Math.round(level / 10) * 10;
                icon = `mdi:battery-${roundedLevel}`;
            }
        }
        
        const style = isVertical ? 'position: absolute; top: 12px; right: 12px;' : '';

        return html`
            <div class="battery-indicator" style="${style}; color: ${color};">
                ${this._config.show_battery_percentage ? html`
                    <span class="battery-percent">${level}%</span>
                ` : ''}
                <ha-icon .icon="${icon}"></ha-icon>
            </div>
        `;
    }

    _renderError(message) {
        return html`<ha-card><div class="error-msg">${message}</div></ha-card>`;
    }

    _renderWarning(message) {
        return html`<div class="warning-msg">${message}</div>`;
    }

    _handleAction(action) {
        if (!action || action.action === 'none') return;
        
        this._vibrate();
        
        switch (action.action) {
            case 'toggle': this._toggleDevice(); break;
            case 'more-info': this._showMoreInfo(); break;
            case 'call-service': this._callService(action); break;
            case 'navigate':
                if (action.navigation_path) {
                    history.pushState(null, "", action.navigation_path);
                    const event = new Event("location-changed", { bubbles: true, composed: true });
                    window.dispatchEvent(event);
                }
                break;
            case 'url':
                if (action.url_path) {
                    window.open(action.url_path, action.new_tab !== false ? '_blank' : '_self');
                }
                break;
        }
    }

    _callService(action) {
        const [domain, service] = action.service.split('.');
        let serviceData = {};
        
        if (action.service_data) serviceData = { ...action.service_data };
        if (action.data) serviceData = { ...serviceData, ...action.data };
        
        if (action.target) {
            if (action.target.entity_id) {
                if (action.target.entity_id === 'light' && this._config.light_entity) serviceData.entity_id = this._config.light_entity;
                else if (action.target.entity_id === 'media_player') serviceData.entity_id = this._config.media_player_entity;
                else serviceData.entity_id = action.target.entity_id;
            }
        } else if (serviceData.entity_id) {
            if (serviceData.entity_id === 'light' && this._config.light_entity) serviceData.entity_id = this._config.light_entity;
            else if (serviceData.entity_id === 'media_player') serviceData.entity_id = this._config.media_player_entity;
        }
        
        this.hass.callService(domain, service, serviceData);
    }

    _handleMouseDown(e) { this._handleStart(e); }
    _handleMouseUp(e) { this._handleEnd(e); }
    _handleTouchStart(e) { this._handleStart(e); }
    _handleTouchEnd(e) { this._handleEnd(e); }
    _handleTouchCancel(e) { this._clearHoldTimer(); }

    _handleStart(e) {
        this._clearHoldTimer();
        this._holdTimer = setTimeout(() => {
            this._handleAction(this._config.hold_action);
        }, 500);
    }

    _handleEnd(e) {
        e.stopPropagation();
        this._clearHoldTimer();
        
        if (this._holdTimer) {
            this._tapCount++;
            
            if (this._tapCount === 1) {
                this._tapTimer = setTimeout(() => {
                    this._handleAction(this._config.tap_action);
                    this._tapCount = 0;
                }, 250);
            } else if (this._tapCount === 2) {
                clearTimeout(this._tapTimer);
                this._handleAction(this._config.double_tap_action);
                this._tapCount = 0;
            }
        }
    }

    _clearHoldTimer() {
        if (this._holdTimer) {
            clearTimeout(this._holdTimer);
            this._holdTimer = null;
        }
    }

    _toggleDevice(e) {
        if (e) e.stopPropagation();
        if (this._config.light_entity) {
            this.hass.callService("light", "toggle", {
                entity_id: this._config.light_entity,
            });
        } else {
            this.hass.callService("media_player", "media_play_pause", {
                entity_id: this._config.media_player_entity,
            });
        }
    }

    _showMoreInfo() {
        const entityId = this._config.light_entity || this._config.media_player_entity;
        const event = new Event("hass-more-info", {
            bubbles: true,
            composed: true,
        });
        event.detail = { entityId };
        this.dispatchEvent(event);
    }

    _toggleControls(e) {
        e.stopPropagation();
        this._vibrate();
        this._showControls = !this._showControls;
    }

    _handleVolumeChange(change) {
        const currentVolume = this.hass.states[this._config.media_player_entity].attributes.volume_level || 0;
        const volumeChange = parseFloat(change) || 0;
        const newVolume = parseFloat((currentVolume + volumeChange).toFixed(2));
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        this._setVolume(clampedVolume);
    }

    _handleBrightnessChange(e) {
        const brightness = parseInt(e.target.value);
        this._vibrate();
        this.hass.callService("light", "turn_on", {
            entity_id: this._config.light_entity,
            brightness: brightness,
        });
    }
    
    _handleCardClick(e) {
        if (this._config.background_mode !== 'volume' || !this._config.volume_click_control) return;
        if (e.target.closest('.volume-button, .icon-container, .header, .expand-button, .expanded-controls')) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const position = (e.clientX - rect.left) / rect.width;
        const newVolume = Math.max(0, Math.min(1, position));
        this._setVolume(newVolume);
    }

    _setVolume(volume) {
        this._vibrate();
        const volumeFloat = parseFloat(Math.max(0, Math.min(1, volume)).toFixed(2));
        this.hass.callService("media_player", "volume_set", {
            entity_id: this._config.media_player_entity,
            volume_level: volumeFloat,
        });
    }

    _handleSoundChange(e) {
        const newSound = e.target.value;
        const mediaState = this.hass.states[this._config.media_player_entity];
        if (newSound && newSound !== mediaState.attributes.sound_mode) {
            this._vibrate();
            this.hass.callService("media_player", "select_sound_mode", {
                entity_id: this._config.media_player_entity,
                sound_mode: newSound,
            });
        }
    }

    _toggleToddlerLock() {
        this._vibrate();
        this.hass.callService("switch", "toggle", {
            entity_id: this._config.toddler_lock_entity,
        });
    }

    _handleClockBrightnessChange(e) {
        const brightness = parseInt(e.target.value);
        this._vibrate();
        this.hass.callService("light", "turn_on", {
            entity_id: this._config.clock_brightness_entity,
            brightness: brightness,
        });
    }

    _setTimer(minutes) {
        this._vibrate();
        const durationInMillis = minutes * 60000;
        const endTime = Date.now() + durationInMillis;

        if (this._config.timer_entity) {
            const timerData = JSON.stringify({ end: endTime, duration: durationInMillis });
            this.hass.callService("input_text", "set_value", {
                entity_id: this._config.timer_entity,
                value: timerData
            });
        } else {
            this._localTimerEnd = endTime;
            this._localTimerDuration = durationInMillis;
        }
        
        if (this.hass.services.hatch?.set_timer) {
            this.hass.callService("hatch", "set_timer", {
                entity_id: this._config.media_player_entity,
                duration: minutes,
            });
        }
    }

    _cancelTimer() {
        this._vibrate();
        if (this._config.timer_entity) {
            this.hass.callService("input_text", "set_value", {
                entity_id: this._config.timer_entity,
                value: ""
            });
        } else {
            this._localTimerEnd = null;
            this._localTimerDuration = null;
        }
        
        if (this.hass.services.hatch?.cancel_timer) {
            this.hass.callService("hatch", "cancel_timer", {
                entity_id: this._config.media_player_entity,
            });
        }
    }

    _getTimerPresets() {
        const presets = this._config.timer_presets || [15, 30, 60, 120];
        return presets.map(minutes => ({ label: formatTimerDuration(minutes), value: minutes }));
    }

    _activateScene(scene, hasLight) {
        this._vibrate();
        if (scene.entity_id) {
            this.hass.callService("scene", "turn_on", { entity_id: scene.entity_id });
            return;
        }

        if (hasLight) {
            if (scene.turn_off_light) {
                this.hass.callService("light", "turn_off", { entity_id: this._config.light_entity });
            } else {
                const lightData = {};
                let hasLightChanges = false;
                if (scene.brightness !== undefined && scene.brightness !== null) {
                    lightData.brightness_pct = parseInt(scene.brightness);
                    hasLightChanges = true;
                }
                if (scene.color && Array.isArray(scene.color)) {
                    lightData.rgb_color = scene.color;
                    hasLightChanges = true;
                }
                if (hasLightChanges) {
                    this.hass.callService("light", "turn_on", { entity_id: this._config.light_entity, ...lightData });
                }
            }
        }

        if (scene.turn_off_media) {
            this.hass.callService("media_player", "media_stop", { entity_id: this._config.media_player_entity });
            this.hass.callService("media_player", "volume_set", { entity_id: this._config.media_player_entity, volume_level: 0 });
        } else {
            if (scene.sound_mode) {
                this.hass.callService("media_player", "select_sound_mode", { entity_id: this._config.media_player_entity, sound_mode: scene.sound_mode });
            }
            if (scene.volume !== undefined && scene.volume !== null) {
                const volume = parseFloat(scene.volume) / 100;
                this.hass.callService("media_player", "volume_set", { entity_id: this._config.media_player_entity, volume_level: Math.max(0, Math.min(1, volume)) });
            }
        }
    }
                    
    _executeTimerActions() {
        if (!this.hass) return;

        const hasLight = !!this._config.light_entity;
        const willStopMedia = this._config.timer_action_turn_off_media;
        const hasLightChanges = this._config.timer_action_light_color || this._config.timer_action_light_brightness !== null;

        if (hasLight && this._config.timer_action_turn_off_light) {
            this.hass.callService("light", "turn_off", { entity_id: this._config.light_entity });
        } 

        if (willStopMedia) {
            this.hass.callService("media_player", "media_stop", { entity_id: this._config.media_player_entity });
            this.hass.callService("media_player", "volume_set", { entity_id: this._config.media_player_entity, volume_level: 0 });
        } else if (this._config.timer_action_sound_mode) {
            this.hass.callService("media_player", "select_sound_mode", { entity_id: this._config.media_player_entity, sound_mode: this._config.timer_action_sound_mode });
        }

        if (!willStopMedia && this._config.timer_action_volume !== null) {
            const volume = parseFloat(this._config.timer_action_volume) / 100;
            this.hass.callService("media_player", "volume_set", { entity_id: this._config.media_player_entity, volume_level: Math.max(0, Math.min(1, volume)) });
        }

        if (hasLight && !this._config.timer_action_turn_off_light && hasLightChanges) {
            const executeLight = () => {
                const lightData = {};
                let hasChanges = false;
                if (this._config.timer_action_light_brightness !== null) {
                    lightData.brightness_pct = parseInt(this._config.timer_action_light_brightness);
                    hasChanges = true;
                }
                if (this._config.timer_action_light_color && Array.isArray(this._config.timer_action_light_color)) {
                    lightData.rgb_color = this._config.timer_action_light_color;
                    hasChanges = true;
                }
                if (hasChanges) {
                    this.hass.callService("light", "turn_on", { entity_id: this._config.light_entity, ...lightData });
                }
            };
            if (willStopMedia) setTimeout(executeLight, 1000);
            else executeLight();
        }
    }

    _vibrate() {
        if (this._config.haptic && navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    static get styles() {
        return css`
            :host {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            ha-card {
                position: relative;
                transition: all var(--animation-duration, 250ms) ease-in-out;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                height: 100%;
                box-sizing: border-box;
                overflow: hidden;
                cursor: pointer;
            }
            .horizontal-layout { padding: 12px; }
            .horizontal-layout.expanded { height: auto; }
            .content-wrapper {
                position: relative;
                z-index: 1;
                display: flex;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                gap: 12px;
            }
            .header {
                display: flex;
                align-items: center;
                gap: 12px;
                flex-grow: 1;
                cursor: pointer;
                -webkit-tap-highlight-color: transparent;
            }
            .actions {
                display: flex;
                align-items: center;
                gap: 4px;
                flex-shrink: 0;
            }
            .vertical-layout {
                height: 120px;
                padding: 0;
                position: relative;
            }
            .vertical-layout.expanded { height: auto; }
            .vertical-layout.has-expand-button { min-height: 160px; }
            .vertical-layout:has(.expanded-controls.always-visible) { height: auto; }
            .content-wrapper.vertical {
                height: 100%;
                position: relative;
                display: block;
                min-height: 120px;
            }
            .vertical-layout.has-expand-button .content-wrapper.vertical { min-height: 160px; }
            .vertical-top-block {
                position: absolute;
                top: 18px;
                left: 16px;
                right: 16px;
                display: flex;
                justify-content: center;
            }
            .vertical-icon-container {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            .info.vertical {
                position: absolute;
                bottom: 12px;
                left: 16px;
                right: 16px;
                height: 40px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                text-align: center;
            }
            .vertical-layout.has-expand-button .info.vertical { bottom: 52px; }
            .expand-button.vertical {
                position: absolute;
                bottom: 8px;
                left: 50%;
                transform: translateX(-50%);
                margin-left: 0;
            }
            .icon-container {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 42px;
                width: 42px;
                flex-shrink: 0;
                cursor: pointer;
                -webkit-tap-highlight-color: transparent;
            }
            .vertical-layout .icon-container { width: 48px; height: 48px; }
            .shape {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 42px;
                width: 42px;
                border-radius: 50%;
                transition: background-color var(--animation-duration, 250ms);
            }
            .shape.vertical { width: 48px; height: 48px; }
            .shape.vertical ha-icon { --mdc-icon-size: 28px; }
            .shape ha-icon { transition: color var(--animation-duration, 250ms); }
            .user-photo {
                height: 42px;
                width: 42px;
                border-radius: 50%;
                object-fit: cover;
            }
            .user-photo.vertical {
                width: auto;
                height: auto;
                max-height: 48px;
                object-fit: contain;
                border-radius: 4px;
            }
            .info { overflow: hidden; flex-grow: 1; }
            .name {
                font-size: 14px;
                font-weight: 500;
                line-height: 20px;
                color: var(--primary-text-color);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .secondary-info {
                font-size: 12px;
                font-weight: 400;
                line-height: 16px;
                color: var(--secondary-text-color);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .volume-button {
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all var(--animation-duration, 250ms);
                width: 24px;
                height: 24px;
                border-radius: 5px;
            }
            .volume-button:hover { transform: scale(1.1); }
            .volume-button ha-icon { --mdc-icon-size: 20px; }
            .volume-percent {
                font-size: 14px;
                font-weight: 500;
                min-width: 32px;
                text-align: center;
                color: var(--secondary-text-color);
            }
            .volume-button:active { transform: scale(0.95); opacity: 0.8; }
            .expand-button {
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                width: 24px;
                height: 24px;
                border-radius: 5px;
                margin-left: 8px;
                color: var(--secondary-text-color);
                transition: transform var(--animation-duration, 250ms);
            }
            .expand-button:hover { color: var(--primary-text-color); }
            .expanded-controls {
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid var(--divider-color);
                display: flex;
                flex-direction: column;
                gap: 12px;
                animation: slideDown var(--animation-duration, 250ms) ease-out;
                position: relative;
                z-index: 1;
            }
            .vertical-layout .expanded-controls {
                margin: 16px;
                margin-top: 16px;
                position: relative;
                z-index: 1;
            }
            .expanded-controls.always-visible {
                animation: none;
                border-top: none;
                margin-top: 12px;
                padding-top: 0;
            }
            .vertical-layout .expanded-controls.always-visible {
                margin: 12px;
                margin-top: 12px;
                position: relative;
                z-index: 1;
            }
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .control-row {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .control-row ha-icon {
                color: var(--secondary-text-color);
                width: 24px;
                flex-shrink: 0;
            }
            .control-value {
                font-size: 0.875rem;
                color: var(--secondary-text-color);
                min-width: 40px;
                text-align: right;
            }
            .slider-container {
                position: relative;
                flex: 1;
                height: 42px;
                display: flex;
                align-items: center;
            }
            .slider-track {
                position: absolute;
                width: 100%;
                height: 42px;
                background-color: rgba(var(--rgb-primary-text-color), 0.05);
                border-radius: 21px;
                overflow: hidden;
            }
            .slider-fill {
                position: absolute;
                top: 0;
                left: 0;
                height: 100%;
                transition: width var(--animation-duration, 250ms) ease-out;
                background-color: var(--primary-color);
            }
            .slider-input {
                position: relative;
                width: 100%;
                height: 42px;
                -webkit-appearance: none;
                appearance: none;
                background: transparent;
                cursor: pointer;
                z-index: 1;
                margin: 0;
                outline: none;
            }
            .slider-input::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 0;
                height: 0;
            }
            .slider-input::-moz-range-thumb { width: 0; height: 0; border: 0; }
            .preset-buttons, .timer-buttons {
                display: flex;
                gap: 8px;
                flex: 1;
            }
            .preset-button, .timer-button {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid var(--divider-color);
                border-radius: 8px;
                background: transparent;
                color: var(--primary-text-color);
                font-size: 0.875rem;
                cursor: pointer;
                transition: all var(--animation-duration, 250ms);
            }
            .preset-button:hover, .timer-button:hover {
                background: var(--button-color, var(--primary-color));
                color: white;
                border-color: var(--button-color, var(--primary-color));
            }
            .preset-button.active {
                background: var(--button-color, var(--primary-color));
                color: white;
                border-color: var(--button-color, var(--primary-color));
            }
            .timer-button.cancel {
                background: var(--error-color);
                color: white;
                border-color: var(--error-color);
            }
            .error-msg, .warning-msg {
                background-color: var(--error-color, #db4437);
                color: white;
                padding: 16px;
                border-radius: var(--ha-card-border-radius, 12px);
            }
            .warning-msg { background-color: var(--warning-color, #ffa600); }
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    transition-duration: 0.01ms !important;
                }
            }
            :host { --hatch-white-light-color: rgb(255, 206, 84); }
            @media (prefers-color-scheme: dark) { :host { --hatch-white-light-color: rgb(255, 206, 84); } }
            @media (prefers-color-scheme: light) { :host { --hatch-white-light-color: rgb(255, 152, 0); } }
            .scene-buttons {
                display: grid;
                grid-template-columns: repeat(var(--scenes-per-row, 4), 1fr);
                gap: 8px;
                width: 100%;
                box-sizing: border-box;
            }
            .scene-button {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 4px;
                padding: 10px;
                background-color: rgba(var(--rgb-primary-text-color), 0.05);
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 12px;
                color: var(--primary-text-color);
                transition: all var(--animation-duration, 250ms);
                width: 100%;
                height: 100%;
                box-sizing: border-box;
            }
            .scene-button:hover { background-color: var(--scene-color, rgba(var(--rgb-primary-color), 0.1)); }
            .scene-button ha-icon { color: var(--primary-text-color); --mdc-icon-size: 24px; }
            
            .toggle-control {
                justify-content: space-between;
            }
            .toggle-label {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .toggle-label ha-icon {
                color: var(--secondary-text-color);
            }
            .toggle-label span {
                color: var(--primary-text-color);
                font-size: 1rem;
            }
            .toggle-switch {
                position: relative;
                width: 52px;
                height: 32px;
                background-color: rgba(var(--rgb-primary-text-color), 0.05);
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.2s ease-in-out;
                flex-shrink: 0;
            }
            .toggle-switch.locked {
                background-color: var(--primary-color);
            }
            .toggle-thumb {
                position: relative;
                top: 2px;
                left: 2px;
                width: 28px;
                height: 28px;
                background-color: var(--card-background-color, #FFF);
                border-radius: 6px;
                display: grid;
                place-items: center;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
                transition: transform 0.2s ease-in-out;
                color: var(--secondary-text-color);
            }
            .toggle-thumb ha-icon {
                --mdc-icon-size: 20px;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
            .toggle-switch.locked .toggle-thumb {
                transform: translateX(20px);
                color: var(--primary-color);
            }
            .battery-indicator {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 12px;
                transition: color 0.2s;
            }
            .battery-indicator ha-icon {
                --mdc-icon-size: 20px;
            }
            .battery-percent {
                font-weight: 500;
                font-size: 14px;
            }
        `;
    }
}

class HatchCardEditor extends LitElement {
	_hass;

	static get properties() {
	return {
	  hass: {},
	  _config: {},
	  _expandedSections: { type: Object },
	  _editingSceneIndex: { type: Number }
	};
	}

	set hass(hass) {
	this._hass = hass;
	this.requestUpdate();
	}

	get hass() {
	return this._hass;
	}

    constructor() {
        super();
        this._expandedSections = {
            basic: true,
            layout: false,
            controls: false,
            device_controls: false,
            advanced: false,
            timer: false,
            scenes: false
        };
        this._editingSceneIndex = null;  
    }

    setConfig(config) {
        this._config = { ...config };
    }

    _toggleSection(section) {
        this._expandedSections = {
            ...this._expandedSections,
            [section]: !this._expandedSections[section]
        };
        this.requestUpdate();
    }

    _valueChanged(e) {
        if (!this._config || !this.hass) return;

        const target = e.target;
        const newConfig = { ...this._config };
        let key = target.id || target.configValue || target.getAttribute('key');
        let value;

        if (target.tagName === 'HA-SWITCH') {
            value = target.checked;
        } else if (target.tagName === 'HA-SELECT' || target.tagName === 'HA-ENTITY-PICKER') {
            value = e.detail?.value ?? target.value;
        } else if (target.tagName === 'HA-ICON-PICKER') {
            value = e.detail?.value || '';
        } else if (key === 'volume_presets') {
            value = target.value.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v) && v >= 0 && v <= 1);
            if (value.length === 0) value = null;
        } else if (key === 'timer_presets') {
            value = target.value.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v) && v > 0);
            if (value.length === 0) value = [15, 30, 60, 120];
        } else if (key === 'timer_action_light_color') {
            value = parseColorInput(target.value);
        } else if (key.startsWith('timer_action_') && (key.endsWith('_brightness') || key.endsWith('_volume'))) {
            const numValue = parseInt(target.value);
            value = (!isNaN(numValue) && numValue >= 0 && numValue <= 100) ? numValue : null;
        } else if (key === 'scenes_per_row') {
            const numValue = parseInt(target.value);
            value = (!isNaN(numValue) && numValue >= 1 && numValue <= 8) ? numValue : 4;
        } else if (key === 'controls_order') {
            value = target.value.split(',').map(v => v.trim()).filter(v => v);
            if (value.length === 0) value = undefined;
        }
        else {
            value = target.value;
        }
        
        const defaults = {
            background_mode: 'full',
            layout: 'horizontal',
            show_volume_buttons: true,
            show_expand_button: false,
            show_brightness_when_off: false,
            haptic: true,
            volume_click_control: true,
            animation_duration: 250,
            volume_step: 0.01,
            secondary_info: 'Volume {volume}%',
            timer_presets: [15, 30, 60, 120],
            timer_action_turn_off_light: true,
            scenes_per_row: 4,
            show_toddler_lock: false,
            show_clock_brightness: false,
            show_battery_indicator: false,
            show_battery_percentage: true,
            controls_order: [
                'brightness', 'clock_brightness', 'volume_presets', 'sound', 'scenes', 'timer', 'toddler_lock'
            ],
        };
        
        if ((defaults[key] !== undefined && JSON.stringify(value) === JSON.stringify(defaults[key])) || value === null || value === '' || value === undefined) {
            delete newConfig[key];
        } else {
            newConfig[key] = value;
        }

        const event = new CustomEvent("config-changed", {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    _addScene() {
        const newConfig = { ...this._config };
        if (!newConfig.scenes) newConfig.scenes = [];
        newConfig.scenes = [...newConfig.scenes, { name: `Scene ${newConfig.scenes.length + 1}` }];
        this._editingSceneIndex = newConfig.scenes.length - 1;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: newConfig }, bubbles: true, composed: true }));
    }

    _editScene(index) { this._editingSceneIndex = index; }

    _deleteScene(index) {
        const newConfig = { ...this._config };
        newConfig.scenes = newConfig.scenes.filter((_, i) => i !== index);
        if (this._editingSceneIndex === index) this._editingSceneIndex = null;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: newConfig }, bubbles: true, composed: true }));
    }

    _updateScene(e, index, field) {
        const newConfig = { ...this._config };
        const newScenes = structuredClone(this._config.scenes || []);
        const sceneToUpdate = newScenes[index];

        let value;
        const target = e.target;

        if (target.tagName === 'HA-SWITCH') {
            value = target.checked;
        } else if (target.tagName === 'HA-SELECT') {
            value = e.detail?.value ?? target.value;
        } else if (target.tagName === 'HA-ICON-PICKER') {
            value = e.detail?.value || '';
        } else {
            value = target.value;
        }
        
        if (field === 'color') value = parseColorInput(value);
        else if (field === 'brightness' || field === 'volume') {
            const numValue = parseInt(value);
            value = (!isNaN(numValue) && numValue >= 0 && numValue <= 100) ? numValue : null;
        }

        const isMeaningful = value !== null && value !== undefined && value !== '';
        if (isMeaningful) sceneToUpdate[field] = value;
        else delete sceneToUpdate[field];

        const defaultSceneValues = { turn_off_light: false, turn_off_media: false };
        if (defaultSceneValues[field] !== undefined && sceneToUpdate[field] === defaultSceneValues[field]) {
            delete sceneToUpdate[field];
        }

        newConfig.scenes = newScenes;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: newConfig }, bubbles: true, composed: true }));
    }

    render() {
        if (!this.hass) return html`<div>Loading...</div>`;
        if (!this._config) return html`<div>No configuration</div>`;
        

        const hasLight = !!this._config.light_entity;
        const currentMediaPlayer = this._config?.media_player_entity;
        const baseSoundModes = currentMediaPlayer && this.hass.states[currentMediaPlayer] 
            ? this.hass.states[currentMediaPlayer].attributes.sound_mode_list || [] : [];
            
        const timerSoundModes = [...baseSoundModes];
        const selectedTimerSound = this._config?.timer_action_sound_mode;
        if (selectedTimerSound && !timerSoundModes.includes(selectedTimerSound)) {
            timerSoundModes.unshift(selectedTimerSound);
        }

        return html`
            <div class="card-config">
                <div class="section">
                    <div class="section-header" @click="${() => this._toggleSection('basic')}">
                        <span class="section-title">Basic Configuration</span>
                        <ha-icon icon="${this._expandedSections.basic ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
                    </div>
                    ${this._expandedSections.basic ? html`
                        <div class="section-content">
                            <ha-textfield id="name" label="Name (Optional)" .value="${this._config?.name || ''}" @input="${this._valueChanged}" placeholder="Defaults to entity name"></ha-textfield>
                            <ha-entity-picker .hass=${this._hass} .value=${this._config.media_player_entity} @value-changed=${this._valueChanged} label="Media Player Entity (Required)" .configValue=${"media_player_entity"} .includeDomains=${["media_player"]}></ha-entity-picker>
                            <ha-entity-picker .hass=${this._hass} .value=${this._config.light_entity || ''} @value-changed=${this._valueChanged} label="Light Entity (Optional)" .configValue=${"light_entity"} .includeDomains=${["light"]}></ha-entity-picker>
                            <ha-icon-picker id="icon" label="Default Icon (Optional)" .value="${this._config?.icon || ''}" @value-changed="${this._valueChanged}" .placeholder="${'mdi:speaker'}"></ha-icon-picker>
                            <ha-textfield id="user_photo" label="User Photo URL (Optional)" .value="${this._config?.user_photo || ''}" @input="${this._valueChanged}" placeholder="/local/photo.png"></ha-textfield>
                        </div>
                    ` : ''}
                </div>

                <div class="section">
                    <div class="section-header" @click="${() => this._toggleSection('layout')}">
                        <span class="section-title">Layout Options</span>
                        <ha-icon icon="${this._expandedSections.layout ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
                    </div>
                    ${this._expandedSections.layout ? html`
                        <div class="section-content">
                            <ha-select key="layout" label="Layout" .value="${this._config?.layout || 'horizontal'}" @change="${this._valueChanged}" @closed="${(e) => e.stopPropagation()}">
                                <mwc-list-item value="horizontal">Horizontal</mwc-list-item>
                                <mwc-list-item value="vertical">Vertical</mwc-list-item>
                            </ha-select>
                            ${hasLight ? html`
                                <ha-select key="background_mode" label="Background Mode" .value="${this._config?.background_mode || 'full'}" @change="${this._valueChanged}" @closed="${(e) => e.stopPropagation()}">
                                    <mwc-list-item value="none">None</mwc-list-item>
                                    <mwc-list-item value="full">Full Color</mwc-list-item>
                                    <mwc-list-item value="volume">Volume Fill</mwc-list-item>
                                </ha-select>
                            ` : ''}
                            <ha-textfield id="secondary_info" label="Secondary Info (Optional)" .value="${this._config?.secondary_info !== undefined ? this._config.secondary_info : 'Volume {volume}%'}" @input="${this._valueChanged}" placeholder="Volume {volume}%" helper-text="Supports {volume}, {sound}, {brightness}. Leave empty to hide."></ha-textfield>
                            <ha-textfield
                                id="controls_order"
                                label="Expanded Controls Order (Optional)"
                                .value="${(this._config?.controls_order || ['brightness', 'clock_brightness', 'volume_presets', 'sound', 'scenes', 'timer', 'toddler_lock']).join(', ')}"
                                @input="${this._valueChanged}"
                                helper-text="Comma-separated list of control keys."
                            ></ha-textfield>
                        </div>
                    ` : ''}
                </div>

                <div class="section">
                    <div class="section-header" @click="${() => this._toggleSection('controls')}">
                        <span class="section-title">Control Visibility</span>
                        <ha-icon icon="${this._expandedSections.controls ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
                    </div>
                    ${this._expandedSections.controls ? html`
                        <div class="section-content">
                            <div class="switches">
                                <label class="switch-wrapper"><ha-switch id="show_volume_buttons" .checked="${this._config?.show_volume_buttons !== false}" @change="${this._valueChanged}"></ha-switch><div class="switch-label"><span>Show Volume Buttons</span></div></label>
                                <label class="switch-wrapper"><ha-switch id="show_expand_button" .checked="${this._config?.show_expand_button === true}" @change="${this._valueChanged}"></ha-switch><div class="switch-label"><span>Show Expand Button</span></div></label>
                                <label class="switch-wrapper"><ha-switch id="show_sound_control" .checked="${this._config?.show_sound_control === true}" @change="${this._valueChanged}"></ha-switch><div class="switch-label"><span>Show Sound Selector</span></div></label>
                                ${hasLight ? html`
                                    <label class="switch-wrapper"><ha-switch id="show_brightness_control" .checked="${this._config?.show_brightness_control === true}" @change="${this._valueChanged}"></ha-switch><div class="switch-label"><span>Show Brightness Control</span></div></label>
                                    <label class="switch-wrapper"><ha-switch id="show_brightness_when_off" .checked="${this._config?.show_brightness_when_off === true}" @change="${this._valueChanged}" .disabled="${this._config?.show_brightness_control !== true}"></ha-switch><div class="switch-label"><span>Show Brightness When Off</span></div></label>
                                ` : ''}
                                <label class="switch-wrapper"><ha-switch id="show_timer" .checked="${this._config?.show_timer === true}" @change="${this._valueChanged}"></ha-switch><div class="switch-label"><span>Show Sleep Timer</span></div></label>
                                <label class="switch-wrapper"><ha-switch id="show_scenes" .checked="${this._config?.show_scenes === true}" @change="${this._valueChanged}"></ha-switch><div class="switch-label"><span>Show Scenes</span></div></label>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="section">
                    <div class="section-header" @click="${() => this._toggleSection('device_controls')}">
                        <span class="section-title">Device-Specific Controls</span>
                        <ha-icon icon="${this._expandedSections.device_controls ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
                    </div>
                    ${this._expandedSections.device_controls ? html`
                        <div class="section-content">
                            <label class="switch-wrapper"><ha-switch id="show_toddler_lock" .checked="${this._config?.show_toddler_lock}" @change="${this._valueChanged}"></ha-switch><div class="switch-label"><span>Show Toddler Lock</span></div></label>
                            ${this._config.show_toddler_lock ? html`<ha-entity-picker .hass=${this._hass} .value=${this._config.toddler_lock_entity} @value-changed=${this._valueChanged} label="Toddler Lock Entity" .configValue=${"toddler_lock_entity"} .includeDomains=${["switch"]}></ha-entity-picker>` : ''}

                            ${hasLight ? html`
                                <label class="switch-wrapper"><ha-switch id="show_clock_brightness" .checked="${this._config?.show_clock_brightness}" @change="${this._valueChanged}"></ha-switch><div class="switch-label"><span>Show Clock Brightness</span></div></label>
                                ${this._config.show_clock_brightness ? html`<ha-entity-picker .hass=${this._hass} .value=${this._config.clock_brightness_entity} @value-changed=${this._valueChanged} label="Clock Brightness Entity" .configValue=${"clock_brightness_entity"} .includeDomains=${["light"]}></ha-entity-picker>` : ''}
                            ` : ''}
                            
                            <label class="switch-wrapper"><ha-switch id="show_battery_indicator" .checked="${this._config?.show_battery_indicator}" @change="${this._valueChanged}"></ha-switch><div class="switch-label"><span>Show Battery Indicator</span></div></label>
                            ${this._config.show_battery_indicator ? html`
                                <ha-entity-picker .hass=${this._hass} .value=${this._config.battery_level_entity} @value-changed=${this._valueChanged} label="Battery Level Entity" .configValue=${"battery_level_entity"} .includeDomains=${["sensor"]}></ha-entity-picker>
                                <ha-entity-picker .hass=${this._hass} .value=${this._config.charging_status_entity} @value-changed=${this._valueChanged} label="Charging Status Entity" .configValue=${"charging_status_entity"} .includeDomains=${["binary_sensor", "sensor"]}></ha-entity-picker>
                                <label class="switch-wrapper">
                                    <ha-switch id="show_battery_percentage" .checked="${this._config?.show_battery_percentage !== false}" @change="${this._valueChanged}"></ha-switch>
                                    <div class="switch-label"><span>Show Battery Percentage</span></div>
                                </label>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>

                <div class="section">
                    <div class="section-header" @click="${() => this._toggleSection('advanced')}">
                        <span class="section-title">Advanced Options</span>
                        <ha-icon icon="${this._expandedSections.advanced ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
                    </div>
                    ${this._expandedSections.advanced ? html`
                        <div class="section-content">
                            <label class="switch-wrapper"><ha-switch id="haptic" .checked="${this._config?.haptic !== false}" @change="${this._valueChanged}"></ha-switch><div class="switch-label"><span>Haptic Feedback</span></div></label>
                            ${hasLight ? html`
                                <label class="switch-wrapper"><ha-switch id="volume_click_control" .checked="${this._config?.volume_click_control !== false}" @change="${this._valueChanged}"></ha-switch><div class="switch-label"><span>Volume Click Control</span></div></label>
                            ` : ''}
                            <ha-textfield id="volume_presets" label="Volume Presets (Optional)" .value="${this._config?.volume_presets ? this._config.volume_presets.join(', ') : ''}" @input="${this._valueChanged}" placeholder="0, 0.25, 0.5, 0.75, 1" helper-text="Comma-separated decimal values (0-1)"></ha-textfield>
                            <ha-textfield id="volume_step" label="Volume Step" type="number" min="0.01" max="0.5" step="0.01" .value="${this._config?.volume_step || 0.01}" @input="${this._valueChanged}"></ha-textfield>
                            <ha-textfield id="animation_duration" label="Animation Duration (ms)" type="number" min="0" max="1000" step="50" .value="${this._config?.animation_duration || 250}" @input="${this._valueChanged}"></ha-textfield>
                        </div>
                    ` : ''}
                </div>

                <div class="section">
                    <div class="section-header" @click="${() => this._toggleSection('timer')}">
                        <span class="section-title">Timer Options</span>
                        <ha-icon icon="${this._expandedSections.timer ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
                    </div>
                    ${this._expandedSections.timer ? html`
                        <div class="section-content">
                            <ha-entity-picker 
                                .hass=${this._hass} 
                                .value=${this._config.timer_entity || ''} 
                                @value-changed=${this._valueChanged} 
                                label="Timer Entity (Optional)" 
                                .configValue=${"timer_entity"} 
                                .includeDomains=${["input_text"]}
                                helper="Create an Input Text helper to make the timer persistent across reloads."
                            ></ha-entity-picker>
                            <ha-textfield id="timer_presets" label="Timer Presets (minutes)" .value="${this._config?.timer_presets ? this._config.timer_presets.join(', ') : '15, 30, 60, 120'}" @input="${this._valueChanged}" placeholder="15, 30, 60, 120" helper-text="Comma-separated values in minutes"></ha-textfield>
                            <div class="subsection-title">Timer Expiration Actions</div>
                            ${hasLight ? html`
                                <label class="switch-wrapper"><ha-switch id="timer_action_turn_off_light" .checked="${this._config?.timer_action_turn_off_light !== false}" @change="${this._valueChanged}"></ha-switch><div class="switch-label"><span>Turn off light when timer expires</span></div></label>
                            ` : ''}
                            <label class="switch-wrapper"><ha-switch id="timer_action_turn_off_media" .checked="${this._config?.timer_action_turn_off_media === true}" @change="${this._valueChanged}"></ha-switch><div class="switch-label"><span>Stop media player when timer expires</span></div></label>
                            ${hasLight ? html`
                                <ha-textfield id="timer_action_light_brightness" label="Timer Light Brightness (%)" type="number" min="1" max="100" .value="${this._config?.timer_action_light_brightness || ''}" @input="${this._valueChanged}" placeholder="Leave empty to not change"></ha-textfield>
                                <ha-textfield id="timer_action_light_color" label="Timer Light Color" .value="${this._config?.timer_action_light_color ? getColorNameFromRgb(this._config.timer_action_light_color) : ''}" @input="${this._valueChanged}" placeholder="red, or 255, 0, 0"></ha-textfield>
                            ` : ''}
                            <ha-select key="timer_action_sound_mode" label="Timer Sound Mode" .value="${this._config?.timer_action_sound_mode || ''}" @change="${this._valueChanged}" @closed="${(e) => e.stopPropagation()}">
                                <mwc-list-item value=""></mwc-list-item>
                                ${timerSoundModes.map(mode => html`<mwc-list-item .value="${mode}">${mode}</mwc-list-item>`)}
                            </ha-select>
                            <ha-textfield id="timer_action_volume" label="Timer Volume (%)" type="number" min="0" max="100" .value="${this._config?.timer_action_volume || ''}" @input="${this._valueChanged}" placeholder="Leave empty to not change"></ha-textfield>
                        </div>
                    ` : ''}
                </div>

                <div class="section">
                    <div class="section-header" @click="${() => this._toggleSection('scenes')}">
                        <span class="section-title">Scene Control</span>
                        <ha-icon icon="${this._expandedSections.scenes ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
                    </div>
                    ${this._expandedSections.scenes ? html`
                        <div class="section-content">
                            <ha-textfield id="scenes_per_row" label="Scenes Per Row" type="number" min="1" max="8" .value="${this._config?.scenes_per_row || 4}" @input="${this._valueChanged}" helper-text="Number of scene buttons per row (1-8)"></ha-textfield>
                            <div class="subsection-title">Scenes</div>
                            ${this._config?.scenes && this._config.scenes.length > 0 ? html`
                                <div class="scene-list">
                                    ${this._config.scenes.map((scene, index) => {
                                        const configuredSceneSound = scene.sound_mode;
                                        const sceneSoundModes = [...baseSoundModes];
                                        if (configuredSceneSound && !sceneSoundModes.includes(configuredSceneSound)) sceneSoundModes.unshift(configuredSceneSound);
                                        return html`
                                        <div class="scene-item">
                                            <div class="scene-summary" @click="${() => this._editScene(index)}">
                                                <ha-icon icon="${scene.icon || 'mdi:palette'}"></ha-icon>
                                                <span>${scene.name || `Scene ${index + 1}`}</span>
                                                <ha-icon icon="mdi:delete" class="delete-icon" @click="${(e) => { e.stopPropagation(); this._deleteScene(index); }}"></ha-icon>
                                            </div>
                                            ${this._editingSceneIndex === index ? html`
                                                <div class="scene-edit">
                                                    <ha-textfield label="Name" .value="${scene.name || ''}" @input="${(e) => this._updateScene(e, index, 'name')}" placeholder="Scene name"></ha-textfield>
                                                    <ha-icon-picker label="Icon" .value="${scene.icon || ''}" @value-changed="${(e) => this._updateScene(e, index, 'icon')}" .placeholder="${'mdi:palette'}"></ha-icon-picker>
                                                    <div class="subsection-title">Option 1: Activate HA Scene</div>
                                                    <ha-entity-picker .hass=${this._hass} .value=${scene.entity_id} @value-changed=${(e) => this._updateScene(e, index, 'entity_id')} label="Scene Entity (Overrides Manual Controls)" .configValue=${"entity_id"} .includeDomains=${["scene"]}></ha-entity-picker>
                                                    <div class="subsection-title">Option 2: Manual Controls</div>
                                                    <div class="manual-controls ${scene.entity_id ? 'disabled' : ''}">
                                                        ${hasLight ? html`
                                                            <label class="switch-wrapper"><ha-switch .checked="${scene.turn_off_light === true}" @change="${(e) => this._updateScene(e, index, 'turn_off_light')}" ?disabled=${scene.entity_id}></ha-switch><div class="switch-label"><span>Turn Off Light</span></div></label>
                                                        ` : ''}
                                                        <label class="switch-wrapper"><ha-switch .checked="${scene.turn_off_media === true}" @change="${(e) => this._updateScene(e, index, 'turn_off_media')}" ?disabled=${scene.entity_id}></ha-switch><div class="switch-label"><span>Turn Off Sound</span></div></label>
                                                        ${hasLight ? html`
                                                            <ha-textfield label="Color" .value="${scene.color ? getColorNameFromRgb(scene.color) : ''}" @input="${(e) => this._updateScene(e, index, 'color')}" placeholder="red, green, or 255, 0, 0" ?disabled=${scene.entity_id || scene.turn_off_light}></ha-textfield>
                                                            <ha-textfield label="Brightness (%)" type="number" min="1" max="100" .value="${scene.brightness || ''}" @input="${(e) => this._updateScene(e, index, 'brightness')}" placeholder="Leave empty for no change" ?disabled=${scene.entity_id || scene.turn_off_light}></ha-textfield>
                                                        ` : ''}
                                                        <ha-select label="Sound Mode" .value="${scene.sound_mode || ''}" @change="${(e) => this._updateScene(e, index, 'sound_mode')}" @closed="${(e) => e.stopPropagation()}" ?disabled=${scene.entity_id || scene.turn_off_media}>
                                                            <mwc-list-item value=""></mwc-list-item>
                                                            ${sceneSoundModes.map(mode => html`<mwc-list-item .value="${mode}">${mode}</mwc-list-item>`)}
                                                        </ha-select>
                                                        <ha-textfield label="Volume (%)" type="number" min="0" max="100" .value="${scene.volume || ''}" @input="${(e) => this._updateScene(e, index, 'volume')}" placeholder="Leave empty for no change" ?disabled=${scene.entity_id || scene.turn_off_media}></ha-textfield>
                                                    </div>
                                                    <button class="done-button" @click="${() => this._editingSceneIndex = null}">Done</button>
                                                </div>
                                            ` : ''}
                                        </div>
                                        `})}
                                </div>
                            ` : html`<div class="no-scenes">No scenes configured</div>`}
                            <button class="add-scene-button" @click="${this._addScene}"><ha-icon icon="mdi:plus"></ha-icon>Add Scene</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    static get styles() {
        return css`
            .card-config { display: flex; flex-direction: column; gap: 4px; }
            .section { background: var(--card-background-color); border-radius: 8px; overflow: hidden; margin-bottom: 4px; }
            .section-header { display: flex; align-items: center; justify-content: space-between; padding: 16px; cursor: pointer; user-select: none; background: var(--card-background-color); transition: background-color 0.1s; }
            .section-header:hover { background: rgba(var(--rgb-primary-text-color), 0.04); }
            .section-title { font-weight: 500; font-size: 15px; color: var(--primary-text-color); margin: 0; }
            .section-header ha-icon { color: var(--secondary-text-color); transition: transform 0.2s; }
            .section-content { padding: 0 16px 16px 16px; display: flex; flex-direction: column; gap: 16px; animation: slideDown 0.2s ease-out; }
            @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
            .subsection-title { font-weight: 500; margin-top: 8px; margin-bottom: -8px; color: var(--primary-text-color); font-size: 0.9rem; }
            ha-select, ha-textfield, ha-entity-picker { width: 100%; }
            .switches { display: flex; flex-direction: column; gap: 12px; }
            .switch-wrapper { display: flex; align-items: center; gap: 16px; cursor: pointer; padding: 4px 0; }
            .switch-label { display: flex; flex-direction: column; flex: 1; }
            .switch-label span:first-child { font-weight: 500; color: var(--primary-text-color); font-size: 14px; }
            .switch-description { font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; line-height: 1.4; }
            ha-textfield[type="number"] { width: 100%; }
            .scene-list { display: flex; flex-direction: column; gap: 8px; }
            .scene-item { border: 1px solid var(--divider-color); border-radius: 8px; overflow: hidden; }
            .scene-summary { display: flex; align-items: center; gap: 12px; padding: 12px; cursor: pointer; background: rgba(var(--rgb-primary-text-color), 0.02); transition: background-color 0.1s; }
            .scene-summary:hover { background: rgba(var(--rgb-primary-text-color), 0.06); }
            .scene-summary ha-icon:first-child { color: var(--primary-text-color); }
            .scene-summary span { flex: 1; font-weight: 500; color: var(--primary-text-color); }
            .delete-icon { color: var(--error-color); cursor: pointer; opacity: 0.7; transition: opacity 0.2s; }
            .delete-icon:hover { opacity: 1; }
            .scene-edit { padding: 16px; background: rgba(var(--rgb-primary-text-color), 0.02); display: flex; flex-direction: column; gap: 12px; animation: slideDown 0.2s ease-out; }
            .manual-controls.disabled { opacity: 0.4; pointer-events: none; }
            .no-scenes { text-align: center; color: var(--secondary-text-color); padding: 24px; font-style: italic; }
            .add-scene-button, .done-button { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border: 2px dashed var(--divider-color); border-radius: 8px; background: transparent; color: var(--primary-text-color); font-weight: 500; cursor: pointer; transition: all 0.2s; }
            .done-button { border-style: solid; background: var(--primary-color); color: white; }
            .add-scene-button:hover { border-color: var(--primary-color); background: rgba(var(--rgb-primary-color), 0.1); }
            .done-button:hover { opacity: 0.9; }
            ha-select { --mdc-menu-max-width: 100%; }
        `;
    }
}

customElements.define("hatch-card", HatchCard);

setTimeout(() => {
    window.customCards = window.customCards || [];
    window.customCards.push({
        type: "hatch-card",
        name: "Hatch Card",
        preview: true,
        description: "A custom card to control a Hatch Rest device.",
        editor: "hatch-card-editor",
    });
}, 0);
