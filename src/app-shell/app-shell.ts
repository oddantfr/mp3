import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {withStyles} from 'lit-with-styles';
// import styles from './app-shell.css?inline';

@customElement('app-shell')
@withStyles(/* styles */)
export class AppShell extends LitElement {
	render() {
		return html`<b class="bg-red-200">hello world</b>`;
	}
}
