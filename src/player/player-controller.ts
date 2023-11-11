import {ReactiveController} from '@snar/lit';
import {PropertyValues, state} from 'snar';
import {ActionValue, Progressable} from './action.js';
import {saveToLocalStorage} from 'snar-save-to-local-storage';
import {Mp3Data, Mp3Item, mp3Store} from '../mp3-store.js';
import toastit from 'toastit';
import {ms} from '../utils.js';
import {TICK} from '../constants.js';
import {playerUI} from './player-ui.js';
import {abortPlayingAudio} from '../audio.js';

const State = {
	STOPPED: 'stopped',
	PLAYING: 'playing',
	PAUSED: 'paused',
} as const;

type PlayerState = (typeof State)[keyof typeof State];

type PickItemInformation = {
	/** Project where the item belongs to */
	project?: Mp3Item;
	/** Index of the item in the files list */
	itemIndex: number;
	/** Item value */
	item: string;
};

@saveToLocalStorage('mp3:player')
class PlayerController extends ReactiveController {
	/* options */
	@state() recursive = false;
	@state() actions: (ActionValue & Progressable)[] = [];
	@state() updatedTime = Date.now();

	@state() state: PlayerState = State.STOPPED;
	get playing() {
		return this.state === State.PLAYING;
	}
	get paused() {
		return this.state === State.PAUSED;
	}
	get stopped() {
		return this.state === State.STOPPED;
	}

	@state() dirpath: string | null = null;

	#projects: Mp3Data = [];
	@state() playIndex = 1;

	#getCurrentProgressableAction() {
		return this.actions.find((a) => a.progress !== 1);
	}
	#resetProgress() {
		this.actions.forEach((a) => delete a.progress);
		this.touch();
	}

	pushAction(action: ActionValue) {
		console.log(action);
		this.actions = [...this.actions, action];
	}

	removeAction(action: ActionValue) {
		this.actions.splice(this.actions.indexOf(action) >>> 0, 1);
		this.requestUpdate();
	}

	touch() {
		this.updatedTime = Date.now();
	}

	updated(changed: PropertyValues<this>) {
		if (changed.has('state')) {
			if (this.playing) {
				this.run();
			}
			if (this.paused || this.stopped) {
				abortPlayingAudio();
			}
		}
	}

	async firstUpdated() {
		if (this.playing) {
			this.pause();
		}

		if (this.paused) {
			const items = (await this.loadProjects()) ?? [];
			if (items.length === 0) {
				toastit('No items to play');
				this.stop();
				return;
			}
		}
	}

	async run() {
		while (this.playing) {
			const action = this.#getCurrentProgressableAction();
			if (!action) {
				this.#resetProgress();
				continue;
			}
			if (action.name === 'play') {
				const info = this.getCurrentItemInfo()!;
				if (info.project === undefined) {
					throw new Error('Something went wrong.');
				}
				info.project.index = info.itemIndex;
				// Project object changed so we update the mp3 store
				// to persist the current item index between refreshes.
				mp3Store.requestUpdate();
				try {
					await mp3Store.playAudio(info.project, action.playbackRate);
				} catch (e) {
					// Was aborted. Make sure we leave the loop.
					return;
				}
				action.progress = 1;
			}
			if (action.name === 'wait') {
				const timeMs = ms(`${action.waitNumber}${action.waitUnit}`);
				console.log(action, timeMs);
				const pace = 1 / (timeMs / TICK);
				if (action.progress === undefined) {
					action.progress = 0;
					this.touch();
					await new Promise((r) => setTimeout(r, 500));
				}
				action.progress += pace;
				// Make sure we don't go out of bound
				// and also making it seems like it's 1 so
				// the circular progress can catch up with this value.
				if (action.progress >= 1) {
					action.progress = 0.99999999;
					this.touch();
					setTimeout(() => {
						if (!this.playing) {
							return;
						}
						action.progress = 1;
						this.touch();
					}, 500);
				}
			}
			if (action.name === 'random') {
				this.#randomPlayIndex();
				action.progress = 1;
			}
			if (action.name === 'next') {
				this.playIndex++;
				// Here we check if we are not out of bound
				const info = this.getCurrentItemInfo()!;
				if (info === undefined || info.project === undefined) {
					if (action.loop) {
						this.playIndex = 0;
					} else {
						toastit('All audios were played.');
						this.stop();
						return;
					}
				}
				action.progress = 1;
			}
			this.touch();
			await new Promise((r) => setTimeout(r, TICK));
		}
	}

	#randomPlayIndex() {
		const total = this.#projects.flatMap((p) => p.files).length;
		this.playIndex = Math.floor(Math.random() * total);
	}

	getCurrentItemInfo() {
		return this.#getItemInfoAt(this.playIndex);
	}

	#getItemInfoAt(index: number): PickItemInformation | undefined {
		let info: PickItemInformation | undefined = undefined;
		let acc = 0;
		for (let project of this.#projects) {
			const size = project.files.length;
			const start = acc;
			acc += size;
			const end = acc - 1;
			if (index >= start && index <= end) {
				const itemIndex = index - start;
				info = {
					project,
					itemIndex,
					item: project.files[itemIndex],
				};
				info.project = project;
				break;
			}
		}

		return info;
	}

	async loadProjects() {
		if (this.dirpath !== null) {
			return (this.#projects = (await mp3Store.getTreeFromPath(
				this.dirpath,
				this.recursive
			))!);
		}
	}

	async play() {
		if (this.stopped) {
			this.dirpath = decodeURIComponent(mp3Store.cwd.join('/'));
			const items = (await this.loadProjects()) ?? [];
			if (items.length === 0) {
				toastit('No items to play');
				return;
			}
			// Initialize with the current item in the first project
			// which is usually the project being opened atm.
			this.playIndex = items[0].index;
			this.state = 'playing';
		}
	}

	resume() {
		if (this.paused) {
			this.state = 'playing';
		}
	}

	pause() {
		if (this.playing) {
			this.state = 'paused';
		}
	}

	stop() {
		this.state = 'stopped';
		this.#resetProgress();
	}

	togglePlay() {
		if (this.playing || this.paused) {
			this.stop();
		} else if (this.stopped) {
			this.play();
		}
	}

	togglePause() {
		if (this.playing) {
			this.pause();
		} else if (this.paused) {
			this.resume();
		}
	}
}

export const playerController = new PlayerController();
