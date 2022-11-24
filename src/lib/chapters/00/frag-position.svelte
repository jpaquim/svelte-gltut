<script lang="ts">
	import { Canvas, assert, createProgram, loadShader } from '$lib';

	let gl: WebGL2RenderingContext;

	let destroy: () => void;

	let theProgram: WebGLProgram;
	let heightUniform: WebGLUniformLocation;

	const width = 500;
	const height = 500;

	async function initializeProgram() {
		const shaderList = await Promise.all([
			loadShader(gl.VERTEX_SHADER, 'frag-position.vert', 2),
			loadShader(gl.FRAGMENT_SHADER, 'frag-position.frag', 0)
		]);

		theProgram = createProgram(shaderList);

		const heightUniformLocation = gl.getUniformLocation(theProgram, 'height');
		assert(heightUniformLocation);
		heightUniform = heightUniformLocation;
		gl.useProgram(theProgram);
		gl.uniform1i(heightUniformLocation, height);
		gl.useProgram(null);
	}

	const vertexData = new Float32Array([0.75, 0.75, 0, 1, 0.75, -0.75, 0, 1, -0.75, -0.75, 0, 1]);

	let vertexBufferObject: WebGLBuffer;
	let vao: WebGLVertexArrayObject;
	let positionAttribLocation: number;

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
	}

	function display() {
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(theProgram);

		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.vertexAttribPointer(positionAttribLocation, 4, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 3);

		gl.disableVertexAttribArray(positionAttribLocation);
		gl.useProgram(null);
	}

	function reshape(width: number, height: number) {
		if (theProgram) {
			gl.useProgram(theProgram);
			gl.uniform1i(heightUniform, height);
			gl.useProgram(null);
		}
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

<Canvas bind:gl bind:destroy {width} {height} {init} {reshape} {display} {keyboard} />
