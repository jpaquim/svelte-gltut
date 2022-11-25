<script lang="ts">
	import { Canvas, assert, createProgram, loadShader } from '$lib';

	let gl: WebGL2RenderingContext;

	let destroy: () => void;

	let theProgram: WebGLProgram;
	let offsetUniform: WebGLUniformLocation;
	let positionAttribLocation: number;
	let colorAttribLocation: number;

	async function initializeProgram() {
		const shaderList = await Promise.all([
			loadShader(gl.VERTEX_SHADER, 'ortho-with-offset.vert', 4),
			loadShader(gl.FRAGMENT_SHADER, 'standard-colors.frag', 4)
		]);

		theProgram = createProgram(shaderList);

		const offsetUniformLocation = gl.getUniformLocation(theProgram, 'offset');
		assert(offsetUniformLocation);
		offsetUniform = offsetUniformLocation;

		positionAttribLocation = gl.getAttribLocation(theProgram, 'position');
		colorAttribLocation = gl.getAttribLocation(theProgram, 'color');
	}

	// prettier-ignore
	const vertexData = new Float32Array([
		 0.25,  0.25, 0.75, 1.0,
		 0.25, -0.25, 0.75, 1.0,
		-0.25,  0.25, 0.75, 1.0,

		 0.25, -0.25, 0.75, 1.0,
		-0.25, -0.25, 0.75, 1.0,
		-0.25,  0.25, 0.75, 1.0,

		 0.25,  0.25, -0.75, 1.0,
		-0.25,  0.25, -0.75, 1.0,
		 0.25, -0.25, -0.75, 1.0,

		 0.25, -0.25, -0.75, 1.0,
		-0.25,  0.25, -0.75, 1.0,
		-0.25, -0.25, -0.75, 1.0,

		-0.25,  0.25,  0.75, 1.0,
		-0.25, -0.25,  0.75, 1.0,
		-0.25, -0.25, -0.75, 1.0,

		-0.25,  0.25,  0.75, 1.0,
		-0.25, -0.25, -0.75, 1.0,
		-0.25,  0.25, -0.75, 1.0,

		 0.25,  0.25,  0.75, 1.0,
		 0.25, -0.25, -0.75, 1.0,
		 0.25, -0.25,  0.75, 1.0,

		 0.25,  0.25,  0.75, 1.0,
		 0.25,  0.25, -0.75, 1.0,
		 0.25, -0.25, -0.75, 1.0,

		 0.25,  0.25, -0.75, 1.0,
		 0.25,  0.25,  0.75, 1.0,
		-0.25,  0.25,  0.75, 1.0,

		 0.25,  0.25, -0.75, 1.0,
		-0.25,  0.25,  0.75, 1.0,
		-0.25,  0.25, -0.75, 1.0,

		 0.25, -0.25, -0.75, 1.0,
		-0.25, -0.25,  0.75, 1.0,
		 0.25, -0.25,  0.75, 1.0,

		 0.25, -0.25, -0.75, 1.0,
		-0.25, -0.25, -0.75, 1.0,
		-0.25, -0.25,  0.75, 1.0,


		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0,

		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0,
		0.0, 0.0, 1.0, 1.0,

		0.8, 0.8, 0.8, 1.0,
		0.8, 0.8, 0.8, 1.0,
		0.8, 0.8, 0.8, 1.0,

		0.8, 0.8, 0.8, 1.0,
		0.8, 0.8, 0.8, 1.0,
		0.8, 0.8, 0.8, 1.0,

		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,

		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,
		0.0, 1.0, 0.0, 1.0,

		0.5, 0.5, 0.0, 1.0,
		0.5, 0.5, 0.0, 1.0,
		0.5, 0.5, 0.0, 1.0,

		0.5, 0.5, 0.0, 1.0,
		0.5, 0.5, 0.0, 1.0,
		0.5, 0.5, 0.0, 1.0,

		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,

		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,
		1.0, 0.0, 0.0, 1.0,

		0.0, 1.0, 1.0, 1.0,
		0.0, 1.0, 1.0, 1.0,
		0.0, 1.0, 1.0, 1.0,

		0.0, 1.0, 1.0, 1.0,
		0.0, 1.0, 1.0, 1.0,
		0.0, 1.0, 1.0, 1.0,
]);

	let vertexBufferObject: WebGLBuffer;
	let vao: WebGLVertexArrayObject;

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

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CW);
	}

	function display() {
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(theProgram);

		gl.uniform2f(offsetUniform, 0.5, 0.25);

		const colorData = vertexData.byteLength / 2;
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.enableVertexAttribArray(colorAttribLocation);
		gl.vertexAttribPointer(positionAttribLocation, 4, gl.FLOAT, false, 0, 0);
		gl.vertexAttribPointer(colorAttribLocation, 4, gl.FLOAT, false, 0, colorData);

		gl.drawArrays(gl.TRIANGLES, 0, 36);

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
