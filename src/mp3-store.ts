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

			const mp3Dir = this.data.find((item) => {
				console.log(cwd, item.path.join('/'));
				return item.path.join('/') === cwd;
			});

			this.mp3dir = mp3Dir || null;
			console.log(this.mp3dir);
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

	async playAudio() {
		if (this.mp3dir) {
			await playAudio(
				`./files/${this.mp3dir.path.join('/')}/${
					this.mp3dir.files[this.mp3dir.index]
				}`,

				1
			);
		}
	}

	previousAudioIndex() {
		if (this.mp3dir) {
			if (this.mp3dir.index > 0) {
				this.mp3dir.index--;
				this.requestUpdate('mp3dir');
			}
		}
	}
	nextAudioIndex() {
		if (this.mp3dir) {
			if (this.mp3dir.index < this.mp3dir.files.length) {
				this.mp3dir.index++;
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

	constructor() {
		super();
		fetchData().then((data) => {
			this.data = data;
			this.data.forEach((item) => (item.index = 0));
			this.requestUpdate('cwd');
			// console.log(this.data);
		});
	}
}

export const mp3Store = new Mp3Store();

async function fetchData() {
	try {
		const r = await fetch('./mp3.json');
		return await r.json();
	} catch (e) {}
}
