<script lang="ts">
	import { Canvas, assert, createProgram, loadShader } from '$lib';

	let gl: WebGL2RenderingContext;

	let destroy: () => void;

	let theProgram: WebGLProgram;
	let offsetUniform: WebGLUniformLocation;
	let perspectiveMatrixUniform: WebGLUniformLocation;
	let positionAttribLocation: number;
	let colorAttribLocation: number;

	const perspectiveMatrix = new Float32Array(16);
	const frustumScale = 1.0;

	async function initializeProgram() {
		const shaderList = await Promise.all([
			loadShader(gl.VERTEX_SHADER, 'standard.vert', 5),
			loadShader(gl.FRAGMENT_SHADER, 'standard.frag', 5)
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

		const zNear = 0.5;
		const zFar = 3.0;

		perspectiveMatrix[0] = frustumScale;
		perspectiveMatrix[5] = frustumScale;
		perspectiveMatrix[10] = (zFar + zNear) / (zNear - zFar);
		perspectiveMatrix[14] = (2 * zFar + zNear) / (zNear - zFar);
		perspectiveMatrix[11] = -1;

		gl.useProgram(theProgram);
		gl.uniformMatrix4fv(perspectiveMatrixUniform, false, perspectiveMatrix);
		gl.useProgram(null);
	}
	const numberOfVertices = 36;

	const RIGHT_EXTENT = 0.8;
	const LEFT_EXTENT = -RIGHT_EXTENT;
	const TOP_EXTENT = 0.2;
	const MIDDLE_EXTENT = 0;
	const BOTTOM_EXTENT = -TOP_EXTENT;
	const FRONT_EXTENT = -1.25;
	const REAR_EXTENT = -1.75;

	const GREEN_COLOR = [0.75, 0.75, 1.0, 1.0];
	const BLUE_COLOR = [0.0, 0.5, 0.0, 1.0];
	const RED_COLOR = [1.0, 0.0, 0.0, 1.0];
	const GREY_COLOR = [0.8, 0.8, 0.8, 1.0];
	const BROWN_COLOR = [0.5, 0.5, 0.0, 1.0];

	// prettier-ignore
	const vertexData = new Float32Array([
		//Object 1 positions
		LEFT_EXTENT,	TOP_EXTENT,		REAR_EXTENT,
		LEFT_EXTENT,	MIDDLE_EXTENT,	FRONT_EXTENT,
		RIGHT_EXTENT,	MIDDLE_EXTENT,	FRONT_EXTENT,
		RIGHT_EXTENT,	TOP_EXTENT,		REAR_EXTENT,

		LEFT_EXTENT,	BOTTOM_EXTENT,	REAR_EXTENT,
		LEFT_EXTENT,	MIDDLE_EXTENT,	FRONT_EXTENT,
		RIGHT_EXTENT,	MIDDLE_EXTENT,	FRONT_EXTENT,
		RIGHT_EXTENT,	BOTTOM_EXTENT,	REAR_EXTENT,

		LEFT_EXTENT,	TOP_EXTENT,		REAR_EXTENT,
		LEFT_EXTENT,	MIDDLE_EXTENT,	FRONT_EXTENT,
		LEFT_EXTENT,	BOTTOM_EXTENT,	REAR_EXTENT,

		RIGHT_EXTENT,	TOP_EXTENT,		REAR_EXTENT,
		RIGHT_EXTENT,	MIDDLE_EXTENT,	FRONT_EXTENT,
		RIGHT_EXTENT,	BOTTOM_EXTENT,	REAR_EXTENT,

		LEFT_EXTENT,	BOTTOM_EXTENT,	REAR_EXTENT,
		LEFT_EXTENT,	TOP_EXTENT,		REAR_EXTENT,
		RIGHT_EXTENT,	TOP_EXTENT,		REAR_EXTENT,
		RIGHT_EXTENT,	BOTTOM_EXTENT,	REAR_EXTENT,

		//Object 2 positions
		TOP_EXTENT,		RIGHT_EXTENT,	REAR_EXTENT,
		MIDDLE_EXTENT,	RIGHT_EXTENT,	FRONT_EXTENT,
		MIDDLE_EXTENT,	LEFT_EXTENT,	FRONT_EXTENT,
		TOP_EXTENT,		LEFT_EXTENT,	REAR_EXTENT,

		BOTTOM_EXTENT,	RIGHT_EXTENT,	REAR_EXTENT,
		MIDDLE_EXTENT,	RIGHT_EXTENT,	FRONT_EXTENT,
		MIDDLE_EXTENT,	LEFT_EXTENT,	FRONT_EXTENT,
		BOTTOM_EXTENT,	LEFT_EXTENT,	REAR_EXTENT,

		TOP_EXTENT,		RIGHT_EXTENT,	REAR_EXTENT,
		MIDDLE_EXTENT,	RIGHT_EXTENT,	FRONT_EXTENT,
		BOTTOM_EXTENT,	RIGHT_EXTENT,	REAR_EXTENT,

		TOP_EXTENT,		LEFT_EXTENT,	REAR_EXTENT,
		MIDDLE_EXTENT,	LEFT_EXTENT,	FRONT_EXTENT,
		BOTTOM_EXTENT,	LEFT_EXTENT,	REAR_EXTENT,

		BOTTOM_EXTENT,	RIGHT_EXTENT,	REAR_EXTENT,
		TOP_EXTENT,		RIGHT_EXTENT,	REAR_EXTENT,
		TOP_EXTENT,		LEFT_EXTENT,	REAR_EXTENT,
		BOTTOM_EXTENT,	LEFT_EXTENT,	REAR_EXTENT,

		//Object 1 colors
		...GREEN_COLOR,
		...GREEN_COLOR,
		...GREEN_COLOR,
		...GREEN_COLOR,

		...BLUE_COLOR,
		...BLUE_COLOR,
		...BLUE_COLOR,
		...BLUE_COLOR,

		...RED_COLOR,
		...RED_COLOR,
		...RED_COLOR,

		...GREY_COLOR,
		...GREY_COLOR,
		...GREY_COLOR,

		...BROWN_COLOR,
		...BROWN_COLOR,
		...BROWN_COLOR,
		...BROWN_COLOR,

		//Object 2 colors
		...RED_COLOR,
		...RED_COLOR,
		...RED_COLOR,
		...RED_COLOR,

		...BROWN_COLOR,
		...BROWN_COLOR,
		...BROWN_COLOR,
		...BROWN_COLOR,

		...BLUE_COLOR,
		...BLUE_COLOR,
		...BLUE_COLOR,

		...GREEN_COLOR,
		...GREEN_COLOR,
		...GREEN_COLOR,

		...GREY_COLOR,
		...GREY_COLOR,
		...GREY_COLOR,
		...GREY_COLOR,
	]);

	// prettier-ignore
	const indexData = new Uint16Array([
		0, 2, 1,
		3, 2, 0,

		4, 5, 6,
		6, 7, 4,

		8, 9, 10,
		11, 13, 12,

		14, 16, 15,
		17, 16, 14,
	]);

	let vertexBufferObject: WebGLBuffer;
	let indexBufferObject: WebGLBuffer;

	let vaoObject1: WebGLVertexArrayObject;
	let vaoObject2: WebGLVertexArrayObject;

	function initializeVertexBuffer() {
		const vertexBuffer = gl.createBuffer();
		assert(vertexBuffer);
		vertexBufferObject = vertexBuffer;

		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		const indexBuffer = gl.createBuffer();
		assert(indexBuffer);
		indexBufferObject = indexBuffer;

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
	}

	function initializeVertexBufferArrayObjects() {
		const vertexArrayObject1 = gl.createVertexArray();
		assert(vertexArrayObject1);
		vaoObject1 = vertexArrayObject1;
		gl.bindVertexArray(vaoObject1);

		let colorDataOffset = Float32Array.BYTES_PER_ELEMENT * 3 * numberOfVertices;

		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.enableVertexAttribArray(colorAttribLocation);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
		gl.vertexAttribPointer(colorAttribLocation, 4, gl.FLOAT, false, 0, colorDataOffset);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);

		gl.bindVertexArray(null);

		const vertexArrayObject2 = gl.createVertexArray();
		assert(vertexArrayObject2);
		vaoObject2 = vertexArrayObject2;
		gl.bindVertexArray(vaoObject2);

		const posDataOffset = Float32Array.BYTES_PER_ELEMENT * 3 * (numberOfVertices / 2);
		colorDataOffset += Float32Array.BYTES_PER_ELEMENT * 4 * (numberOfVertices / 2);

		gl.enableVertexAttribArray(positionAttribLocation);
		gl.enableVertexAttribArray(colorAttribLocation);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, posDataOffset);
		gl.vertexAttribPointer(colorAttribLocation, 4, gl.FLOAT, false, 0, colorDataOffset);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);

		gl.bindVertexArray(null);
	}

	async function init() {
		await initializeProgram();
		initializeVertexBuffer();
		initializeVertexBufferArrayObjects();

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CW);
	}

	function display() {
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(theProgram);

		gl.bindVertexArray(vaoObject1);
		gl.uniform3f(offsetUniform, 0, 0, 0);
		gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);

		gl.bindVertexArray(vaoObject2);
		gl.uniform3f(offsetUniform, 0, 0, -1);
		gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);

		gl.bindVertexArray(null);
		gl.useProgram(null);
	}

	function reshape(width: number, height: number) {
		perspectiveMatrix[0] = frustumScale / (width / height);
		perspectiveMatrix[5] = frustumScale;

		if (theProgram) {
			gl.useProgram(theProgram);
			gl.uniformMatrix4fv(perspectiveMatrixUniform, false, perspectiveMatrix);
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

<Canvas bind:gl bind:destroy {init} {reshape} {display} {keyboard} />
