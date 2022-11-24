<script lang="ts">
	import type { LayoutData } from './$types';
	import './styles.css';

	export let data: LayoutData;

	let header: HTMLElement;
	let visible = false;
</script>

<header bind:this={header} class:visible>
	<nav>
		<ol>
			{#each data.slugs as slug}
				{@const [, chapter, route] = slug.split('/')}
				<li><a href={slug}>ch {chapter} - {route}</a></li>
			{/each}
		</ol>
	</nav>
</header>

<slot />

<svelte:body
	on:click={(event) => {
		// toggle only on clicks outside <header> elements
		if (!(event.target instanceof Node && header.contains(event.target))) {
			visible = !visible;
		}
	}}
/>

<style>
	header {
		position: fixed;
		display: none;
	}

	header.visible {
		display: block;
	}

	ol {
		list-style: none;
	}

	a {
		color: #eee;
	}
</style>
