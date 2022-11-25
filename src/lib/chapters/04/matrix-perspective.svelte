<script lang="ts">
	import { Canvas, assert, createProgram, loadShader } from '$lib';

	let gl: WebGL2RenderingContext;

	let destroy: () => void;

	let theProgram: WebGLProgram;
	let offsetUniform: WebGLUniformLocation;
	let perspectiveMatrixUniform: WebGLUniformLocation;
	let positionAttribLocation: number;
	let colorAttribLocation: number;

	async function initializeProgram() {
		const shaderList = await Promise.all([
			loadShader(gl.VERTEX_SHADER, 'matrix-perspective.vert', 4),
			loadShader(gl.FRAGMENT_SHADER, 'standard-colors.frag', 4)
		]);

		theProgram = createProgram(shaderList);

		positionAttribLocation = gl.getAttribLocation(theProgram, 'position');
		colorAttribLocation = gl.getAttribLocation(theProgram, 'color');

		const offsetUniformLocation = gl.getUniformLocation(theProgram, 'offset');
		assert(offsetUniformLocation);
		offsetUniform = offsetUniformLocation;
		const perspectiveMatrixUniformLocation = gl.getUniformLocation(theProgram, 'perspectiveMatrix');
		assert(perspectiveMatrixUniformLocation);
		perspectiveMatrixUniform = perspectiveMatrixUniformLocation;

		const frustumScale = 1.0;
		const zNear = 0.5;
		const zFar = 3.0;

		const theMatrix = new Float32Array(16);
		theMatrix[0] = frustumScale;
		theMatrix[5] = frustumScale;
		theMatrix[10] = (zFar + zNear) / (zNear - zFar);
		theMatrix[14] = (2 * zFar + zNear) / (zNear - zFar);
		theMatrix[11] = -1;

		gl.useProgram(theProgram);
		gl.uniformMatrix4fv(perspectiveMatrixUniform, false, theMatrix);
		gl.useProgram(null);
	}

	// prettier-ignore
	const vertexData = new Float32Array([
		 0.25,  0.25, -1.25, 1.0,
		 0.25, -0.25, -1.25, 1.0,
		-0.25,  0.25, -1.25, 1.0,

		 0.25, -0.25, -1.25, 1.0,
		-0.25, -0.25, -1.25, 1.0,
		-0.25,  0.25, -1.25, 1.0,

		 0.25,  0.25, -2.75, 1.0,
		-0.25,  0.25, -2.75, 1.0,
		 0.25, -0.25, -2.75, 1.0,

		 0.25, -0.25, -2.75, 1.0,
		-0.25,  0.25, -2.75, 1.0,
		-0.25, -0.25, -2.75, 1.0,

		-0.25,  0.25, -1.25, 1.0,
		-0.25, -0.25, -1.25, 1.0,
		-0.25, -0.25, -2.75, 1.0,

		-0.25,  0.25, -1.25, 1.0,
		-0.25, -0.25, -2.75, 1.0,
		-0.25,  0.25, -2.75, 1.0,

		 0.25,  0.25, -1.25, 1.0,
		 0.25, -0.25, -2.75, 1.0,
		 0.25, -0.25, -1.25, 1.0,

		 0.25,  0.25, -1.25, 1.0,
		 0.25,  0.25, -2.75, 1.0,
		 0.25, -0.25, -2.75, 1.0,

		 0.25,  0.25, -2.75, 1.0,
		 0.25,  0.25, -1.25, 1.0,
		-0.25,  0.25, -1.25, 1.0,

		 0.25,  0.25, -2.75, 1.0,
		-0.25,  0.25, -1.25, 1.0,
		-0.25,  0.25, -2.75, 1.0,

		 0.25, -0.25, -2.75, 1.0,
		-0.25, -0.25, -1.25, 1.0,
		 0.25, -0.25, -1.25, 1.0,

		 0.25, -0.25, -2.75, 1.0,
		-0.25, -0.25, -2.75, 1.0,
		-0.25, -0.25, -1.25, 1.0,




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

		gl.uniform2f(offsetUniform, 0.5, 0.5);

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
