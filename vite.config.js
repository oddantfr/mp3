import {defineConfig} from 'vite';
// import {viteSingleFile} from 'vite-plugin-singlefile';
// import {minify as minifyHtml} from 'html-minifier-terser';
// import minifyLiterals from 'rollup-plugin-minify-template-literals';
// import {VitePWA} from 'vite-plugin-pwa';
// import {mdIconLocalize} from 'rollup-plugin-md-icon-localize';

const DEV = process.env.NODE_ENV == 'development';

const minify = {
	name: 'minify final index',
	apply: 'build',
	transform(src, id) {
		if (/index.html$/.test(id)) {
			return {
				code: minifyHtml(src, {
					collapseWhitespace: true,
					minifyCSS: true,
					minifyJS: true,
					removeComments: true,
				}),
				map: null,
			};
		}
	},
};

export default defineConfig({
	base: './',
	//   server: {
	//     hmr: false,
	//   },
	build: {
		// outDir: 'docs',
		assetsInlineLimit: 6000,
		// emptyOutDir: false,
	},
	esbuild: {
		legalComments: 'external',
	},
	plugins: [
		...(!DEV ? [minifyLiterals()] : []),

		...(!DEV ? [minify] : []),

		// mdIconLocalize({
		// 	include: [
		// 		'./src/**/*.ts',
		// 		'./node_modules/@vdegenne/material-color-helpers/lib/elements/**/*.js',
		// 	],
		// }),

		// ...(!DEV
		// 	? [
		// 			viteSingleFile({
		// 				useRecommendedBuildConfig: false,
		// 			}),
		// 	  ]
		// 	: []),

		// VitePWA({
		// 	registerType: 'autoUpdate',
		// 	includeAssets: ['*.png', 'fonts/**/*.otf'],
		// 	manifest: {
		// 		icons: [
		// 			{
		// 				src: 'pwa-64x64.png',
		// 				sizes: '64x64',
		// 				type: 'image/png',
		// 			},
		// 			{
		// 				src: 'pwa-192x192.png',
		// 				sizes: '192x192',
		// 				type: 'image/png',
		// 			},
		// 			{
		// 				src: 'pwa-512x512.png',
		// 				sizes: '512x512',
		// 				type: 'image/png',
		// 				purpose: 'any',
		// 			},
		// 			{
		// 				src: 'maskable-icon-512x512.png',
		// 				sizes: '512x512',
		// 				type: 'image/png',
		// 				purpose: 'maskable',
		// 			},
		// 		],
		// 	},
		// }),

		// terser(),
		// basicSSL(),
	],
});
