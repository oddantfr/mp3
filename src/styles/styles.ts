import {PropertyValues} from 'lit';
import {ThemeManager, setBaseStyles} from 'lit-with-styles';
import {state} from 'snar';
import {ReactiveController} from '@snar/lit';
import {saveToLocalStorage} from 'snar-save-to-local-storage';
import {
	applyTheme,
	themeFromSourceColor,
	applyThemeString,
} from '@vdegenne/material-color-helpers';
import sharedStyles from './shared.css?inline';
import documentStyles from './document.css?inline';
// import japaneseFonts from './japanese.css?inline';

setBaseStyles(sharedStyles);

// const documentSheet = new CSSStyleSheet();
// document.adoptedStyleSheets.push(documentSheet);
// documentSheet.replaceSync(documentStyles);
applyThemeString(document, documentStyles, 'documentStyles');
// applyThemeString(document, japaneseFonts, 'japaneseFonts');

export type ColorMode =
	(typeof ThemeManager.Mode)[keyof typeof ThemeManager.Mode];

@saveToLocalStorage('cmg:theme')
class ThemeStore extends ReactiveController {
	@state() colorMode: ColorMode = 'system';
	@state() themeColor = '#eabf00';

	updated(changed: PropertyValues) {
		if (changed.has('colorMode')) {
			ThemeManager.mode = this.colorMode;
		}
		const theme = themeFromSourceColor(
			this.themeColor,
			ThemeManager.appliedTheme === 'dark',
			'content',
			0
		);
		applyTheme(document, theme!);
	}

	toggleMode() {
		this.colorMode = ThemeManager.appliedTheme === 'dark' ? 'light' : 'dark';
	}
}

export const themeStore = new ThemeStore();
window
	.matchMedia('(prefers-color-scheme: dark)')
	.addEventListener('change', () => {
		themeStore.requestUpdate();
	});
window.onload = () => {
	ThemeManager.init();
};

export {sharedStyles as globalStyles};
