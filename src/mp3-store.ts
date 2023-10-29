import {ReactiveController} from '@snar/lit';
import {PropertyValueMap, PropertyValues, state} from 'snar';
import {saveToLocalStorage} from 'snar-save-to-local-storage';

export type Mp3Item = {path: string[]; files: string[]};
export type Mp3Data = Mp3Item[];

// @saveToLocalStorage('controllername')
class Mp3Store extends ReactiveController {
	@state() data: Mp3Data = [];

	constructor() {
		super();
		fetchData().then((data) => {
			this.data = data;
			console.log(this.data);
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
