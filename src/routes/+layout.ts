import type { LayoutLoad } from './$types';

const imports = import.meta.glob('$lib/chapters/**/*.svelte');
const base = '/src/lib/chapters';
const ext = '.svelte';

export const load: LayoutLoad = async () => {
	const slugs = Object.keys(imports).map((path) => path.replace(base, '').replace(ext, ''));
	return { slugs };
};

export const prerender = true;
