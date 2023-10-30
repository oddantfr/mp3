import {installRouter} from 'pwa-helpers';
import {mp3Store} from './mp3-store.js';

installRouter((location) => {
	mp3Store.cwd = decodeURIComponent(location.hash.slice(1))
		.split('/')
		.filter((i) => i);
});
