import { assert } from './utils';

export function createResizer(
	canvas: HTMLCanvasElement,
	callback: (width: number, height: number) => void,
	width = 0,
	height = 0
) {
	const resizable = !width || !height;

	if (resizable) {
		width = canvas.clientWidth * devicePixelRatio;
		height = canvas.clientHeight * devicePixelRatio;
	}

	const canvasToDisplaySizeMap = new Map<Element, [number, number]>([[canvas, [width, height]]]);

	const resizeObserver = new ResizeObserver(
		resizable
			? (entries) => {
					for (const entry of entries) {
						const width = entry.devicePixelContentBoxSize[0].inlineSize;
						const height = entry.devicePixelContentBoxSize[0].blockSize;
						const displayWidth = Math.round(width);
						const displayHeight = Math.round(height);
						canvasToDisplaySizeMap.set(entry.target, [displayWidth, displayHeight]);
						callback(displayWidth, displayHeight);
					}
			  }
			: () => callback(width, height)
	);

	resizeObserver.observe(canvas, { box: 'content-box' });

	return {
		initial: { width, height },
		disconnectObserver(): void {
			resizeObserver.disconnect();
		},
		resizeToTarget(): boolean {
			// Get the size the browser is displaying the canvas in device pixels.
			const sizeMapSize = canvasToDisplaySizeMap.get(canvas);
			assert(sizeMapSize);
			const [targetWidth, targetHeight] = sizeMapSize;

			// Check if the canvas is not the same size.
			const needResize = canvas.width !== targetWidth || canvas.height !== targetHeight;

			if (needResize) {
				// Make the canvas the same size
				canvas.width = targetWidth;
				canvas.height = targetHeight;
			}

			return needResize;
		}
	};
}
