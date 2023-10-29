import {ReactiveController} from '@snar/lit';
import {state} from 'snar';
import {saveToLocalStorage} from 'snar-save-to-local-storage';

// @saveToLocalStorage('%project%:appstate')
export class AppState extends ReactiveController {
	@state() prop = 'foo';
}

export const appState = new AppState();
