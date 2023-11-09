import {LitElement, css, html} from 'lit';
import {live} from 'lit/directives/live.js';
import {query, state} from 'lit/decorators.js';
import {customElement} from 'custom-element-decorator';
import {
	MdCheckbox,
	MdDialog,
	MdOutlinedSelect,
	MdOutlinedTextField,
	MdSlider,
	MdTabs,
} from '@material/web/all.js';
import {withStyles} from 'lit-with-styles';
import {ActionName, ActionValue, WaitAction} from './action.js';

@customElement({name: 'action-dialog', inject: true})
@withStyles(css`
	md-dialog {
		width: 500px;
	}
	#panel-container {
		/* margin-top: 12px;
		margin: 12px 0 0 5px; */
		min-height: 120px;
		display: flex;
		flex-direction: column;
		padding: 12px;
		align-items: center;
		justify-content: center;
	}
	md-primary-tab {
		--md-primary-tab-container-color: transparent;
	}
`)
export class ActionDialog extends LitElement {
	@state() open = false;

	@state() private action: ActionValue | undefined;
	@state() tabIndex = 0;

	@state() private loopCheckboxValue = true;

	#closePromise: Promise<ActionValue>;
	#closeResolve!: (action: ActionValue) => void;
	#closeReject!: (reason?: any) => void;
	get formComplete() {
		return this.#closePromise;
	}

	@query('md-dialog') dialog!: MdDialog;
	@query('md-tabs') tabs!: MdTabs;

	constructor(action?: ActionValue) {
		super();
		this.action = action;
		if (action) {
			this.action = action;
			this.tabIndex = Object.values(ActionName).indexOf(action.name);
		}
		this.#closePromise = new Promise((res, rej) => {
			this.#closeResolve = res as any;
			this.#closeReject = rej;
		});

		this.loopCheckboxValue =
			this.action && this.action.name === 'next' ? this.action.loop : true;
	}

	render() {
		return html`
			<md-dialog
				?open=${this.open}
				@closed=${() => {
					// this.open = false;
					if (this.dialog.returnValue !== 'submit') {
						this.#closeReject();
					}
					this.remove();
				}}
			>
				<div slot="headline">${this.action ? 'Edit' : 'Create'} action</div>

				<form slot="content" method="dialog" id="form">
					<md-tabs
						@change=${() => {
							this.tabIndex = this.tabs.activeTabIndex;
						}}
						.activeTabIndex=${this.tabIndex}
					>
						${Object.values(ActionName).map((actionName) => {
							return html` <md-primary-tab>${actionName}</md-primary-tab> `;
						})}
					</md-tabs>

					<div id="panel-container">
						<div ?hidden=${this.tabIndex !== 0} class="w-full">
							<label>
								<md-list-item>
									<div slot="headline">Playback rate</div>
								</md-list-item>
								<md-slider
									labeled
									min="0.3"
									max="1"
									step="0.1"
									value="${this.action && this.action.name === 'play'
										? this.action.playbackRate
										: 1}"
									id="play-playbackrate"
								></md-slider>
							</label>
						</div>

						<div ?hidden=${this.tabIndex !== 1}>
							<md-list-item>
								<div slot="headline">Wait time</div>
							</md-list-item>

							<div class="flex">
								<md-filled-text-field
									type="number"
									value="${this.action && this.action.name === 'wait'
										? this.action.waitNumber
										: 10}"
									style="width:200px;"
									id="wait-number"
								>
								</md-filled-text-field>

								<md-filled-select
									menu-positioning="fixed"
									.value="${live(
										this.action && this.action.name === 'wait'
											? this.action.waitUnit
											: 's'
									)}"
									quick
									style="min-width:90px;"
									id="wait-unit"
								>
									<md-select-option value="s">
										<div slot="headline">s</div>
									</md-select-option>
									<md-select-option value="m">
										<div slot="headline">m</div>
									</md-select-option>
									<md-select-option value="h">
										<div slot="headline">h</div>
									</md-select-option>
								</md-filled-select>
							</div>
						</div>
						<div ?hidden=${this.tabIndex !== 2} class="w-full">
							<p style="color: var(--md-sys-color-primary)">
								Jump to the next audio in line.
							</p>
							<md-list-item
								@click=${(event: Event) => {
									this.loopCheckboxValue = !this.loopCheckboxValue;
								}}
								class="cursor-pointer"
							>
								<md-checkbox
									slot="start"
									?checked=${this.loopCheckboxValue}
									id="next-loop"
									@click=${(event: Event) => event.preventDefault()}
								></md-checkbox>
								<div slot="headline">Loop</div>

								<div slot="supporting-text">
									Automatically go back to first audio
								</div>
							</md-list-item>
						</div>
						<div ?hidden=${this.tabIndex !== 3}>
							<p style="color: var(--md-sys-color-primary)">
								Jump to a random audio in line.
							</p>
						</div>
					</div>
				</form>

				<div slot="actions">
					<md-text-button form="form" value="close">Cancel</md-text-button>
					<md-filled-button form="form" value="submit" @click=${this.#submit}>
						<md-icon slot="icon">build</md-icon>
						${this.action ? 'Update' : 'Create'}</md-filled-button
					>
				</div>
			</md-dialog>
		`;
	}

	show() {
		this.open = true;
		return this.formComplete;
	}

	$ = (s: string) => this.renderRoot.querySelector(s);
	$$ = (s: string) => this.renderRoot.querySelectorAll(s);

	#submit() {
		const actionName = Object.values(ActionName)[this.tabs.activeTabIndex];
		let action: ActionValue;

		switch (actionName) {
			case 'play':
				action = {
					name: 'play',
					playbackRate: (this.$('#play-playbackrate') as MdSlider).value!,
				};
				break;
			case 'wait':
				action = {
					name: 'wait',
					waitNumber: Number(
						(this.$('#wait-number') as MdOutlinedTextField).value
					),
					waitUnit: (this.$('#wait-unit') as MdOutlinedSelect)
						.value as WaitAction['waitUnit'],
				};
				break;

			case 'next':
				action = {
					name: 'next',
					loop: (this.$('#next-loop') as MdCheckbox).checked,
				};
				break;

			case 'random':
				action = {
					name: 'random',
				};
				break;
		}

		this.#closeResolve(action);
		// this.#closePromise = undefined;

		// this.open = false;
	}
}

// export const actionDialog = new ActionDialog();
