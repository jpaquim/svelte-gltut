import { mat3, mat4, vec3 } from 'gl-matrix';
import { mat3ToMat4 } from '$lib/gl-matrix';

function degToRad(angDeg: number): number {
	const degToRad = Math.PI / 180;
	return angDeg * degToRad;
}

function clamp(value: number, minValue: number, maxValue: number): number {
	// original code:
	if (value < minValue) return minValue;
	if (value > maxValue) return maxValue;
	return value;
	// alternatives:
	// return value < minValue ? minValue : value > maxValue ? maxValue : value;
	// return Math.min(Math.max(value, minValue), maxValue);
}

function rotX(angDeg: number) {
	const angRad = degToRad(angDeg);
	const cos = Math.cos(angRad);
	const sin = Math.sin(angRad);

	const theMat = mat3.create();
	theMat[3 + 1] = cos;
	theMat[3 * 2 + 1] = -sin;
	theMat[3 + 2] = sin;
	theMat[3 * 2 + 2] = cos;
	return theMat;
}

function rotY(angDeg: number) {
	const angRad = degToRad(angDeg);
	const cos = Math.cos(angRad);
	const sin = Math.sin(angRad);

	const theMat = mat3.create();
	theMat[0] = cos;
	theMat[3 * 2] = sin;
	theMat[2] = -sin;
	theMat[3 * 2 + 2] = cos;
	return theMat;
}

function rotZ(angDeg: number) {
	const angRad = degToRad(angDeg);
	const cos = Math.cos(angRad);
	const sin = Math.sin(angRad);

	const theMat = mat3.create();
	theMat[0] = cos;
	theMat[3] = -sin;
	theMat[1] = sin;
	theMat[3 + 1] = cos;
	return theMat;
}

function rotateX(matrix: mat4, angDeg: number) {
	return mat4.multiply(mat4.create(), matrix, mat3ToMat4(rotX(angDeg)));
}

function rotateY(matrix: mat4, angDeg: number) {
	return mat4.multiply(mat4.create(), matrix, mat3ToMat4(rotY(angDeg)));
}

function rotateZ(matrix: mat4, angDeg: number) {
	return mat4.multiply(mat4.create(), matrix, mat3ToMat4(rotZ(angDeg)));
}

function scale(matrix: mat4, scaleVec: vec3) {
	const scaleMat = mat4.create();
	scaleMat[0] = scaleVec[0];
	scaleMat[4 + 1] = scaleVec[1];
	scaleMat[4 * 2 + 2] = scaleVec[2];

	return mat4.multiply(mat4.create(), matrix, scaleMat);
}

function translate(matrix: mat4, offsetVec: vec3) {
	const translateMat = mat4.create();
	translateMat[4 * 3] = offsetVec[0];
	translateMat[4 * 3 + 1] = offsetVec[1];
	translateMat[4 * 3 + 2] = offsetVec[2];

	return mat4.multiply(mat4.create(), matrix, translateMat);
}

interface SceneProps {
	posBase: vec3;
	angBase: number;
	posBaseLeft: vec3;
	posBaseRight: vec3;
	scaleBaseZ: number;
	angUpperArm: number;
	sizeUpperArm: number;
	posLowerArm: vec3;
	angLowerArm: number;
	lenLowerArm: number;
	widthLowerArm: number;
	posWrist: vec3;
	angWristRoll: number;
	angWristPitch: number;
	lenWrist: number;
	widthWrist: number;
	posLeftFinger: vec3;
	posRightFinger: vec3;
	angFingerOpen: number;
	lenFinger: number;
	widthFinger: number;
	angLowerFinger: number;
}

const scene = ({
	posBase,
	angBase,
	posBaseLeft,
	posBaseRight,
	scaleBaseZ,
	angUpperArm,
	sizeUpperArm,
	posLowerArm,
	angLowerArm,
	lenLowerArm,
	widthLowerArm,
	posWrist,
	angWristRoll,
	angWristPitch,
	lenWrist,
	widthWrist,
	posLeftFinger,
	posRightFinger,
	angFingerOpen,
	lenFinger,
	widthFinger,
	angLowerFinger
}: SceneProps) => ({
	origin: posBase,
	angles: [{ y: angBase }],
	children: [
		{
			origin: posBaseLeft,
			size: vec3.fromValues(1, 1, scaleBaseZ)
		},
		{
			origin: posBaseRight,
			size: vec3.fromValues(1, 1, scaleBaseZ)
		},
		{
			angles: [{ x: angUpperArm }],
			children: [
				{
					origin: vec3.fromValues(0, 0, sizeUpperArm / 2 - 1),
					size: vec3.fromValues(1, 1, sizeUpperArm / 2)
				},
				{
					origin: posLowerArm,
					angles: [{ x: angLowerArm }],
					children: [
						{
							origin: vec3.fromValues(0, 0, lenLowerArm / 2),
							size: vec3.fromValues(widthLowerArm / 2, widthLowerArm / 2, lenLowerArm / 2)
						},
						{
							origin: posWrist,
							angles: [{ z: angWristRoll }, { x: angWristPitch }],
							size: vec3.fromValues(widthWrist / 2, widthWrist / 2, lenWrist / 2),
							children: [
								{
									origin: posLeftFinger,
									angles: [{ y: angFingerOpen }],
									children: [
										{
											origin: vec3.fromValues(0, 0, lenFinger / 2),
											size: vec3.fromValues(widthFinger / 2, widthFinger / 2, lenFinger / 2)
										},
										{
											origin: vec3.fromValues(0, 0, lenFinger),
											angles: [{ y: -angLowerFinger }],
											children: [
												{
													origin: vec3.fromValues(0, 0, lenFinger / 2),
													size: vec3.fromValues(widthFinger / 2, widthFinger / 2, lenFinger / 2)
												}
											]
										}
									]
								},
								{
									origin: posRightFinger,
									angles: [{ y: -angFingerOpen }],
									children: [
										{
											origin: vec3.fromValues(0, 0, lenFinger / 2),
											size: vec3.fromValues(widthFinger / 2, widthFinger / 2, lenFinger / 2)
										},
										{
											origin: vec3.fromValues(0, 0, lenFinger),
											angles: [{ y: angLowerFinger }],
											children: [
												{
													origin: vec3.fromValues(0, 0, lenFinger / 2),
													size: vec3.fromValues(widthFinger / 2, widthFinger / 2, lenFinger / 2)
												}
											]
										}
									]
								}
							]
						}
					]
				}
			]
		}
	]
});

