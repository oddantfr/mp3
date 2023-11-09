import '@vdegenne/material-color-helpers/color-mode-picker';
import '@vdegenne/material-color-helpers/color-picker';
import {css, html} from 'lit';
import {themeStore} from './styles.js';
import {ColorModePicker} from '@vdegenne/material-color-helpers/color-mode-picker';
import {ColorPicker} from '@vdegenne/material-color-helpers/color-picker';

ColorPicker.elementStyles.push(css`
	.input-wrapper {
		width: 40px;
		height: 40px;
	}
`);

export function renderColorModePicker() {
	return html`
		<color-mode-picker
			.value=${themeStore.colorMode}
			@select=${(event: Event) => {
				const target = event.target as ColorModePicker;
				themeStore.colorMode = target.value;
			}}
		></color-mode-picker>
	`;
}

export function renderColorPicker() {
	return html`
		<color-picker
			value=${themeStore.themeColor}
			@input=${(event: Event) => {
				const target = event.target as ColorPicker;
				themeStore.themeColor = target.value;
			}}
		></color-picker>
	`;
}

export function renderThemeElements() {
	return html`
		<div class="flex items-center space-x-2">
			${renderColorPicker()} ${renderColorModePicker()}
		</div>
	`;
}
