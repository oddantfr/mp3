import {ReactiveController} from '@snar/lit';
import {PropertyValueMap, PropertyValues, state} from 'snar';
import {saveToLocalStorage} from 'snar-save-to-local-storage';
import {playAudio} from './audio.js';

export type Mp3Item = {path: string[]; files: string[]; index: number};
export type Mp3Data = Mp3Item[];

@saveToLocalStorage('mp3:store')
class Mp3Store extends ReactiveController {
	data: Mp3Data = [];

	@state() cwd: string[] = [];
	@state() child: string[] = [];
	@state() mp3dir: Mp3Item | null = null;

	updated(changed: PropertyValues<this>) {
		if (changed.has('cwd')) {
			this.updateHash();

			const cwd = this.cwd.join('/');
			const matching = this.data.filter((item) => {
				return (
					item.path.length !== this.cwd.length &&
					item.path.join('/').startsWith(cwd)
				);
			});
			this.child = [
				...new Set(matching.map((item) => item.path[this.cwd.length])),
			];

			const mp3Dir = this.data.find((item) => item.path.join('/') === cwd);

			this.mp3dir = mp3Dir || null;
		}
	}

	async firstUpdated() {
		/**
		 * Because mp3dir was saved in the localstorage we need to
		 * reflect its state with the dynamic data.
		 */
		if (this.mp3dir) {
			const dir = this.mp3dir;
			const path = this.mp3dir.path.join('/');
			await this.fetchComplete;
			const project = this.data.find((item) => item.path.join('/') === path);
			if (project) {
				project.index = dir.index;
			}
		}
	}

	updateHash() {
		window.location.hash = this.cwd.join('/');
	}

	enter(dir: string) {
		this.cwd = [...this.cwd, dir];
		this.updateHash();
	}

	goUp() {
		if (this.cwd.length > 0) {
			this.cwd = this.cwd.slice(0, -1);
			this.updateHash();
		}
	}

	async playAudio(dir = this.mp3dir, playbackRate = 1) {
		if (dir) {
			await playAudio(
				`./files/${dir.path.join('/')}/${dir.files[dir.index]}`,
				playbackRate
			);
		}
	}

	previousAudioIndex(dir = this.mp3dir) {
		if (dir) {
			if (dir.index > 0) {
				dir.index--;
				this.requestUpdate('mp3dir');
			}
		}
	}
	nextAudioIndex(dir = this.mp3dir) {
		if (dir) {
			if (dir.index < dir.files.length) {
				dir.index++;
				this.requestUpdate('mp3dir');
			}
		}
	}

	pickRandomIndex() {
		if (this.mp3dir) {
			this.mp3dir.index = Math.floor(Math.random() * this.mp3dir.files.length);
			this.requestUpdate('mp3dir');
		}
	}

	async getTreeFromPath(path: string, recursive = true) {
		await this.fetchComplete;
		const tree = [];
		if (recursive) {
			tree.push(
				...this.data.filter((item) => item.path.join('/').startsWith(path))
			);
		} else {
			// If that's a project
			const root = this.data.find((item) => item.path.join('/') === path);
			if (root) {
				tree.push(root);
			}
		}
		return tree;
	}

	#fetchCompletePromise;
	get fetchComplete() {
		return this.#fetchCompletePromise;
	}

	constructor() {
		super();
		this.#fetchCompletePromise = fetchData().then((data) => {
			this.data = data;
			this.data.forEach((item) => (item.index = 0));
			this.requestUpdate('cwd');
			// console.log(this.data);
			return data;
		});
	}
}

export const mp3Store = new Mp3Store();

async function fetchData(): Promise<Mp3Data> {
	const r = await fetch('./mp3.json');
	return await r.json();
}
