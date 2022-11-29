<script lang="ts">
	import { Canvas, assert, createProgram, loadShader } from '$lib';
	import { instanceList } from './scale-instances';

	let gl: WebGL2RenderingContext;

	let destroy: () => void;

	let theProgram: WebGLProgram;

	let positionAttribLocation: number;
	let colorAttribLocation: number;

	let modelToCameraMatrixUniform: WebGLUniformLocation;
	let cameraToClipMatrixUniform: WebGLUniformLocation;

	const cameraToClipMatrix = new Float32Array(16);

	function calcFrustumScale(fovDeg: number): number {
		const degToRad = Math.PI / 180;
		const fovRad = fovDeg * degToRad;
		return 1.0 / Math.tan(fovRad / 2);
	}

	const frustumScale = calcFrustumScale(45);

	async function initializeProgram() {
		const shaderList = await Promise.all([
			loadShader(gl.VERTEX_SHADER, 'pos-color-local-transform.vert', 6),
			loadShader(gl.FRAGMENT_SHADER, 'color-passthrough.frag', 6)
		]);

		theProgram = createProgram(shaderList);

		positionAttribLocation = gl.getAttribLocation(theProgram, 'position');
		colorAttribLocation = gl.getAttribLocation(theProgram, 'color');

		const modelToCameraMatrixUniformLocation = gl.getUniformLocation(
			theProgram,
			'modelToCameraMatrix'
		);
		assert(modelToCameraMatrixUniformLocation);
		modelToCameraMatrixUniform = modelToCameraMatrixUniformLocation;
		const cameraToClipMatrixUniformLocation = gl.getUniformLocation(
			theProgram,
			'cameraToClipMatrix'
		);
		assert(cameraToClipMatrixUniformLocation);
		cameraToClipMatrixUniform = cameraToClipMatrixUniformLocation;

		const zNear = 1;
		const zFar = 45;

		cameraToClipMatrix[0] = frustumScale;
		cameraToClipMatrix[5] = frustumScale;
		cameraToClipMatrix[10] = (zFar + zNear) / (zNear - zFar);
		cameraToClipMatrix[11] = -1;
		cameraToClipMatrix[14] = (2 * zFar + zNear) / (zNear - zFar);

		gl.useProgram(theProgram);
		gl.uniformMatrix4fv(cameraToClipMatrixUniform, false, cameraToClipMatrix);
		gl.useProgram(null);
	}
	const numberOfVertices = 8;

	const GREEN_COLOR = [0.0, 1.0, 0.0, 1.0];
	const BLUE_COLOR = [0.0, 0.0, 1.0, 1.0];
	const RED_COLOR = [1.0, 0.0, 0.0, 1.0];
	const BROWN_COLOR = [0.5, 0.5, 0.0, 1.0];

	// prettier-ignore
	const vertexData = new Float32Array([
		+1.0, +1.0, +1.0,
		-1.0, -1.0, +1.0,
		-1.0, +1.0, -1.0,
		+1.0, -1.0, -1.0,

		-1.0, -1.0, -1.0,
		+1.0, +1.0, -1.0,
		+1.0, -1.0, +1.0,
		-1.0, +1.0, +1.0,

		...GREEN_COLOR,
		...BLUE_COLOR,
		...RED_COLOR,
		...BROWN_COLOR,

		...GREEN_COLOR,
		...BLUE_COLOR,
		...RED_COLOR,
		...BROWN_COLOR,
	]);

	// prettier-ignore
	const indexData = new Uint16Array([
		0, 1, 2,
		1, 0, 3,
		2, 3, 0,
		3, 2, 1,

		5, 4, 6,
		4, 5, 7,
		7, 6, 4,
		6, 7, 5,
	]);

	let vertexBufferObject: WebGLBuffer;
	let indexBufferObject: WebGLBuffer;
	let vao: WebGLVertexArrayObject;

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

	async function init() {
		await initializeProgram();
		initializeVertexBuffer();

		const vertexArray = gl.createVertexArray();
		assert(vertexArray);
		vao = vertexArray;
		gl.bindVertexArray(vao);

		const colorDataOffset = Float32Array.BYTES_PER_ELEMENT * 3 * numberOfVertices;
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObject);
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.enableVertexAttribArray(colorAttribLocation);
		gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);
		gl.vertexAttribPointer(colorAttribLocation, 4, gl.FLOAT, false, 0, colorDataOffset);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBufferObject);

		gl.bindVertexArray(null);

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CW);

		gl.enable(gl.DEPTH_TEST);
		gl.depthMask(true);
		gl.depthFunc(gl.LEQUAL);
		gl.depthRange(0, 1);
	}

	const startTime = Date.now();

	function display() {
		gl.clearColor(0, 0, 0, 0);
		gl.clearDepth(1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		gl.useProgram(theProgram);

		gl.bindVertexArray(vao);

		const elapsedTime = (Date.now() - startTime) / 1000;
		for (const currInst of instanceList) {
			const transformMatrix = currInst.constructMatrix(elapsedTime);
			gl.uniformMatrix4fv(modelToCameraMatrixUniform, false, transformMatrix);
			gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
		}

		gl.bindVertexArray(null);
		gl.useProgram(null);
	}

	function reshape(width: number, height: number) {
		cameraToClipMatrix[0] = (frustumScale * height) / width;
		cameraToClipMatrix[5] = frustumScale;

		if (theProgram) {
			gl.useProgram(theProgram);
			gl.uniformMatrix4fv(cameraToClipMatrixUniform, false, cameraToClipMatrix);
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
