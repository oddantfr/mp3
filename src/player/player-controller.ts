import {ReactiveController} from '@snar/lit';
import {PropertyValues, state} from 'snar';
import {ActionValue, Progressable} from './action.js';
import {saveToLocalStorage} from 'snar-save-to-local-storage';
import {mp3Store} from '../mp3-store.js';

const State = {
	STOPPED: 'stopped',
	PLAYING: 'playing',
	PAUSED: 'paused',
} as const;

type PlayerState = (typeof State)[keyof typeof State];

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

	@state() directory: string | null = null;

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
		}
	}

	async run() {
		while (this.playing) {
			const action = this.#getCurrentProgressableAction();
			if (!action) {
				this.#resetProgress();
			} else if (action.name === 'play') {
				await 
				console.log(action);
			}
			await new Promise((r) => setTimeout(r, 1000));
		}
	}

	play() {
		if (this.stopped) {
			this.directory = decodeURIComponent(mp3Store.cwd.join('/'));
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
