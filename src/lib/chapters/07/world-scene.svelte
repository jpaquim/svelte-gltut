<script lang="ts">
	import { mat4, vec3, vec4 } from 'gl-matrix';
	import { Canvas, assert, createProgram, degToRad, loadShader, Mesh } from '$lib';
	import { MatrixStack } from '$lib/glutil/matrix-stack';

	let gl: WebGL2RenderingContext;

	let destroy: () => void;

	interface ProgramData {
		theProgram: WebGLProgram;
		modelToWorldMatrixUniform: WebGLUniformLocation;
		worldToCameraMatrixUniform: WebGLUniformLocation;
		cameraToClipMatrixUniform: WebGLUniformLocation;
		baseColorUniform: WebGLUniformLocation | null;
	}

	const zNear = 1;
	const zFar = 1000;

	let uniformColor: ProgramData;
	let objectColor: ProgramData;
	let uniformColorTint: ProgramData;

	async function loadProgram(
		strVertexShader: string,
		strFragmentShader: string
	): Promise<ProgramData> {
		const shaderList = await Promise.all([
			loadShader(gl.VERTEX_SHADER, strVertexShader, 7),
			loadShader(gl.FRAGMENT_SHADER, strFragmentShader, 7)
		]);

		const theProgram = createProgram(shaderList);
		const modelToWorldMatrixUniform = gl.getUniformLocation(theProgram, 'modelToWorldMatrix');
		const worldToCameraMatrixUniform = gl.getUniformLocation(theProgram, 'worldToCameraMatrix');
		const cameraToClipMatrixUniform = gl.getUniformLocation(theProgram, 'cameraToClipMatrix');
		const baseColorUniform = gl.getUniformLocation(theProgram, 'baseColor');

		assert(modelToWorldMatrixUniform);
		assert(worldToCameraMatrixUniform);
		assert(cameraToClipMatrixUniform);
		// assert(baseColorUniform);

		const data = {
			theProgram,
			modelToWorldMatrixUniform,
			worldToCameraMatrixUniform,
			cameraToClipMatrixUniform,
			baseColorUniform
		};

		return data;
	}

	async function initializeProgram() {
		[uniformColor, objectColor, uniformColorTint] = await Promise.all([
			loadProgram('pos-only-world-transform.vert', 'color-uniform.frag'),
			loadProgram('pos-color-world-transform.vert', 'color-passthrough.frag'),
			loadProgram('pos-color-world-transform.vert', 'color-mult-uniform.frag')
		]);
	}

	function calcLookAtMatrix(cameraPt: vec3, lookPt: vec3, upPt: vec3): mat4 {
		const lookDir = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), lookPt, cameraPt));
		const upDir = vec3.normalize(vec3.create(), upPt);

		const rightDir = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), lookDir, upDir));
		const perpUpDir = vec3.cross(vec3.create(), rightDir, lookDir);

		let rotMat = mat4.create() as Float32Array;
		rotMat.set(rightDir, 0);
		rotMat.set(perpUpDir, 4);
		rotMat.set(vec3.negate(vec3.create(), lookDir), 4 * 2);

		rotMat = mat4.transpose(mat4.create(), rotMat) as Float32Array;

		const transMat = mat4.create() as Float32Array;
		transMat.set(vec4.fromValues(-cameraPt[0], -cameraPt[1], -cameraPt[2], 1), 4 * 3);

		return mat4.multiply(mat4.create(), rotMat, transMat);
	}

	let coneMesh: Mesh;
	let cylinderMesh: Mesh;
	let cubeTintMesh: Mesh;
	let cubeColorMesh: Mesh;
	let planeMesh: Mesh;

	async function init() {
		await initializeProgram();

		try {
			coneMesh = new Mesh('unit-cone-tint.xml');
			cylinderMesh = new Mesh('unit-cylinder-tint.xml');
			cubeTintMesh = new Mesh('unit-cube-tint.xml');
			cubeColorMesh = new Mesh('unit-cube-color.xml');
			planeMesh = new Mesh('unit-plane.xml');
		} catch (error) {
			console.log(error instanceof Error ? error.message : 'Error loading meshes');
			throw error;
		}

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CW);

		gl.enable(gl.DEPTH_TEST);
		gl.depthMask(true);
		gl.depthFunc(gl.LEQUAL);
		gl.depthRange(0, 1);
		// TODO: glEnable(GL_DEPTH_CLAMP);
	}

	let yAngle = 0;
	let xAngle = 0;

	function drawTree() {}

	const columnBaseHeight = 0.25;

	function drawColumn() {}

	const parthenonWidth = 14.0;
	const parthenonLength = 20.0;
	const parthenonColumnHeight = 5.0;
	const parthenonBaseHeight = 1.0;
	const parthenonTopHeight = 2.0;

	function drawParthenon(modelMatrix: MatrixStack) {}

	interface TreeData {
		xPos: number;
		zPos: number;
		trunkHeight: number;
		coneHeight: number;
	}

	const forest: TreeData[] = [
		{ xPos: -45, zPos: -40, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -42, zPos: -35, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -39, zPos: -29, trunkHeight: 2, coneHeight: 4 },
		{ xPos: -44, zPos: -26, trunkHeight: 3, coneHeight: 3 },
		{ xPos: -40, zPos: -22, trunkHeight: 2, coneHeight: 4 },
		{ xPos: -36, zPos: -15, trunkHeight: 3, coneHeight: 3 },
		{ xPos: -41, zPos: -11, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -37, zPos: -6, trunkHeight: 3, coneHeight: 3 },
		{ xPos: -45, zPos: 0, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -39, zPos: 4, trunkHeight: 3, coneHeight: 4 },
		{ xPos: -36, zPos: 8, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -44, zPos: 13, trunkHeight: 3, coneHeight: 3 },
		{ xPos: -42, zPos: 17, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -38, zPos: 23, trunkHeight: 3, coneHeight: 4 },
		{ xPos: -41, zPos: 27, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -39, zPos: 32, trunkHeight: 3, coneHeight: 3 },
		{ xPos: -44, zPos: 37, trunkHeight: 3, coneHeight: 4 },
		{ xPos: -36, zPos: 42, trunkHeight: 2, coneHeight: 3 },

		{ xPos: -32, zPos: -45, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -30, zPos: -42, trunkHeight: 2, coneHeight: 4 },
		{ xPos: -34, zPos: -38, trunkHeight: 3, coneHeight: 5 },
		{ xPos: -33, zPos: -35, trunkHeight: 3, coneHeight: 4 },
		{ xPos: -29, zPos: -28, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -26, zPos: -25, trunkHeight: 3, coneHeight: 5 },
		{ xPos: -35, zPos: -21, trunkHeight: 3, coneHeight: 4 },
		{ xPos: -31, zPos: -17, trunkHeight: 3, coneHeight: 3 },
		{ xPos: -28, zPos: -12, trunkHeight: 2, coneHeight: 4 },
		{ xPos: -29, zPos: -7, trunkHeight: 3, coneHeight: 3 },
		{ xPos: -26, zPos: -1, trunkHeight: 2, coneHeight: 4 },
		{ xPos: -32, zPos: 6, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -30, zPos: 10, trunkHeight: 3, coneHeight: 5 },
		{ xPos: -33, zPos: 14, trunkHeight: 2, coneHeight: 4 },
		{ xPos: -35, zPos: 19, trunkHeight: 3, coneHeight: 4 },
		{ xPos: -28, zPos: 22, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -33, zPos: 26, trunkHeight: 3, coneHeight: 3 },
		{ xPos: -29, zPos: 31, trunkHeight: 3, coneHeight: 4 },
		{ xPos: -32, zPos: 38, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -27, zPos: 41, trunkHeight: 3, coneHeight: 4 },
		{ xPos: -31, zPos: 45, trunkHeight: 2, coneHeight: 4 },
		{ xPos: -28, zPos: 48, trunkHeight: 3, coneHeight: 5 },

		{ xPos: -25, zPos: -48, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -20, zPos: -42, trunkHeight: 3, coneHeight: 4 },
		{ xPos: -22, zPos: -39, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -19, zPos: -34, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -23, zPos: -30, trunkHeight: 3, coneHeight: 4 },
		{ xPos: -24, zPos: -24, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -16, zPos: -21, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -17, zPos: -17, trunkHeight: 3, coneHeight: 3 },
		{ xPos: -25, zPos: -13, trunkHeight: 2, coneHeight: 4 },
		{ xPos: -23, zPos: -8, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -17, zPos: -2, trunkHeight: 3, coneHeight: 3 },
		{ xPos: -16, zPos: 1, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -19, zPos: 4, trunkHeight: 3, coneHeight: 3 },
		{ xPos: -22, zPos: 8, trunkHeight: 2, coneHeight: 4 },
		{ xPos: -21, zPos: 14, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -16, zPos: 19, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -23, zPos: 24, trunkHeight: 3, coneHeight: 3 },
		{ xPos: -18, zPos: 28, trunkHeight: 2, coneHeight: 4 },
		{ xPos: -24, zPos: 31, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -20, zPos: 36, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -22, zPos: 41, trunkHeight: 3, coneHeight: 3 },
		{ xPos: -21, zPos: 45, trunkHeight: 2, coneHeight: 3 },

		{ xPos: -12, zPos: -40, trunkHeight: 2, coneHeight: 4 },
		{ xPos: -11, zPos: -35, trunkHeight: 3, coneHeight: 3 },
		{ xPos: -10, zPos: -29, trunkHeight: 1, coneHeight: 3 },
		{ xPos: -9, zPos: -26, trunkHeight: 2, coneHeight: 2 },
		{ xPos: -6, zPos: -22, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -15, zPos: -15, trunkHeight: 1, coneHeight: 3 },
		{ xPos: -8, zPos: -11, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -14, zPos: -6, trunkHeight: 2, coneHeight: 4 },
		{ xPos: -12, zPos: 0, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -7, zPos: 4, trunkHeight: 2, coneHeight: 2 },
		{ xPos: -13, zPos: 8, trunkHeight: 2, coneHeight: 2 },
		{ xPos: -9, zPos: 13, trunkHeight: 1, coneHeight: 3 },
		{ xPos: -13, zPos: 17, trunkHeight: 3, coneHeight: 4 },
		{ xPos: -6, zPos: 23, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -12, zPos: 27, trunkHeight: 1, coneHeight: 2 },
		{ xPos: -8, zPos: 32, trunkHeight: 2, coneHeight: 3 },
		{ xPos: -10, zPos: 37, trunkHeight: 3, coneHeight: 3 },
		{ xPos: -11, zPos: 42, trunkHeight: 2, coneHeight: 2 },

		{ xPos: 15, zPos: 5, trunkHeight: 2, coneHeight: 3 },
		{ xPos: 15, zPos: 10, trunkHeight: 2, coneHeight: 3 },
		{ xPos: 15, zPos: 15, trunkHeight: 2, coneHeight: 3 },
		{ xPos: 15, zPos: 20, trunkHeight: 2, coneHeight: 3 },
		{ xPos: 15, zPos: 25, trunkHeight: 2, coneHeight: 3 },
		{ xPos: 15, zPos: 30, trunkHeight: 2, coneHeight: 3 },
		{ xPos: 15, zPos: 35, trunkHeight: 2, coneHeight: 3 },
		{ xPos: 15, zPos: 40, trunkHeight: 2, coneHeight: 3 },
		{ xPos: 15, zPos: 45, trunkHeight: 2, coneHeight: 3 },

		{ xPos: 25, zPos: 5, trunkHeight: 2, coneHeight: 3 },
		{ xPos: 25, zPos: 10, trunkHeight: 2, coneHeight: 3 },
		{ xPos: 25, zPos: 15, trunkHeight: 2, coneHeight: 3 },
		{ xPos: 25, zPos: 20, trunkHeight: 2, coneHeight: 3 },
		{ xPos: 25, zPos: 25, trunkHeight: 2, coneHeight: 3 },
		{ xPos: 25, zPos: 30, trunkHeight: 2, coneHeight: 3 },
		{ xPos: 25, zPos: 35, trunkHeight: 2, coneHeight: 3 },
		{ xPos: 25, zPos: 40, trunkHeight: 2, coneHeight: 3 },
		{ xPos: 25, zPos: 45, trunkHeight: 2, coneHeight: 3 }
	];

	function drawForest(modelMatrix: MatrixStack) {}

	let drawLookatPoint = false;
	let camTarget = vec3.fromValues(0, 0.4, 0);

	//In spherical coordinates.
	let sphereCamRelPos = vec3.fromValues(67.5, -46, 150);

	function resolveCamPosition(): vec3 {
		const tempMat = new MatrixStack();
		const phi = degToRad(sphereCamRelPos[0]);
		const theta = degToRad(sphereCamRelPos[1] + 90);

		const sinTheta = Math.sin(theta);
		const cosTheta = Math.cos(theta);
		const cosPhi = Math.cos(phi);
		const sinPhi = Math.sin(phi);

		const dirToCamera = vec3.fromValues(sinTheta * cosPhi, cosTheta, sinTheta * sinPhi);
		return vec3.scaleAndAdd(vec3.create(), camTarget, dirToCamera, sphereCamRelPos[2]);
	}

	function display() {
		gl.clearColor(0, 0, 0, 0);
		gl.clearDepth(1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		if (coneMesh && cylinderMesh && cubeTintMesh && cubeColorMesh && planeMesh) {
			const camPos = resolveCamPosition();

			const camMatrix = new MatrixStack();
			camMatrix.setMatrix(calcLookAtMatrix(camPos, camTarget, vec3.fromValues(0, 1, 0)));

			gl.useProgram(uniformColor.theProgram);
			gl.uniformMatrix4fv(uniformColor.worldToCameraMatrixUniform, false, camMatrix.top());
			gl.useProgram(objectColor.theProgram);
			gl.uniformMatrix4fv(objectColor.worldToCameraMatrixUniform, false, camMatrix.top());
			gl.useProgram(uniformColor.theProgram);
			gl.uniformMatrix4fv(uniformColor.worldToCameraMatrixUniform, false, camMatrix.top());
			gl.useProgram(null);

			const modelMatrix = new MatrixStack();

			//Render the ground plane.
			{
				modelMatrix.push();

				modelMatrix.scale(100, 1, 100);

				gl.useProgram(uniformColor.theProgram);
				gl.uniformMatrix4fv(uniformColor.modelToWorldMatrixUniform, false, modelMatrix.top());
				gl.uniform4f(uniformColor.baseColorUniform, 0.302, 0.416, 0.0589, 1);
				planeMesh.render();
				gl.useProgram(null);

				modelMatrix.pop();
			}

			// Draw the trees
			drawForest(modelMatrix);

			// Draw the building.
			{
				modelMatrix.push();

				modelMatrix.translate(20, 0, -10);

				drawParthenon(modelMatrix);

				modelMatrix.pop();
			}

			if (drawLookatPoint) {
				gl.disable(gl.DEPTH_TEST);
				const identity = mat4.create();

				modelMatrix.push();

				const cameraAimVec = vec3.subtract(vec3.create(), camTarget, camPos);
				modelMatrix.translate(0, 0, -vec3.length(cameraAimVec));
				modelMatrix.scale(1, 1, 1);

				gl.useProgram(objectColor.theProgram);
				gl.uniformMatrix4fv(objectColor.modelToWorldMatrixUniform, false, modelMatrix.top());
				gl.uniformMatrix4fv(objectColor.worldToCameraMatrixUniform, false, identity);
				cubeColorMesh.render();
				gl.useProgram(null);
				gl.enable(gl.DEPTH_TEST);

				modelMatrix.pop();
			}
		}
	}

	function reshape(width: number, height: number) {
		const persMatrix = new MatrixStack();
		persMatrix.perspective(45, width / height, zNear, zFar);

		if (uniformColor?.theProgram && objectColor?.theProgram && uniformColorTint?.theProgram) {
			gl.useProgram(uniformColor.theProgram);
			gl.uniformMatrix4fv(uniformColor.cameraToClipMatrixUniform, false, persMatrix.top());
			gl.useProgram(objectColor.theProgram);
			gl.uniformMatrix4fv(objectColor.cameraToClipMatrixUniform, false, persMatrix.top());
			gl.useProgram(uniformColorTint.theProgram);
			gl.uniformMatrix4fv(uniformColorTint.cameraToClipMatrixUniform, false, persMatrix.top());
			gl.useProgram(null);
		}

		gl.viewport(0, 0, width, height);
	}

	function keyboard(_: number, key: string) {
		switch (key) {
			case 'Escape':
				destroy();
				break;
			case 'w':
				camTarget[2] -= 4;
				break;
			case 's':
				camTarget[2] += 4;
				break;
			case 'd':
				camTarget[0] += 4;
				break;
			case 'a':
				camTarget[0] -= 4;
				break;
			case 'e':
				camTarget[1] -= 4;
				break;
			case 'q':
				camTarget[1] += 4;
				break;
			case 'W':
				camTarget[2] -= 0.4;
				break;
			case 'S':
				camTarget[2] += 0.4;
				break;
			case 'D':
				camTarget[0] += 0.4;
				break;
			case 'A':
				camTarget[0] -= 0.4;
				break;
			case 'E':
				camTarget[1] -= 0.4;
				break;
			case 'Q':
				camTarget[1] += 0.4;
				break;
			case ' ':
				break;
		}
	}
</script>

<Canvas bind:gl bind:destroy {init} {reshape} {display} {keyboard} />
