/*
 * Hatch Card
 *
 * A custom card to control a Hatch Rest device.
 *
 * Author: eyalgal
 * License: MIT
 * 
 * For more information, visit: https://github.com/eyalgal/hatch-card
 */
import {
    LitElement,
    html,
    css
} from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

const cardVersion = "1.0.0";
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

const TIMER_PRESETS = [
    { label: "15m", value: 15 },
    { label: "30m", value: 30 },
    { label: "1h", value: 60 },
    { label: "2h", value: 120 },
];

// Helper function to format timer duration
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

// Color name to RGB mapping
const COLOR_NAMES = {
    'red': [255, 0, 0],
    'green': [0, 255, 0],
    'blue': [0, 0, 255],
    'yellow': [255, 255, 0],
    'orange': [255, 165, 0],
    'purple': [128, 0, 128],
    'pink': [255, 192, 203],
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
    'black': [0, 0, 0]
};

// Helper function to get color name from RGB array
function getColorNameFromRgb(rgbArray) {
    if (!rgbArray || !Array.isArray(rgbArray)) return '';
    
    const rgbString = rgbArray.join(',');
    for (const [name, rgb] of Object.entries(COLOR_NAMES)) {
        if (rgb.join(',') === rgbString) {
            return name;
        }
    }
    return rgbArray.join(', '); // Fall back to RGB if no name found
}

// Helper function to parse color input (name or RGB)
function parseColorInput(input) {
    if (!input || !input.trim()) return null;
    
    const trimmed = input.trim().toLowerCase();
    
    // Check if it's a color name
    if (COLOR_NAMES[trimmed]) {
        return COLOR_NAMES[trimmed];
    }
    
    // Check if it's RGB format
    const rgbMatch = trimmed.match(/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*$/);
    if (rgbMatch) {
        return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }
    
    return null;
}

class HatchCard extends LitElement {

    static get properties() {
        return {
            hass: {},
            _config: {},
            _timerEnd: { type: Number },
            _timerRemaining: { type: String },
            _showControls: { type: Boolean },
        };
    }

