import {LitElement, html} from 'lit';
import {query, state} from 'lit/decorators.js';
import {customElement} from 'custom-element-decorator';
import {
	renderColorModePicker,
	renderColorPicker,
	renderThemeElements,
} from '../styles/theme-elements.js';
import {withStyles} from 'lit-with-styles';
import {themeStore} from '../styles/styles.js';
import {withController} from '@snar/lit';

@customElement({name: 'settings-dialog', inject: true})
@withStyles()
// @ts-ignore
@withController(themeStore)
export class SettingsDialog extends LitElement {
	@state() open = false;

	render() {
		return html`
			<md-dialog ?open=${this.open} @closed=${() => (this.open = false)}>
				<div slot="headline">Settings</div>

				<form slot="content" method="dialog" id="form">
					${renderThemeElements()}
				</form>

				<div slot="actions">
					<md-text-button form="form" value="close">Close</md-text-button>
				</div>
			</md-dialog>
		`;
	}
}

export const settingsDialog = new SettingsDialog();
