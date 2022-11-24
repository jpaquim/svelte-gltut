<script lang="ts">
	import { Canvas, assert, createProgram, loadShader } from '$lib';

	let gl: WebGL2RenderingContext;

	let destroy: () => void;

	let theProgram: WebGLProgram;

	async function initializeProgram() {
		const shaderList = await Promise.all([
			loadShader(gl.VERTEX_SHADER, 'standard.vert', 3),
			loadShader(gl.FRAGMENT_SHADER, 'standard.frag', 3)
		]);

		theProgram = createProgram(shaderList);
	}

	const vertexPositions = new Float32Array([
		0.25, 0.25, 0.0, 1.0, 0.25, -0.25, 0.0, 1.0, -0.25, -0.25, 0.0, 1.0
	]);

	let positionBufferObject: WebGLBuffer;
	let vao: WebGLVertexArrayObject;
	let positionAttribLocation: number;

	function initializeVertexBuffer() {
		const buffer = gl.createBuffer();
		assert(buffer);
		positionBufferObject = buffer;

		gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STREAM_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	async function init() {
		await initializeProgram();
		initializeVertexBuffer();

		const vertexArray = gl.createVertexArray();
		assert(vertexArray);
		vao = vertexArray;
		gl.bindVertexArray(vao);

		positionAttribLocation = gl.getAttribLocation(theProgram, 'position');
	}

	const startTime = Date.now();

	function computePositionOffsets() {
		const loopDuration = 5;
		const scale = (2 * Math.PI) / loopDuration;

		const elapsedTime = (Date.now() - startTime) / 1000;
		const currTimeThroughLoop = elapsedTime % loopDuration;

		return [
			Math.cos(currTimeThroughLoop * scale) * 0.5,
			Math.sin(currTimeThroughLoop * scale) * 0.5
		];
	}

	function adjustVertexData(xOffset: number, yOffset: number) {
		const newData = new Float32Array(vertexPositions);

		for (let iVertex = 0; iVertex < vertexPositions.length; iVertex += 4) {
			newData[iVertex] += xOffset;
			newData[iVertex + 1] += yOffset;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferObject);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, newData);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	function display() {
		const [xOffset, yOffset] = computePositionOffsets();
		adjustVertexData(xOffset, yOffset);

		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(theProgram);

		gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferObject);
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.vertexAttribPointer(positionAttribLocation, 4, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 3);

		gl.disableVertexAttribArray(positionAttribLocation);
		gl.useProgram(null);
	}

	function reshape(width: number, height: number) {
		gl.viewport(0, 0, width, height);
	}

	function keyboard(key: number) {
		switch (key) {
			case 27:
				destroy();
				break;
		}
	}
</script>

<Canvas bind:gl bind:destroy width={500} height={500} {init} {reshape} {display} {keyboard} />
