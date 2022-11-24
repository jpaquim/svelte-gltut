import { error } from '@sveltejs/kit';
import type { ChapterModule } from '$lib/chapters';
import type { PageLoad } from './$types';

const imports = import.meta.glob('$lib/chapters/**/*.svelte');
const base = '/src/lib/chapters';

export const load: PageLoad = async ({ params }) => {
	const slug = params.slug || '01/hello-triangle';
	const path = `${base}/${slug}.svelte`;
	if (path in imports) {
		const module = (await imports[path]()) as ChapterModule;
		const { default: component } = module;
		return { component };
	}
	throw error(404, 'Not found');
};
