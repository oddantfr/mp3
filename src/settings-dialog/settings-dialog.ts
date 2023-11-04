import {LitElement, html} from 'lit';
import {query, state} from 'lit/decorators.js';
import {customElement} from 'custom-element-decorator';
// import '@material/web/dialog/dialog.js';
// import {MdDialog} from '@material/web/dialog/dialog.js';

// MdDialog.shadowRootOptions.delegatesFocus = false;

@customElement({name: 'settings-dialog', inject: true})
export class SettingsDialog extends LitElement {
	@state() open = true;

	render() {
		return html`
			<!-- <md-dialog ?open=${this.open} @closed=${() => (this.open = false)}>
				<div slot="headline">Settings</div>

				<form slot="content" method="dialog" id="form">test</form>

				<div slot="actions">
					<md-text-button form="form" value="close">Close</md-text-button>
				</div>
			</md-dialog> -->
		`;
	}
}

export const settingsDialog = new SettingsDialog();