    constructor() {
        super();
        this._timerEnd = null;
        this._timerRemaining = '';
        this._showControls = false;
        this._timerInterval = null;
        this._holdTimer = null;
        this._tapTimer = null;
        this._tapCount = 0;
		this._userProvidedIcon = null;
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
            show_timer: false,
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
            light_entity: "",
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

    _updateTimer() {
        if (!this._timerEnd) {
            this._timerRemaining = '';
            return;
        }

        const now = Date.now();
        const remaining = Math.max(0, this._timerEnd - now);
        
        if (remaining === 0) {
            this._timerEnd = null;
            this._timerRemaining = '';
            this._executeTimerActions();
            return;
        }

        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        this._timerRemaining = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    render() {
        if (!this.hass || !this._config) {
            return html ``;
        }
        
        if (!this._config.light_entity || !this._config.media_player_entity) {
            const isPreview = this.classList.contains('element-preview');
            if (isPreview) {
                return html`
                    <ha-card>
                        <div style="padding: 16px; text-align: center; color: var(--secondary-text-color);">
                            <ha-icon icon="mdi:sleep" style="width: 40px; height: 40px; margin-bottom: 8px;"></ha-icon>
                            <div>Hatch Card</div>
                        </div>
                    </ha-card>
                `;
            }
            return this._renderError("You must define `light_entity` and `media_player_entity`.");
        }

        const lightState = this.hass.states[this._config.light_entity];
        const mediaState = this.hass.states[this._config.media_player_entity];

        if (!lightState || !mediaState) {
            return this._renderError("Entities not found. Please check your configuration.");
        }

        const isOn = lightState.state === 'on';
		const brightness = lightState.attributes.brightness || 0;
		const brightnessPercent = Math.round((brightness / 255) * 100);
		let rgbColor = lightState.attributes.rgb_color;
		const hsColor = lightState.attributes.hs_color;

		// Check if this is actually a white light
		const isWhiteLight = isOn && rgbColor && (
			(rgbColor.join(',') === '0,0,0' && brightness > 0) ||
			(hsColor && hsColor[1] === 0)
		);

		// Smart color handling
		let lightColor;
		let lightColorRgb;

		if (!isOn) {
			lightColor = 'var(--state-icon-color)';
			lightColorRgb = null;
		} else if (isWhiteLight) {
			// For white lights, use a warm tone that works in both themes
			const warmWhite = [255, 206, 84]; // Warm white/amber
			lightColor = `rgb(${warmWhite.join(',')})`;
			lightColorRgb = warmWhite.join(',');
		} else {
			// Normal colored light
			lightColor = `rgb(${rgbColor.join(',')})`;
			lightColorRgb = rgbColor.join(',');
		}
        
        const volumeLevel = mediaState.attributes.volume_level || 0;
        const volumePercent = Math.round(volumeLevel * 100);
        const soundMode = mediaState.attributes.sound_mode || 'None';
        
        const name = this._config.name || lightState.attributes.friendly_name;
        
        const activeIcon = this._userProvidedIcon || SOUND_ICON_MAP[soundMode] || mediaState.attributes.icon || this._config.icon;

        const cardStyle = this._getCardBackgroundStyle(lightColorRgb, volumePercent);

        let secondaryInfo = '';
        if (this._config.secondary_info && this._config.secondary_info.trim() !== '') {
            secondaryInfo = this._config.secondary_info
                .replace('{volume}', volumePercent)
                .replace('{sound}', soundMode)
                .replace('{brightness}', brightnessPercent);
        }

        if (this._timerRemaining && secondaryInfo) {
            secondaryInfo = `${secondaryInfo} • ${this._timerRemaining}`;
        } else if (this._timerRemaining) {
            secondaryInfo = this._timerRemaining;
        }

		const layoutClass = this._config.layout === 'horizontal' ? 'horizontal-layout' : 'vertical-layout';
		const expandedClass = this._showControls ? 'expanded' : '';

		const hasExpandableControls = this._config.show_brightness_control || this._config.show_timer || this._config.show_sound_control;
		const showExpandButton = this._config.show_expand_button && hasExpandableControls;
		const showExpandedControls = showExpandButton ? this._showControls : hasExpandableControls;
		
		// Add class for vertical layouts that need expansion  
		const verticalExpandedClass = (this._config.layout === 'vertical' && showExpandButton) ? 'has-expand-button' : '';

        return html `
            <ha-card 
                style="${cardStyle}" 
                class="${layoutClass} ${expandedClass} ${verticalExpandedClass}"
                @click="${this._handleCardClick}"
            >
                ${this._config.layout === 'horizontal' 
                    ? this._renderHorizontalLayout(isOn, lightColor, secondaryInfo, activeIcon, volumePercent, name, showExpandButton)
                    : this._renderVerticalLayout(isOn, lightColor, secondaryInfo, activeIcon, volumePercent, name, showExpandButton)
                }
                ${showExpandedControls ? this._renderExpandedControls(isOn, lightColor, brightness, volumeLevel, mediaState, showExpandButton) : ''}
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
				${showExpandButton ? html`
					<div class="expand-button vertical" @click="${this._toggleControls}">
						<ha-icon icon="${this._showControls ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
					</div>
				` : ''}
            </div>
        `;
    }

    _renderExpandedControls(isOn, lightColor, brightness, volumeLevel, mediaState, showExpandButton) {
		const showAlways = !showExpandButton;
        
        return html`
            <div class="expanded-controls ${showAlways ? 'always-visible' : ''}">
                ${this._config.show_brightness_control && isOn ? html`
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
                ` : ''}
                
                ${this._config.volume_presets && showExpandButton && this._showControls ? html`
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
                ` : ''}
                
                ${this._config.show_sound_control ? html`
                    <div class="control-row">
                        <ha-icon icon="mdi:music-note"></ha-icon>
                        ${this._renderSoundSelect(mediaState)}
                    </div>
                ` : ''}
                
                ${this._config.show_timer ? html`
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
                            ${this._timerEnd ? html`
                                <button 
                                    class="timer-button cancel"
                                    @click="${() => this._cancelTimer()}"
                                >
                                    Cancel
                                </button>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    _getCardBackgroundStyle(rgb, volumePercent) {
        const defaultBg = 'var(--ha-card-background, var(--card-background-color, #FFF))';
        if (!rgb || this._config.background_mode === 'none') {
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
            return html `<img class="user-photo ${isVertical ? 'vertical' : ''}" src="${this._config.user_photo}" alt="${this._config.name || 'User'}" />`;
        }
        
        const shapeStyle = `background-color: ${isOn ? lightColorStyle.replace('rgb', 'rgba').replace(')', ', 0.2)') : 'rgba(var(--rgb-primary-text-color), 0.05)'};`;
        const iconStyle = `color: ${isOn ? lightColorStyle : 'var(--primary-text-color, var(--paper-item-icon-color))'};`;

        return html `
            <div class="shape ${isVertical ? 'vertical' : ''}" style="${shapeStyle}">
                <ha-icon .icon="${activeIcon}" style="${iconStyle}"></ha-icon>
            </div>
        `;
    }

    _renderVolumeButton(change, icon, lightColorStyle) {
        const isOn = this.hass.states[this._config.light_entity].state === 'on';
        const buttonStyle = isOn ? 
            `background-color: ${lightColorStyle.replace('rgb', 'rgba').replace(')', ', 0.2)')}; color: ${lightColorStyle};` :
            `background-color: rgba(var(--rgb-primary-text-color), 0.05); color: var(--primary-text-color);`;
            
        return html `
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
        const soundList = mediaState.attributes.sound_mode_list;
        if (!soundList || !Array.isArray(soundList)) {
            return this._renderWarning("'sound_mode_list' attribute not available.");
        }

        const selectedOption = mediaState.attributes.sound_mode;

        return html `
            <ha-select
                label="Sound"
                .value="${selectedOption}"
                @selected="${this._handleSoundChange}"
                style="flex: 1;"
            >
                ${soundList.map(option => html`<mwc-list-item .value="${option}">${option}</mwc-list-item>`)}
            </ha-select>
        `;
    }

    _renderError(message) {
        return html `<ha-card><div class="error-msg">${message}</div></ha-card>`;
    }

    _renderWarning(message) {
        return html `<div class="warning-msg">${message}</div>`;
    }

    _handleAction(action) {
        if (!action || action.action === 'none') return;
        
        this._vibrate();
        
        switch (action.action) {
            case 'toggle':
                this._toggleLight();
                break;
            case 'more-info':
                this._showMoreInfo();
                break;
            case 'call-service':
                this._callService(action);
                break;
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
        
        if (action.service_data) {
            serviceData = { ...action.service_data };
        }
        
        if (action.data) {
            serviceData = { ...serviceData, ...action.data };
        }
        
        if (action.target) {
            if (action.target.entity_id) {
                if (action.target.entity_id === 'light') {
                    serviceData.entity_id = this._config.light_entity;
                } else if (action.target.entity_id === 'media_player') {
                    serviceData.entity_id = this._config.media_player_entity;
                } else {
                    serviceData.entity_id = action.target.entity_id;
                }
            }
        } else if (serviceData.entity_id) {
            if (serviceData.entity_id === 'light') {
                serviceData.entity_id = this._config.light_entity;
            } else if (serviceData.entity_id === 'media_player') {
                serviceData.entity_id = this._config.media_player_entity;
            }
        }
        
        this.hass.callService(domain, service, serviceData);
    }

    _handleMouseDown(e) {
        this._handleStart(e);
    }

    _handleMouseUp(e) {
        this._handleEnd(e);
    }

    _handleTouchStart(e) {
        this._handleStart(e);
    }

    _handleTouchEnd(e) {
        this._handleEnd(e);
    }

    _handleTouchCancel(e) {
        this._clearHoldTimer();
    }

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

    _toggleLight(e) {
        if (e) e.stopPropagation();
        this.hass.callService("light", "toggle", {
            entity_id: this._config.light_entity,
        });
    }

    _showMoreInfo() {
        const event = new Event("hass-more-info", {
            bubbles: true,
            composed: true,
        });
        event.detail = { entityId: this._config.light_entity };
        this.dispatchEvent(event);
    }

    _toggleSection(section) {
        this._expandedSections = {
            ...this._expandedSections,
            [section]: !this._expandedSections[section]
        };
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
        if (this._config.background_mode !== 'volume' || !this._config.volume_click_control) {
            return;
        }

        if (e.target.closest('.volume-button') || 
            e.target.closest('.icon-container') || 
            e.target.closest('.header') ||
            e.target.closest('.expand-button') ||
            e.target.closest('.expanded-controls')) {
            return;
        }

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

    _setTimer(minutes) {
        this._vibrate();
        this._timerEnd = Date.now() + (minutes * 60000);
        this._updateTimer();
        
        if (this.hass.services.hatch?.set_timer) {
            this.hass.callService("hatch", "set_timer", {
                entity_id: this._config.media_player_entity,
                duration: minutes,
            });
        }
    }

    _cancelTimer() {
        this._vibrate();
        this._timerEnd = null;
        this._timerRemaining = '';
        
        if (this.hass.services.hatch?.cancel_timer) {
            this.hass.callService("hatch", "cancel_timer", {
                entity_id: this._config.media_player_entity,
            });
        }
    }

    _getTimerPresets() {
        const presets = this._config.timer_presets || [15, 30, 60, 120];
        return presets.map(minutes => ({
            label: formatTimerDuration(minutes),
            value: minutes
        }));
    }

    _executeTimerActions() {
        if (!this.hass) return;

        const willStopMedia = this._config.timer_action_turn_off_media;
        const hasLightChanges = this._config.timer_action_light_color || 
                               this._config.timer_action_light_brightness !== null;

        // Turn off light if configured (happens immediately)
        if (this._config.timer_action_turn_off_light) {
            this.hass.callService("light", "turn_off", {
                entity_id: this._config.light_entity,
            });
        } 

        // Apply sound changes if configured
        if (willStopMedia) {
            // Hatch devices don't support turn_off, so we'll stop playback instead
            this.hass.callService("media_player", "media_stop", {
                entity_id: this._config.media_player_entity,
            });
            // Also set volume to 0 as a backup
            this.hass.callService("media_player", "volume_set", {
                entity_id: this._config.media_player_entity,
                volume_level: 0,
            });
        } else if (this._config.timer_action_sound_mode) {
            this.hass.callService("media_player", "select_sound_mode", {
                entity_id: this._config.media_player_entity,
                sound_mode: this._config.timer_action_sound_mode,
            });
        }

        // Apply volume changes if configured (and not stopping media)
        if (!willStopMedia && this._config.timer_action_volume !== null) {
            const volume = parseFloat(this._config.timer_action_volume) / 100;
            this.hass.callService("media_player", "volume_set", {
                entity_id: this._config.media_player_entity,
                volume_level: Math.max(0, Math.min(1, volume)),
            });
        }

        // Handle light changes with delay if we're stopping media
        if (!this._config.timer_action_turn_off_light && hasLightChanges) {
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
                    this.hass.callService("light", "turn_on", {
                        entity_id: this._config.light_entity,
                        ...lightData,
                    });
                }
            };

            if (willStopMedia) {
                // Delay light changes when stopping media to ensure they happen after
                setTimeout(executeLight, 1000); // 1 second delay
            } else {
                // Execute immediately if not stopping media
                executeLight();
            }
        }
    }

    _vibrate() {
        if (this._config.haptic && navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    static get styles() {
        return css `
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
            
            /* Horizontal Layout */
            .horizontal-layout {
                padding: 12px;
            }
            .horizontal-layout.expanded {
                height: auto;
            }
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
            
            /* Vertical Layout */
            .vertical-layout {
                height: 120px;
                padding: 0;
                position: relative;
            }
            .vertical-layout.expanded {
                height: auto;
            }
            .vertical-layout.has-expand-button {
                min-height: 160px;
            }
            .vertical-layout:has(.expanded-controls.always-visible) {
                height: auto;
            }
            .content-wrapper.vertical {
                height: 100%;
                position: relative;
                display: block;
                min-height: 120px;
            }
            .vertical-layout.has-expand-button .content-wrapper.vertical {
                min-height: 160px;
            }
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
            .vertical-layout.has-expand-button .info.vertical {
                bottom: 52px;
            }
            .expand-button.vertical {
                position: absolute;
                bottom: 8px;
                left: 50%;
                transform: translateX(-50%);
            }
            
            /* Icon & Shape */
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
            .shape {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 42px;
                width: 42px;
                border-radius: 50%;
                transition: background-color var(--animation-duration, 250ms);
            }
            .shape.vertical {
                width: 48px;
                height: 48px;
            }
            .shape.vertical ha-icon {
                --mdc-icon-size: 28px;
            }
            .shape ha-icon {
                transition: color var(--animation-duration, 250ms);
            }
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
            
            /* Info */
            .info {
                overflow: hidden;
                flex-grow: 1;
            }
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
            
            /* Volume Controls */
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
            .volume-button:hover {
                transform: scale(1.1);
            }
            .volume-button:active {
                transform: scale(0.95);
            }
            .volume-button ha-icon {
                --mdc-icon-size: 20px;
            }
            .volume-percent {
                font-size: 14px;
                font-weight: 500;
                min-width: 32px;
                text-align: center;
                color: var(--secondary-text-color);
            }
            
            /* Expand Button */
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
            .expand-button:hover {
                color: var(--primary-text-color);
            }
            
            /* Expanded Controls */
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
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
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
            
            /* Mushroom-style Slider */
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
            .slider-input::-moz-range-thumb {
                width: 0;
                height: 0;
                border: 0;
            }
            
            /* Preset & Timer Buttons */
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
            
            /* Error & Warning */
            .error-msg, .warning-msg {
                background-color: var(--error-color, #db4437);
                color: white;
                padding: 16px;
                border-radius: var(--ha-card-border-radius, 12px);
            }
            .warning-msg {
                background-color: var(--warning-color, #ffa600);
            }
            
            /* Accessibility */
            @media (prefers-reduced-motion: reduce) {
                * {
                    animation-duration: 0.01ms !important;
                    transition-duration: 0.01ms !important;
                }
            }

            /* Theme-aware color for white lights */
            :host {
                --hatch-white-light-color: rgb(255, 206, 84); /* Default warm white */
            }
            @media (prefers-color-scheme: dark) {
                :host {
                    --hatch-white-light-color: rgb(255, 206, 84);
                }
            }
            @media (prefers-color-scheme: light) {
                :host {
                    --hatch-white-light-color: rgb(255, 152, 0);
                }
            }
        `;
    }
}

customElements.define("hatch-card", HatchCard);

class HatchCardEditor extends LitElement {
    static get properties() {
        return { 
            hass: {}, 
            _config: {},
            _expandedSections: { type: Object }
        };
    }

    constructor() {
        super();
        this._expandedSections = {
            basic: true,
            layout: false,
            controls: false,
            advanced: false,
            timer: false
        };
    }

    setConfig(config) {
        this._config = { ...config };
    }

    firstUpdated() {
        super.firstUpdated();
        // Completely disable auto-detection - users can manually select entities
        // This prevents YAML reset issues when editing existing cards
    }

    _toggleSection(section) {
        this._expandedSections = {
            ...this._expandedSections,
            [section]: !this._expandedSections[section]
        };
        this.requestUpdate();
    }

    _valueChanged(e) {
        if (!this._config || !this.hass) {
            return;
        }
        const target = e.target;
        const newConfig = { ...this._config };
        let key = target.id || target.getAttribute('key');
        let value;

        if (target.tagName === 'HA-SWITCH') {
            value = target.checked;
        } else if (target.tagName === 'HA-SELECT') {
            value = e.detail?.value || target.value;
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
        } else {
            value = target.value;
        }
        
        const defaults = {
            background_mode: 'full',
            layout: 'horizontal',
            show_volume_buttons: true,
            show_expand_button: false,
            haptic: true,
            volume_click_control: true,
            animation_duration: 250,
            volume_step: 0.01,
            secondary_info: 'Volume {volume}%',
            timer_presets: [15, 30, 60, 120],
            timer_action_turn_off_light: true,
        };
        
        if (defaults[key] !== undefined && value === defaults[key]) {
            delete newConfig[key];
        } else if (value !== null && value !== undefined && value !== '') {
            newConfig[key] = value;
        } else {
            delete newConfig[key];
        }

        const event = new CustomEvent("config-changed", {
            detail: { config: newConfig },
            bubbles: true,
            composed: true,
        });
        this.dispatchEvent(event);
    }

    render() {
        if (!this.hass) {
            return html`<div>Loading...</div>`;
        }

        if (!this._config) {
            return html`<div>No configuration</div>`;
        }

        const entities = Object.keys(this.hass.states);
        const lights = entities.filter(e => e.startsWith('light.'));
        const mediaPlayers = entities.filter(e => e.startsWith('media_player.'));
        
        // Get available sound modes for the current media player
        const currentMediaPlayer = this._config?.media_player_entity;
        const soundModes = currentMediaPlayer && this.hass.states[currentMediaPlayer] 
            ? this.hass.states[currentMediaPlayer].attributes.sound_mode_list || []
            : [];

        return html `
      <div class="card-config">
        
        <!-- Basic Configuration Section -->
        <div class="section">
          <div class="section-header" @click="${() => this._toggleSection('basic')}">
            <span class="section-title">Basic Configuration</span>
            <ha-icon icon="${this._expandedSections.basic ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
          </div>
          ${this._expandedSections.basic ? html`
            <div class="section-content">
              <ha-textfield
                id="name"
                label="Name (Optional)"
                .value="${this._config?.name || ''}"
                @input="${this._valueChanged}"
                placeholder="Defaults to entity name"
              ></ha-textfield>
              
              <ha-select
                key="light_entity"
                label="Light Entity (Required)"
                .value="${this._config?.light_entity || ''}"
                @change="${this._valueChanged}"
                @closed="${(e) => e.stopPropagation()}"
              >
                <mwc-list-item value="">Choose a light...</mwc-list-item>
                ${lights.map(entity => html`
                  <mwc-list-item .value="${entity}">
                    ${this.hass.states[entity].attributes.friendly_name || entity}
                  </mwc-list-item>
                `)}
              </ha-select>
              
              <ha-select
                key="media_player_entity"
                label="Media Player Entity (Required)"
                .value="${this._config?.media_player_entity || ''}"
                @change="${this._valueChanged}"
                @closed="${(e) => e.stopPropagation()}"
              >
                <mwc-list-item value="">Choose a media player...</mwc-list-item>
                ${mediaPlayers.map(entity => html`
                  <mwc-list-item .value="${entity}">
                    ${this.hass.states[entity].attributes.friendly_name || entity}
                  </mwc-list-item>
                `)}
              </ha-select>
              
              <ha-textfield
                id="icon"
                label="Default Icon (Optional)"
                .value="${this._config?.icon || ''}"
                @input="${this._valueChanged}"
                placeholder="mdi:speaker"
              ></ha-textfield>
              
              <ha-textfield
                id="user_photo"
                label="User Photo URL (Optional)"
                .value="${this._config?.user_photo || ''}"
                @input="${this._valueChanged}"
                placeholder="/local/photo.png"
              ></ha-textfield>
            </div>
          ` : ''}
        </div>

        <!-- Layout Options Section -->
        <div class="section">
          <div class="section-header" @click="${() => this._toggleSection('layout')}">
            <span class="section-title">Layout Options</span>
            <ha-icon icon="${this._expandedSections.layout ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
          </div>
          ${this._expandedSections.layout ? html`
            <div class="section-content">
              <ha-select
                  key="layout"
                  label="Layout"
                  .value="${this._config?.layout || 'horizontal'}"
                  @change="${this._valueChanged}"
                  @closed="${(e) => e.stopPropagation()}"
              >
                  <mwc-list-item value="horizontal">Horizontal</mwc-list-item>
                  <mwc-list-item value="vertical">Vertical</mwc-list-item>
              </ha-select>
              
              <ha-select
                  key="background_mode"
                  label="Background Mode"
                  .value="${this._config?.background_mode || 'full'}"
                  @change="${this._valueChanged}"
                  @closed="${(e) => e.stopPropagation()}"
              >
                  <mwc-list-item value="none">None</mwc-list-item>
                  <mwc-list-item value="full">Full Color</mwc-list-item>
                  <mwc-list-item value="volume">Volume Fill</mwc-list-item>
              </ha-select>
              
              <ha-textfield
                id="secondary_info"
                label="Secondary Info (Optional)"
                .value="${this._config?.secondary_info !== undefined ? this._config.secondary_info : 'Volume {volume}%'}"
                @input="${this._valueChanged}"
                placeholder="Volume {volume}%"
                helper-text="Supports {volume}, {sound}, {brightness}. Leave empty to hide."
              ></ha-textfield>
            </div>
          ` : ''}
        </div>

        <!-- Control Options Section -->
        <div class="section">
          <div class="section-header" @click="${() => this._toggleSection('controls')}">
            <span class="section-title">Control Options</span>
            <ha-icon icon="${this._expandedSections.controls ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
          </div>
          ${this._expandedSections.controls ? html`
            <div class="section-content">
              <div class="switches">
                  <label class="switch-wrapper">
                      <ha-switch
                          id="show_volume_buttons"
                          .checked="${this._config?.show_volume_buttons !== false}"
                          @change="${this._valueChanged}"
                      ></ha-switch>
                      <div class="switch-label">
                          <span>Show Volume Buttons</span>
                          <span class="switch-description">Display volume control buttons</span>
                      </div>
                  </label>
                  
                  <label class="switch-wrapper">
                      <ha-switch
                          id="show_expand_button"
                          .checked="${this._config?.show_expand_button === true}"
                          @change="${this._valueChanged}"
                      ></ha-switch>
                      <div class="switch-label">
                          <span>Show Expand Button</span>
                          <span class="switch-description">Allow expanding for more controls</span>
                      </div>
                  </label>
                  
                  <label class="switch-wrapper">
                      <ha-switch
                          id="show_sound_control"
                          .checked="${this._config?.show_sound_control === true}"
                          @change="${this._valueChanged}"
                      ></ha-switch>
                      <div class="switch-label">
                          <span>Show Sound Selector</span>
                          <span class="switch-description">Display sound mode dropdown</span>
                      </div>
                  </label>
                  
                  <label class="switch-wrapper">
                      <ha-switch
                          id="show_brightness_control"
                          .checked="${this._config?.show_brightness_control === true}"
                          @change="${this._valueChanged}"
                      ></ha-switch>
                      <div class="switch-label">
                          <span>Show Brightness Control</span>
                          <span class="switch-description">Display brightness slider when expanded</span>
                      </div>
                  </label>
                  
                  <label class="switch-wrapper">
                      <ha-switch
                          id="show_timer"
                          .checked="${this._config?.show_timer === true}"
                          @change="${this._valueChanged}"
                      ></ha-switch>
                      <div class="switch-label">
                          <span>Show Sleep Timer</span>
                          <span class="switch-description">Display timer presets when expanded</span>
                      </div>
                  </label>
                  
                  <label class="switch-wrapper">
                      <ha-switch
                          id="haptic"
                          .checked="${this._config?.haptic !== false}"
                          @change="${this._valueChanged}"
                      ></ha-switch>
                      <div class="switch-label">
                          <span>Haptic Feedback</span>
                          <span class="switch-description">Vibrate on touch (mobile devices)</span>
                      </div>
                  </label>
                  
                  <label class="switch-wrapper">
                      <ha-switch
                          id="volume_click_control"
                          .checked="${this._config?.volume_click_control !== false}"
                          @change="${this._valueChanged}"
                      ></ha-switch>
                      <div class="switch-label">
                          <span>Volume Click Control</span>
                          <span class="switch-description">Allow changing volume by clicking the card when background mode is "Volume Fill"</span>
                      </div>
                  </label>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Advanced Options Section -->
        <div class="section">
          <div class="section-header" @click="${() => this._toggleSection('advanced')}">
            <span class="section-title">Advanced Options</span>
            <ha-icon icon="${this._expandedSections.advanced ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
          </div>
          ${this._expandedSections.advanced ? html`
            <div class="section-content">
              <ha-textfield
                id="volume_presets"
                label="Volume Presets (Optional)"
                .value="${this._config?.volume_presets ? this._config.volume_presets.join(', ') : ''}"
                @input="${this._valueChanged}"
                placeholder="0, 0.25, 0.5, 0.75, 1"
                helper-text="Comma-separated decimal values (0-1)"
              ></ha-textfield>
              
              <ha-textfield
                id="volume_step"
                label="Volume Step"
                type="number"
                min="0.01"
                max="0.5"
                step="0.01"
                .value="${this._config?.volume_step || 0.01}"
                @input="${this._valueChanged}"
              ></ha-textfield>
              
              <ha-textfield
                id="animation_duration"
                label="Animation Duration (ms)"
                type="number"
                min="0"
                max="1000"
                step="50"
                .value="${this._config?.animation_duration || 250}"
                @input="${this._valueChanged}"
              ></ha-textfield>
            </div>
          ` : ''}
        </div>

        <!-- Timer Options Section -->
        <div class="section">
          <div class="section-header" @click="${() => this._toggleSection('timer')}">
            <span class="section-title">Timer Options</span>
            <ha-icon icon="${this._expandedSections.timer ? 'mdi:chevron-up' : 'mdi:chevron-down'}"></ha-icon>
          </div>
          ${this._expandedSections.timer ? html`
            <div class="section-content">
              <ha-textfield
                id="timer_presets"
                label="Timer Presets (minutes)"
                .value="${this._config?.timer_presets ? this._config.timer_presets.join(', ') : '15, 30, 60, 120'}"
                @input="${this._valueChanged}"
                placeholder="15, 30, 60, 120"
                helper-text="Comma-separated values in minutes"
              ></ha-textfield>
              
              <div class="subsection-title">Timer Expiration Actions</div>
              
              <label class="switch-wrapper">
                  <ha-switch
                      id="timer_action_turn_off_light"
                      .checked="${this._config?.timer_action_turn_off_light !== false}"
                      @change="${this._valueChanged}"
                  ></ha-switch>
                  <div class="switch-label">
                      <span>Turn off light when timer expires</span>
                      <span class="switch-description">Light will turn off completely when timer reaches zero</span>
                  </div>
              </label>
              
              <label class="switch-wrapper">
                  <ha-switch
                      id="timer_action_turn_off_media"
                      .checked="${this._config?.timer_action_turn_off_media === true}"
                      @change="${this._valueChanged}"
                  ></ha-switch>
                  <div class="switch-label">
                      <span>Stop media player when timer expires</span>
                      <span class="switch-description">Media player will stop playing and volume set to 0</span>
                  </div>
              </label>
              
              <ha-textfield
                id="timer_action_light_brightness"
                label="Timer Light Brightness (%)"
                type="number"
                min="1"
                max="100"
                .value="${this._config?.timer_action_light_brightness || ''}"
                @input="${this._valueChanged}"
                placeholder="Leave empty to not change"
                helper-text="Light brightness when timer expires (1-100%)"
              ></ha-textfield>
              
              <ha-textfield
                id="timer_action_light_color"
                label="Timer Light Color"
                .value="${this._config?.timer_action_light_color ? 
                  getColorNameFromRgb(this._config.timer_action_light_color) : ''}"
                @input="${this._valueChanged}"
                placeholder="red, green, blue, or 255, 0, 0"
                helper-text="Color name (red, green, blue, warm white, etc.) or RGB values (255, 0, 0)"
              ></ha-textfield>
              
              <ha-select
                key="timer_action_sound_mode"
                label="Timer Sound Mode"
                .value="${this._config?.timer_action_sound_mode || ''}"
                @change="${this._valueChanged}"
                @closed="${(e) => e.stopPropagation()}"
              >
                <mwc-list-item value="">No change</mwc-list-item>
                ${soundModes.map(mode => html`
                  <mwc-list-item .value="${mode}">${mode}</mwc-list-item>
                `)}
              </ha-select>
              
              <ha-textfield
                id="timer_action_volume"
                label="Timer Volume (%)"
                type="number"
                min="0"
                max="100"
                .value="${this._config?.timer_action_volume || ''}"
                @input="${this._valueChanged}"
                placeholder="Leave empty to not change"
                helper-text="Volume when timer expires (0-100%)"
              ></ha-textfield>
            </div>
          ` : ''}
        </div>

      </div>
    `;
    }

    static get styles() {
        return css `
      .card-config {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      
      .section {
        background: var(--card-background-color);
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 4px;
      }
      
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        cursor: pointer;
        user-select: none;
        background: var(--card-background-color);
        transition: background-color 0.1s;
      }
      
      .section-header:hover {
        background: rgba(var(--rgb-primary-text-color), 0.04);
      }
      
      .section-title {
        font-weight: 500;
        font-size: 15px;
        color: var(--primary-text-color);
        margin: 0;
      }
      
      .section-header ha-icon {
        color: var(--secondary-text-color);
        transition: transform 0.2s;
      }
      
      .section-content {
        padding: 0 16px 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        animation: slideDown 0.2s ease-out;
      }
      
      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .subsection-title {
        font-weight: 500;
        margin-top: 8px;
        margin-bottom: -8px;
        color: var(--primary-text-color);
        font-size: 0.9rem;
      }
      
      ha-select, ha-textfield {
        width: 100%;
      }
      
      .switches {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .switch-wrapper {
        display: flex;
        align-items: center;
        gap: 16px;
        cursor: pointer;
        padding: 4px 0;
      }
      
      .switch-label {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      
      .switch-label span:first-child {
        font-weight: 500;
        color: var(--primary-text-color);
        font-size: 14px;
      }
      
      .switch-description {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 2px;
        line-height: 1.4;
      }
      
      ha-textfield[type="number"] {
        width: 100%;
      }
      
      /* Fix for selects to ensure they don't overflow */
      ha-select {
        --mdc-menu-max-width: 100%;
      }
    `;
    }
}

// Register the editor
if (!customElements.get("hatch-card-editor")) {
    customElements.define("hatch-card-editor", HatchCardEditor);
}

// Register the card for the picker
setTimeout(() => {
    window.customCards = window.customCards || [];
    window.customCards.push({
        type: "hatch-card",
        name: "Hatch Card",
        preview: true,
        description: "A custom card to control a Hatch Rest device.",
    });
}, 0);
