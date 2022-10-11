<script lang="ts">
	import { onMount } from 'svelte';
	import { assert, createResizer } from '$lib';

	export let init: () => void;

	export let display: () => void;

	export let reshape: (width: number, height: number) => void;

	export let keyboard: (key: number) => void;

	// type assertion to avoid
	export let gl = null as unknown as WebGL2RenderingContext;

	export let destroy = () => {};

	let canvas: HTMLCanvasElement;

	function keydown(event: KeyboardEvent) {
		keyboard(event.keyCode);
	}

	onMount(() => {
		const ctx = canvas.getContext('webgl2');
		assert(ctx);
		gl = ctx;

		init();

		const width = canvas.clientWidth * devicePixelRatio;
		const height = canvas.clientHeight * devicePixelRatio;

		const { disconnectObserver, resizeToDisplaySize } = createResizer(
			canvas,
			reshape,
			width,
			height
		);
		resizeToDisplaySize();
		reshape(width, height);

		let raf: number;

		(function loop() {
			resizeToDisplaySize();
			display();
			raf = requestAnimationFrame(loop);
		})();

		destroy = () => {
			cancelAnimationFrame(raf);
			disconnectObserver();
		};

		return destroy;
	});
</script>

<canvas bind:this={canvas} />

<svelte:window on:keydown={keydown} />

<style>
	canvas {
		width: 100%;
		height: 100%;
		image-rendering: crisp-edges;
	}
</style>
