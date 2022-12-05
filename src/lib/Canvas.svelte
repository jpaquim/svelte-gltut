<script lang="ts">
	import { onMount } from 'svelte';
	import { assert, createResizer, setContext } from '$lib';

	export let init: () => void | Promise<void>;

	export let display: () => void;

	export let reshape: (width: number, height: number) => void;

	export let keyboard: ((keyCode: number) => void) | ((keyCode: number, key: string) => void);

	export let width = 0;
	export let height = 0;

	// set to null to avoid svelte missing prop warning, force type assertion
	export let gl = null as unknown as WebGL2RenderingContext;

	export let destroy = () => {};

	let canvas: HTMLCanvasElement;

	function keydown(event: KeyboardEvent) {
		keyboard(event.keyCode, event.key);
	}

	onMount(() => {
		const ctx = canvas.getContext('webgl2');
		assert(ctx);
		gl = ctx;

		setContext(gl);

		const { disconnectObserver, resizeToTarget, initial } = createResizer(
			canvas,
			reshape,
			width,
			height
		);
		resizeToTarget();
		reshape(initial.width, initial.height);

		const promise = init();

		const start = promise instanceof Promise ? promise.then.bind(promise) : requestAnimationFrame;

		let raf: number;

		function loop() {
			resizeToTarget();
			display();
			raf = requestAnimationFrame(loop);
		}

		start(loop);

		return (destroy = () => {
			cancelAnimationFrame(raf);
			disconnectObserver();
		});
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
