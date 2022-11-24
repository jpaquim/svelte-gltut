import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

type TutorialModule = typeof import('$lib/tutorials/hello-triangle.svelte');

const imports = import.meta.glob('$lib/tutorials/*.svelte');

export const load: PageLoad = async ({ params }) => {
	const slug = params.slug || 'hello-triangle';
	const path = `/src/lib/tutorials/${slug}.svelte`;
	if (path in imports) {
		const module = (await imports[path]()) as TutorialModule;
		const { default: component } = module;
		return { component };
	}
	throw error(404, 'Not found');
};
