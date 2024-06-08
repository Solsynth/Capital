/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	daisyui: {
		themes: [
			{
				light: {
					"primary": "#3F51B5",
					"secondary": "#0091EA",
					"accent": "#00BFA5",
					"neutral": "#2c323b",
					"base-100": "#f3f4f6",
					"info": "#0091EA",
					"success": "#00C853",
					"warning": "#FF6D00",
					"error": "#D50000",
				},
				dark: {
					"primary": "#3F51B5",
					"secondary": "#0091EA",
					"accent": "#00BFA5",
					"neutral": "#2c323b",
					"base-100": "#1e2329",
					"info": "#0091EA",
					"success": "#00C853",
					"warning": "#FF6D00",
					"error": "#D50000",
				}
			}
		],
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('daisyui'),
	],
};

