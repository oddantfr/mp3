/**
 * @license
 * Copyright (c) 2023 Valentin Degenne
 * SPDX-License-Identifier: MIT
 *
 *
 * This module is used to store server time (firestore timestamp) locally.
 * The following google cloud function needs to be available for this module to work.
 * Values are saved locally if they don't exist,
 * the function `getSyncNow()` can then be used to get the remote current time.
 *
 * ```javascript
 * const {Timestamp} = require('firebase-admin/firestore');
 * const {onCall} = require('firebase-functions/v2/https');
 *
 * exports.getservertime = onCall(() => {
 *   return Timestamp.now().toMillis()
 * });
 * ```
 */
import {httpsCallable} from 'firebase/functions';
import {functions} from './firebase.js';
import {ReactiveObject, state} from 'snar';
import {saveToLocalStorage} from 'snar-save-to-local-storage';

// const functions = getFunctions();
// connectFunctionsEmulator(functions, '192.168.1.168', 5001);
const getServerTime = httpsCallable(functions, 'getservertime');

@saveToLocalStorage('server-time')
class ServerTime extends ReactiveObject {
	@state() remoteTime: number | undefined = undefined;
	@state() private localTime?: number = undefined;
	@state() private timeDifference?: number = undefined;

	private _readyPromise: Promise<unknown> = Promise.resolve(false);

	firstUpdated() {
		if (!this.remoteTime) this.requestRemoteTimeUpdate();
	}

	requestRemoteTimeUpdate() {
		this._readyPromise = this.performRemoteTimeUpdate();
	}

	protected async performRemoteTimeUpdate() {
		this.remoteTime = (await getServerTime()).data as number;
		this.updateLocalValues();
		return true;
	}

	updateLocalValues() {
		this.localTime = Date.now();
		this.timeDifference = this.localTime - this.remoteTime!;
	}

	get isReady() {
		return this._readyPromise;
	}

	async getSyncNow() {
		await this.isReady;

		return Date.now() + this.timeDifference!;
	}
}

export const serverTime = new ServerTime();
