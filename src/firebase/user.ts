import {ReactiveController} from '@snar/lit';
import {onAuthStateChanged} from 'firebase/auth';
// import toastit from 'toastit';
import {auth} from './firebase.js';
import type {User} from 'firebase/auth';
import {state} from 'snar';

interface UserCenter {
	user: User | null;
	isPremium: boolean;
}

class UserCenterSingleton extends ReactiveController implements UserCenter {
	@state() user: User | null = null;
	@state() isPremium: boolean = false;

	async updated() {
		console.log('User center updated.');
		if (this.user) {
			// console.log((await this.user.getIdTokenResult()).claims);
		}
	}

	get isConnected() {
		return !!this.user;
	}

	get isAuthorized() {
		return this.isConnected && this.isPremium;
	}

	async logout() {
		await auth.signOut();
		// toastit("You've been disconnected");
	}
}

export const userCenter = new UserCenterSingleton();

export let onAuthStateChangedComplete: Promise<User | null> =
	Promise.resolve(null);

onAuthStateChanged(auth, (user) => {
	onAuthStateChangedComplete = new Promise(async (resolve) => {
		let premium = false;
		if (user) {
			const jwt = await user.getIdTokenResult(true);
			premium = jwt.claims.authorized === true;
		}

		userCenter.user = user;
		userCenter.isPremium = premium;

		if (user) {
			// sentencesStore.startWatching();
		} else {
			// sentencesStore.stopWatching();
		}

		await userCenter.updateComplete;

		resolve(user);
	});
});