const STANDARD_ANGLE_INCREMENT = 11.25;
const SMALL_ANGLE_INCREMENT = 9;

interface DrawArgs {
	gl: WebGL2RenderingContext;
	theProgram: WebGLProgram;
	vao: WebGLVertexArrayObject;
	modelToCameraMatrixUniform: WebGLUniformLocation;
	indexData: Uint16Array;
}

export class Hierarchy {
	posBase = vec3.fromValues(3, -5, -40);
	angBase = -45;
	posBaseLeft = vec3.fromValues(2, 0, 0);
	posBaseRight = vec3.fromValues(-2, 0, 0);
	scaleBaseZ = 3;
	angUpperArm = -60;
	sizeUpperArm = 9.0;
	posLowerArm = vec3.fromValues(0, 0, 8);
	angLowerArm = 60;
	lenLowerArm = 5.0;
	widthLowerArm = 1.5;
	posWrist = vec3.fromValues(0, 0, 5);
	angWristRoll = 0;
	angWristPitch = 90;
	lenWrist = 2;
	widthWrist = 2;
	posLeftFinger = vec3.fromValues(1, 0, 1);
	posRightFinger = vec3.fromValues(-1, 0, 1);
	angFingerOpen = 27;
	lenFinger = 2;
	widthFinger = 0.5;
	angLowerFinger = 45;

	scene: Node;

	constructor() {
		this.scene = scene(this);
	}

	updateScene() {
		this.scene = scene(this);
	}

	draw(drawArgs: DrawArgs) {
		const { gl, theProgram, vao } = drawArgs;

		gl.useProgram(theProgram);
		gl.bindVertexArray(vao);

		const modelToCameraMatrix = mat4.create();
		render(this.scene, modelToCameraMatrix, drawArgs);

		gl.bindVertexArray(null);
		gl.useProgram(null);
	}

	adjBase(increment: boolean) {
		this.angBase += increment ? STANDARD_ANGLE_INCREMENT : -STANDARD_ANGLE_INCREMENT;
		this.angBase = this.angBase % 360;
		this.updateScene();
	}

	adjUpperArm(increment: boolean) {
		this.angUpperArm += increment ? STANDARD_ANGLE_INCREMENT : -STANDARD_ANGLE_INCREMENT;
		this.angUpperArm = clamp(this.angUpperArm, -90, 0);
		this.updateScene();
	}

	adjLowerArm(increment: boolean) {
		this.angLowerArm += increment ? STANDARD_ANGLE_INCREMENT : -STANDARD_ANGLE_INCREMENT;
		this.angLowerArm = clamp(this.angLowerArm, 0, 146.25);
		this.updateScene();
	}

	adjWristPitch(increment: boolean) {
		this.angWristPitch += increment ? STANDARD_ANGLE_INCREMENT : -STANDARD_ANGLE_INCREMENT;
		this.angWristPitch = clamp(this.angWristPitch, 0, 90);
		this.updateScene();
	}

	adjWristRoll(increment: boolean) {
		this.angWristRoll += increment ? STANDARD_ANGLE_INCREMENT : -STANDARD_ANGLE_INCREMENT;
		this.angWristRoll = this.angWristRoll % 360;
		this.updateScene();
	}

	adjFingerOpen(increment: boolean) {
		this.angFingerOpen += increment ? SMALL_ANGLE_INCREMENT : -SMALL_ANGLE_INCREMENT;
		this.angFingerOpen = clamp(this.angFingerOpen, 9, 180);
		this.updateScene();
	}

	writePose() {
		console.log(`angBase:\t${this.angBase}`);
		console.log(`angUpperArm:\t${this.angUpperArm}`);
		console.log(`angLowerArm:\t${this.angLowerArm}`);
		console.log(`angWristPitch:\t${this.angWristPitch}`);
		console.log(`angWristRoll:\t${this.angWristRoll}`);
		console.log(`angFingerOpen:\t${this.angFingerOpen}`);
		console.log('\n');
	}
}

type RotationAngle = { x: number } | { y: number } | { z: number };

export interface Node {
	origin?: vec3;
	angles?: RotationAngle[];
	size?: vec3;
	children?: Node[];
}

export function render(node: Node, matrix: mat4, drawArgs: DrawArgs) {
	const { gl, modelToCameraMatrixUniform, indexData } = drawArgs;

	if (node.origin) {
		matrix = translate(matrix, node.origin);
	}

	for (const angle of node.angles ?? []) {
		if ('x' in angle) matrix = rotateX(matrix, angle.x);
		if ('y' in angle) matrix = rotateY(matrix, angle.y);
		if ('z' in angle) matrix = rotateZ(matrix, angle.z);
	}

	if (node.size) {
		const nodeMatrix = scale(matrix, node.size);
		gl.uniformMatrix4fv(modelToCameraMatrixUniform, false, nodeMatrix);
		gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
	}

	for (const child of node.children ?? []) {
		render(child, matrix, drawArgs);
	}
}
