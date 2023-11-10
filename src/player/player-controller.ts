import {ReactiveController} from '@snar/lit';
import {PropertyValues, state} from 'snar';
import {ActionValue, Progressable} from './action.js';
import {saveToLocalStorage} from 'snar-save-to-local-storage';
import {Mp3Data, Mp3Item, mp3Store} from '../mp3-store.js';
import toastit from 'toastit';

const State = {
	STOPPED: 'stopped',
	PLAYING: 'playing',
	PAUSED: 'paused',
} as const;

type PlayerState = (typeof State)[keyof typeof State];

type PickItemInformation = {
	/** Project where the item belongs to */
	project: Mp3Item;
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
			} else if (action.name === 'play') {
				const info = this.getCurrentItemInfo()!;
				info.project.index = info.itemIndex;
				await mp3Store.playAudio(info.project);
				action.progress = 1;
			} else if (action.name === 'wait') {
				await new Promise((r) => setTimeout(r, action.waitNumber * 1000));
				action.progress = 1;
			} else if (action.name === 'random') {
				this.#randomPlayIndex();
				action.progress = 1;
			}
			await new Promise((r) => setTimeout(r, 1000));
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
		let find: Mp3Item | undefined;
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
