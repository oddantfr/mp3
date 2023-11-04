import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {withStyles} from 'lit-with-styles';
import styles from './app-shell.css?inline';
import '@material/mwc-top-app-bar';
import {mp3Store} from '../mp3-store.js';
import {withController} from '@snar/lit';
import {settingsDialog} from '../settings-dialog/settings-dialog.js';

@customElement('app-shell')
@withStyles(styles)
// @ts-ignore
@withController(mp3Store)
export class AppShell extends LitElement {
	render() {
		return html`
				<div id="path" class="py-2 px-3">
					/${decodeURIComponent(mp3Store.cwd.join('/'))}
				</div>
				<header>
					<span>${mp3Store.cwd[mp3Store.cwd.length - 1] ?? 'root'}</span>

					<md-icon-button @click=${() => (settingsDialog.open = true)}>
						<md-icon>settings</md-icon>
					</md-icon-button>
				</header>
				<div class="flex-1 flex flex-col">

					<md-list>
						<md-list-item
							type="button"
							@click=${(event: PointerEvent) => {
								mp3Store.goUp();
							}}
						>
							<div slot="headline">..</div>
						</md-list-item>
						${mp3Store.child.map((item) => {
							return html`
								<md-list-item
									type="button"
									@click=${() => {
										mp3Store.enter(item);
									}}
								>
									<md-icon slot="start">folder</md-icon>
									<div slot="headline">${item}</div>
								</md-list-item>
							`;
						})}
					</md-list>

					<md-divider inset></md-divider>

					<!-- ${mp3Store.mp3dir?.files.length} audio files. -->

					<div id="content" class="flex-1 relative">
						<div
							id="content-wrapper"
							class="absolute inset-0 flex flex-col justify-center items-center"
						>
						${
							mp3Store.mp3dir
								? html`
										<div style="">
											<div class="flex items-center">
												<md-icon-button
													touch-target="wrapper"
													?disabled=${mp3Store.mp3dir?.index === 0}
													@click=${() => mp3Store.previousAudioIndex()}
												>
													<md-icon>arrow_back</md-icon>
												</md-icon-button>
												${mp3Store.mp3dir?.files[mp3Store.mp3dir.index]}
												<md-icon-button
													touch-target="wrapper"
													?disabled=${mp3Store.mp3dir?.index ===
													mp3Store.mp3dir.files.length - 1}
													@click=${() => mp3Store.nextAudioIndex()}
												>
													<md-icon>arrow_forward</md-icon>
												</md-icon-button>
											</div>
											<md-icon-button
												touch-target="wrapper"
												@click=${() => mp3Store.playAudio()}
											>
												<md-icon>volume_up</md-icon>
											</md-icon-button>
											<md-icon-button
												touch-target="wrapper"
												@click=${() => mp3Store.pickRandomIndex()}
											>
												<md-icon>casino</md-icon>
											</md-icon-button>
										</div>
								  `
								: html`nope`
						}
							</div>
					</div>

					${mp3Store.data.map((item) => {
						return html` <div></div> `;
					})}
				</div>
			</mwc-top-app-bar>
		`;
	}
}
