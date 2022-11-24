import { error } from '@sveltejs/kit';
import type { TutorialModule } from '$lib/tutorials';
import type { PageLoad } from './$types';

const imports = import.meta.glob('$lib/tutorials/**/*.svelte');
const base = '/src/lib/tutorials';

export const load: PageLoad = async ({ params }) => {
	const slug = params.slug || '01/hello-triangle';
	const path = `${base}/${slug}.svelte`;
	if (path in imports) {
		const module = (await imports[path]()) as TutorialModule;
		const { default: component } = module;
		return { component };
	}
	throw error(404, 'Not found');
};
