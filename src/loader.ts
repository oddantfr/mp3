import './styles/styles.js';
import {AppShell} from './app-shell/app-shell.js';
// import './firebase/firebase.js';
// import './firebase/user.js';
import './global-events.js';
import './material.js';
import './mp3-store.js';

export const app = new AppShell();

document.body.prepend(app);
