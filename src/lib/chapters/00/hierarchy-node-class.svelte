<script lang="ts">
	import { Canvas, assert, createProgram, loadShader } from '$lib';
	import { Hierarchy } from './hierarchy-node-class';

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

	const numberOfVertices = 24;

	const RED_COLOR = [1.0, 0.0, 0.0, 1.0];
	const GREEN_COLOR = [0.0, 1.0, 0.0, 1.0];
	const BLUE_COLOR = [0.0, 0.0, 1.0, 1.0];

	const YELLOW_COLOR = [1.0, 1.0, 0.0, 1.0];
	const CYAN_COLOR = [0.0, 1.0, 1.0, 1.0];
	const MAGENTA_COLOR = [1.0, 0.0, 1.0, 1.0];

	// prettier-ignore
	const vertexData = new Float32Array([
	//Front
		+1.0, +1.0, +1.0,
		+1.0, -1.0, +1.0,
		-1.0, -1.0, +1.0,
		-1.0, +1.0, +1.0,

		//Top
		+1.0, +1.0, +1.0,
		-1.0, +1.0, +1.0,
		-1.0, +1.0, -1.0,
		+1.0, +1.0, -1.0,

		//Left
		+1.0, +1.0, +1.0,
		+1.0, +1.0, -1.0,
		+1.0, -1.0, -1.0,
		+1.0, -1.0, +1.0,

		//Back
		+1.0, +1.0, -1.0,
		-1.0, +1.0, -1.0,
		-1.0, -1.0, -1.0,
		+1.0, -1.0, -1.0,

		//Bottom
		+1.0, -1.0, +1.0,
		+1.0, -1.0, -1.0,
		-1.0, -1.0, -1.0,
		-1.0, -1.0, +1.0,

		//Right
		-1.0, +1.0, +1.0,
		-1.0, -1.0, +1.0,
		-1.0, -1.0, -1.0,
		-1.0, +1.0, -1.0,


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
		...RED_COLOR,

		...YELLOW_COLOR,
		...YELLOW_COLOR,
		...YELLOW_COLOR,
		...YELLOW_COLOR,

		...CYAN_COLOR,
		...CYAN_COLOR,
		...CYAN_COLOR,
		...CYAN_COLOR,

		...MAGENTA_COLOR,
		...MAGENTA_COLOR,
		...MAGENTA_COLOR,
		...MAGENTA_COLOR,
	]);

	// prettier-ignore
	const indexData = new Uint16Array([
		0, 1, 2,
		2, 3, 0,

		4, 5, 6,
		6, 7, 4,

		8, 9, 10,
		10, 11, 8,

		12, 13, 14,
		14, 15, 12,

		16, 17, 18,
		18, 19, 16,

		20, 21, 22,
		22, 23, 20,
	]);

	let vertexBufferObject: WebGLBuffer;
	let indexBufferObject: WebGLBuffer;
	let vao: WebGLVertexArrayObject;

	function initializeVAO() {
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
	}

	const armature = new Hierarchy();

	async function init() {
		await initializeProgram();
		initializeVAO();

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CW);

		gl.enable(gl.DEPTH_TEST);
		gl.depthMask(true);
		gl.depthFunc(gl.LEQUAL);
		gl.depthRange(0, 1);
	}

	function display() {
		gl.clearColor(0, 0, 0, 0);
		gl.clearDepth(1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		armature.draw({ gl, theProgram, vao, modelToCameraMatrixUniform, indexData });
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

	function keyboard(_: number, key: string) {
		switch (key) {
			case 'Escape':
				destroy();
				break;
			case 'a':
				armature.adjBase(true);
				break;
			case 'd':
				armature.adjBase(false);
				break;
			case 'w':
				armature.adjUpperArm(false);
				break;
			case 's':
				armature.adjUpperArm(true);
				break;
			case 'r':
				armature.adjLowerArm(false);
				break;
			case 'f':
				armature.adjLowerArm(true);
				break;
			case 't':
				armature.adjWristPitch(false);
				break;
			case 'g':
				armature.adjWristPitch(true);
				break;
			case 'z':
				armature.adjWristRoll(true);
				break;
			case 'c':
				armature.adjWristRoll(false);
				break;
			case 'q':
				armature.adjFingerOpen(true);
				break;
			case 'e':
				armature.adjFingerOpen(false);
				break;
			case ' ':
				armature.writePose();
				break;
		}
	}
</script>

<Canvas bind:gl bind:destroy {init} {reshape} {display} {keyboard} />
