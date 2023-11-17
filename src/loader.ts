import './styles/styles.js';
import {AppShell} from './app-shell/app-shell.js';
// import './firebase/firebase.js';
// import './firebase/user.js';
import './global-events.js';
import './mp3-store.js';
import './router.js';
import '@material/web/all.js';
import '@material/web/chips/chip-set.js';
import {MdDialog, MdOutlinedField, MdPrimaryTab} from '@material/web/all.js';
import {css} from 'lit';

export const app = new AppShell();

document.body.prepend(app);

// MdDialog.shadowRootOptions.delegatesFocus = false;

// @ts-ignore
MdDialog.addInitializer(async (instance: MdDialog) => {
	await instance.updateComplete;
	instance.dialog.prepend(instance.scrim);
	instance.scrim.style.inset = 0;
	instance.scrim.style.zIndex = -1;

	const {getOpenAnimation, getCloseAnimation} = instance;
	instance.getOpenAnimation = () => {
		const animations = getOpenAnimation.call(this);
		animations.container = [...animations.container, ...animations.dialog];
		animations.dialog = [];
		return animations;
	};
	instance.getCloseAnimation = () => {
		const animations = getCloseAnimation.call(this);
		animations.container = [...animations.container, ...animations.dialog];
		animations.dialog = [];
		return animations;
	};
});

MdOutlinedField.elementStyles.push(css`
	.container-overflow {
		background-color: var(
			--md-outlined-text-field-container-color,
			var(--md-sys-color-surface-container)
		);
	}
`);

MdPrimaryTab.elementStyles.push(css`
	md-elevation {
		display: none;
	}
`);
