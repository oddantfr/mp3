import { themeStore } from "./styles/styles.js";

window.addEventListener('keydown', (e) => {
	if (e.altKey || e.ctrlKey) {
		return;
	}
	const target = e.composedPath()[0] as Element;
	if (['TEXTAREA', 'INPUT'].includes(target.tagName)) {
		return;
	}
	if (e.key === 'd') {
		themeStore.toggleMode();
	}
});
