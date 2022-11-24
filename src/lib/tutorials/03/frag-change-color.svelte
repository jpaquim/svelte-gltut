<script lang="ts">
	import { Canvas, assert, createProgram, loadShader } from '$lib';

	let gl: WebGL2RenderingContext;

	let destroy: () => void;

	let theProgram: WebGLProgram;
	let elapsedTimeUniform: WebGLUniformLocation;
	let positionAttribLocation: number;

	async function initializeProgram() {
		const shaderList = await Promise.all([
			loadShader(gl.VERTEX_SHADER, 'calc-offset.vert', 3),
			loadShader(gl.FRAGMENT_SHADER, 'calc-color.frag', 3)
		]);

		theProgram = createProgram(shaderList);

		positionAttribLocation = gl.getAttribLocation(theProgram, 'position');

		const elapsedTimeUniformLocation = gl.getUniformLocation(theProgram, 'time');
		assert(elapsedTimeUniformLocation);
		elapsedTimeUniform = elapsedTimeUniformLocation;

		const loopDurationUniform = gl.getUniformLocation(theProgram, 'loopDuration');
		assert(loopDurationUniform);

		const fragLoopDurUniform = gl.getUniformLocation(theProgram, 'fragLoopDuration');
		assert(fragLoopDurUniform);

		gl.useProgram(theProgram);
		gl.uniform1f(loopDurationUniform, 5);
		gl.uniform1f(fragLoopDurUniform, 10);
		gl.useProgram(null);
	}

	const vertexPositions = new Float32Array([
		0.25, 0.25, 0.0, 1.0, 0.25, -0.25, 0.0, 1.0, -0.25, -0.25, 0.0, 1.0
	]);

	let positionBufferObject: WebGLBuffer;
	let vao: WebGLVertexArrayObject;

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
	}

	const startTime = Date.now();

	function display() {
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(theProgram);

		gl.uniform1f(elapsedTimeUniform, (Date.now() - startTime) / 1000);

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
