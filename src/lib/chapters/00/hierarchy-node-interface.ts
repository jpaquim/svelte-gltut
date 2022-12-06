import { mat3, mat4, vec3 } from 'gl-matrix';
import { mat3ToMat4 } from '$lib/gl-matrix';
import { assert } from '$lib/utils';

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

function rotateX(angDeg: number) {
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

function rotateY(angDeg: number) {
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

function rotateZ(angDeg: number) {
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

class MatrixStack {
	currMat = mat4.create();
	matrices: mat4[] = [];

	top(): mat4 {
		return this.currMat;
	}

	rotateX(angDeg: number) {
		this.currMat = mat4.multiply(mat4.create(), this.currMat, mat3ToMat4(rotateX(angDeg)));
	}

	rotateY(angDeg: number) {
		this.currMat = mat4.multiply(mat4.create(), this.currMat, mat3ToMat4(rotateY(angDeg)));
	}

	rotateZ(angDeg: number) {
		this.currMat = mat4.multiply(mat4.create(), this.currMat, mat3ToMat4(rotateZ(angDeg)));
	}

	scale(scaleVec: vec3) {
		const scaleMat = mat4.create();
		scaleMat[0] = scaleVec[0];
		scaleMat[4 + 1] = scaleVec[1];
		scaleMat[4 * 2 + 2] = scaleVec[2];

		this.currMat = mat4.multiply(mat4.create(), this.currMat, scaleMat);
	}

	translate(offsetVec: vec3) {
		const translateMat = mat4.create();
		translateMat[4 * 3] = offsetVec[0];
		translateMat[4 * 3 + 1] = offsetVec[1];
		translateMat[4 * 3 + 2] = offsetVec[2];

		this.currMat = mat4.multiply(mat4.create(), this.currMat, translateMat);
	}

	push() {
		this.matrices.push(this.currMat);
	}

	pop() {
		const popped = this.matrices.pop();
		assert(popped);
		this.currMat = popped;
	}
}

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
		this.scene = this.makeScene();
	}

	makeScene() {
		return {
			origin: this.posBase,
			angles: [{ y: this.angBase }],
			children: [
				{
					origin: this.posBaseLeft,
					size: vec3.fromValues(1, 1, this.scaleBaseZ)
				},
				{
					origin: this.posBaseRight,
					size: vec3.fromValues(1, 1, this.scaleBaseZ)
				},
				{
					angles: [{ x: this.angUpperArm }],
					children: [
						{
							origin: vec3.fromValues(0, 0, this.sizeUpperArm / 2 - 1),
							size: vec3.fromValues(1, 1, this.sizeUpperArm / 2)
						},
						{
							origin: this.posLowerArm,
							angles: [{ x: this.angLowerArm }],
							children: [
								{
									origin: vec3.fromValues(0, 0, this.lenLowerArm / 2),
									size: vec3.fromValues(
										this.widthLowerArm / 2,
										this.widthLowerArm / 2,
										this.lenLowerArm / 2
									)
								},
								{
									origin: this.posWrist,
									angles: [{ z: this.angWristRoll }, { x: this.angWristPitch }],
									size: vec3.fromValues(
										this.widthWrist / 2,
										this.widthWrist / 2,
										this.lenWrist / 2
									),
									children: [
										{
											origin: this.posLeftFinger,
											angles: [{ y: this.angFingerOpen }],
											children: [
												{
													origin: vec3.fromValues(0, 0, this.lenFinger / 2),
													size: vec3.fromValues(
														this.widthFinger / 2,
														this.widthFinger / 2,
														this.lenFinger / 2
													)
												},
												{
													origin: vec3.fromValues(0, 0, this.lenFinger),
													angles: [{ y: -this.angLowerFinger }],
													children: [
														{
															origin: vec3.fromValues(0, 0, this.lenFinger / 2),
															size: vec3.fromValues(
																this.widthFinger / 2,
																this.widthFinger / 2,
																this.lenFinger / 2
															)
														}
													]
												}
											]
										},
										{
											origin: this.posRightFinger,
											angles: [{ y: -this.angFingerOpen }],
											children: [
												{
													origin: vec3.fromValues(0, 0, this.lenFinger / 2),
													size: vec3.fromValues(
														this.widthFinger / 2,
														this.widthFinger / 2,
														this.lenFinger / 2
													)
												},
												{
													origin: vec3.fromValues(0, 0, this.lenFinger),
													angles: [{ y: this.angLowerFinger }],
													children: [
														{
															origin: vec3.fromValues(0, 0, this.lenFinger / 2),
															size: vec3.fromValues(
																this.widthFinger / 2,
																this.widthFinger / 2,
																this.lenFinger / 2
															)
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
		};
	}

	updateScene() {
		this.scene = this.makeScene();
	}

	draw(drawArgs: DrawArgs) {
		const { gl, theProgram, vao } = drawArgs;
		const modelToCameraStack = new MatrixStack();

		gl.useProgram(theProgram);
		gl.bindVertexArray(vao);

		render(this.scene, modelToCameraStack, drawArgs);

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

export function render(node: Node, stack: MatrixStack, drawArgs: DrawArgs) {
	const { gl, modelToCameraMatrixUniform, indexData } = drawArgs;

	stack.push();

	if (node.origin) {
		stack.translate(node.origin);
	}

	for (const angle of node.angles ?? []) {
		if ('x' in angle) stack.rotateX(angle.x);
		if ('y' in angle) stack.rotateY(angle.y);
		if ('z' in angle) stack.rotateZ(angle.z);
	}

	if (node.size) {
		stack.push();
		stack.scale(node.size);
		gl.uniformMatrix4fv(modelToCameraMatrixUniform, false, stack.top());
		gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
		stack.pop();
	}

	for (const child of node.children ?? []) {
		render(child, stack, drawArgs);
	}

	stack.pop();
}
