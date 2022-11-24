<script lang="ts">
	import { Canvas, assert, createProgram, loadShader } from '$lib';

	let gl: WebGL2RenderingContext;

	let destroy: () => void;

	let theProgram: WebGLProgram;

	async function initializeProgram() {
		const shaderList = await Promise.all([
			loadShader(gl.VERTEX_SHADER, 'vertex-colors.vert', 2),
			loadShader(gl.FRAGMENT_SHADER, 'vertex-colors.frag', 2)
		]);

		theProgram = createProgram(shaderList);
	}

	const vertexData = new Float32Array([
		// vertex positions
		...[0.0, 0.5, 0.0, 1.0],
		...[0.5, -0.366, 0.0, 1.0],
		...[-0.5, -0.366, 0.0, 1.0],
		// vertex colors
		...[1.0, 0.0, 0.0, 1.0],
		...[0.0, 1.0, 0.0, 1.0],
		...[0.0, 0.0, 1.0, 1.0]
	]);

	let vertexBufferObject: WebGLBuffer;
	let vao: WebGLVertexArrayObject;
	let positionAttribLocation: number;
	let colorAttribLocation: number;

	function initializeVertexBuffer() {
		const buffer = gl.createBuffer();
		assert(buffer);
		vertexBufferObject = buffer;

		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
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
		colorAttribLocation = gl.getAttribLocation(theProgram, 'color');
	}

	function display() {
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(theProgram);

		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.enableVertexAttribArray(colorAttribLocation);
		gl.vertexAttribPointer(positionAttribLocation, 4, gl.FLOAT, false, 0, 0);
		gl.vertexAttribPointer(colorAttribLocation, 4, gl.FLOAT, false, 0, 48);

		gl.drawArrays(gl.TRIANGLES, 0, 3);

		gl.disableVertexAttribArray(positionAttribLocation);
		gl.disableVertexAttribArray(colorAttribLocation);
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
