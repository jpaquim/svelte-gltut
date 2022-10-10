export function assert<T>(
	value: T,
	message = `Assert failed: ${value}`
): asserts value is NonNullable<T> {
	if (value === null || value === undefined) {
		throw new Error(message);
	}
}

export function createResizer(
	canvas: HTMLCanvasElement,
	callback: (width: number, height: number) => void,
	width = 500,
	height = 500
) {
	const canvasToDisplaySizeMap = new Map<Element, [number, number]>([[canvas, [width, height]]]);

	const resizeObserver = new ResizeObserver((entries) => {
		for (const entry of entries) {
			const width = entry.devicePixelContentBoxSize[0].inlineSize;
			const height = entry.devicePixelContentBoxSize[0].blockSize;
			const displayWidth = Math.round(width);
			const displayHeight = Math.round(height);
			canvasToDisplaySizeMap.set(entry.target, [displayWidth, displayHeight]);
			callback(displayWidth, displayHeight);
		}
	});

	resizeObserver.observe(canvas, { box: 'content-box' });

	return {
		disconnectObserver(): void {
			resizeObserver.disconnect();
		},
		resizeToDisplaySize(): boolean {
			// Get the size the browser is displaying the canvas in device pixels.
			const sizeMapSize = canvasToDisplaySizeMap.get(canvas);
			assert(sizeMapSize);
			const [displayWidth, displayHeight] = sizeMapSize;

			// Check if the canvas is not the same size.
			const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

			if (needResize) {
				// Make the canvas the same size
				canvas.width = displayWidth;
				canvas.height = displayHeight;
			}

			return needResize;
		}
	};
}
