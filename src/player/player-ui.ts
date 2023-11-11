import {LitElement, TemplateResult, css, html, nothing} from 'lit';
import {state} from 'lit/decorators.js';
import {customElement} from 'custom-element-decorator';
import {withController} from '@snar/lit';
import {playerController} from './player-controller.js';
import {withStyles} from 'lit-with-styles';
import {materialConfirm, materialPrompt} from 'material-3-prompt-dialog';
import {ActionDialog} from './action-dialog.js';
import styles from './player-ui.css?inline';

@customElement({name: 'player-ui', inject: true})
@withStyles(styles)
// @ts-ignore
@withController(playerController)
export class PlayerUI extends LitElement {
	@state() open = false;

	render() {
		return html`
			<md-dialog ?open=${this.open} @closed=${() => (this.open = false)}>
				<div slot="headline" class="justify-between">
					<span>Player</span>
					<md-icon-button form="form">
						<md-icon>close</md-icon>
					</md-icon-button>
				</div>

				<form slot="content" method="dialog" id="form">
					<md-list-item
						@click=${() => {
							playerController.recursive = !playerController.recursive;
						}}
						style="cursor:pointer"
						?disabled=${!playerController.stopped}
						?inert=${!playerController.stopped}
					>
						<div slot="headline">Recursive</div>

						<md-switch
							slot="end"
							@click=${(event: Event) => event.preventDefault()}
							?selected=${playerController.recursive}
							icons
						>
						</md-switch>
					</md-list-item>

					<md-divider class="mt-1"></md-divider>

					<h4 class="mb-0">Sequence</h4>

					<div
						style="min-height:100px;display:flex;justify-content:center;align-items:center;"
					>
						${playerController.actions.length
							? html`
									<md-chip-set id="sequence-chip-set">
										${playerController.actions.map((action) => {
											let label = '';
											let icon: TemplateResult | string = '';
											if (action.name === 'play') {
												label = `${action.name} (${action.playbackRate})`;
												icon = html`<md-icon slot="icon">play_arrow</md-icon>`;
											}
											if (action.name === 'wait') {
												label = `${action.name} (${action.waitNumber}${action.waitUnit})`;
												icon = html`<md-icon slot="icon">hourglass</md-icon>`;
											}
											if (action.name === 'next') {
												label = `${action.name}${action.loop ? ' (loop)' : ''}`;
												icon = html`<md-icon slot="icon">start</md-icon>`;
											}
											if (action.name === 'random') {
												label = `${action.name}`;
												icon = html`<md-icon slot="icon">casino</md-icon>`;
											}

											return html`
												<md-filter-chip
													label=${label}
													removable
													?selected=${action.progress === 1}
													?disabled=${!playerController.stopped}
													?inert=${!playerController.stopped}
													@click=${async (event: Event) => {
														event.preventDefault();
														const dialog = new ActionDialog(action);
														try {
															const _action = await dialog.show();
															Object.assign(action, _action);
															playerController.touch();
														} catch (e) {}
													}}
													@remove=${async (event: Event) => {
														event.preventDefault();
														try {
															await materialConfirm({
																headline: 'Remove action?',
																content: html`<span>
																		This will remove the following action:
																	</span>
																	<b>${label}</b>`,
															});

															playerController.removeAction(action);
														} catch (e) {}
													}}
												>
													${action.progress !== undefined &&
													action.progress >= 0 &&
													action.progress < 1
														? html`
																<md-circular-progress
																	slot="icon"
																	value=${action.progress}
																	style="--md-circular-progress-size: 20px;"
																></md-circular-progress>
														  `
														: icon}
												</md-filter-chip>
											`;
										})}
									</md-chip-set>
							  `
							: html`<i>No defined actions.</i>`}
					</div>

					<md-chip-set class="mt-4">
						<md-assist-chip
							label="new action"
							?disabled=${!playerController.stopped}
							?inert=${!playerController.stopped}
							elevated
							@click=${async (event: Event) => {
								try {
									const _action = await new ActionDialog().show();
									playerController.pushAction(_action);
								} catch (e) {}
							}}
						>
							<md-icon slot="icon">add</md-icon>
						</md-assist-chip>
						${playerController.actions.length > 0
							? html`
									<md-assist-chip
										label="reset"
										?disabled=${!playerController.stopped}
										?inert=${!playerController.stopped}
										elevated
										@click=${async (event: Event) => {
											try {
												await materialConfirm({
													content: 'You are about to remove all actions!',
												});
												playerController.actions = [];
											} catch (e) {}
										}}
									>
										<md-icon slot="icon">restart_alt</md-icon>
									</md-assist-chip>
							  `
							: nothing}
					</md-chip-set>

					<div id="banner" ?invisible=${playerController.stopped}>
						Playing from /${playerController.dirpath}
					</div>
				</form>

				<div slot="actions">
					${playerController.playing || playerController.paused
						? html`
								<md-outlined-button
									form=""
									@click=${() => playerController.togglePause()}
								>
									${playerController.playing
										? html` <md-icon slot="icon">pause</md-icon>Pause`
										: html` <md-icon slot="icon">play_arrow</md-icon>Resume`}
								</md-outlined-button>
						  `
						: nothing}

					<md-filled-button
						form=""
						?disabled=${playerController.actions.length === 0}
						@click=${() => playerController.togglePlay()}
					>
						${playerController.playing || playerController.paused
							? html` <md-icon slot="icon">stop</md-icon>Stop`
							: html` <md-icon slot="icon">play_arrow</md-icon>Play`}
					</md-filled-button>
				</div>
			</md-dialog>
		`;
	}
}

export const playerUI = new PlayerUI();
