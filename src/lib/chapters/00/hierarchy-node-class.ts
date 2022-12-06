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
		return new Node(this.posBase, [{ y: this.angBase }], null, [
			new Node(this.posBaseLeft, null, vec3.fromValues(1, 1, this.scaleBaseZ)),
			new Node(this.posBaseRight, null, vec3.fromValues(1, 1, this.scaleBaseZ)),
			new Node(null, [{ x: this.angUpperArm }], null, [
				new Node(
					vec3.fromValues(0, 0, this.sizeUpperArm / 2 - 1),
					null,
					vec3.fromValues(1, 1, this.sizeUpperArm / 2)
				),
				new Node(this.posLowerArm, [{ x: this.angLowerArm }], null, [
					new Node(
						vec3.fromValues(0, 0, this.lenLowerArm / 2),
						null,
						vec3.fromValues(this.widthLowerArm / 2, this.widthLowerArm / 2, this.lenLowerArm / 2)
					),
					new Node(
						this.posWrist,
						[{ z: this.angWristRoll }, { x: this.angWristPitch }],
						vec3.fromValues(this.widthWrist / 2, this.widthWrist / 2, this.lenWrist / 2),
						[
							new Node(this.posLeftFinger, [{ y: this.angFingerOpen }], null, [
								new Node(
									vec3.fromValues(0, 0, this.lenFinger / 2),
									null,
									vec3.fromValues(this.widthFinger / 2, this.widthFinger / 2, this.lenFinger / 2)
								),
								new Node(
									vec3.fromValues(0, 0, this.lenFinger),
									[{ y: -this.angLowerFinger }],
									null,
									[
										new Node(
											vec3.fromValues(0, 0, this.lenFinger / 2),
											null,
											vec3.fromValues(
												this.widthFinger / 2,
												this.widthFinger / 2,
												this.lenFinger / 2
											)
										)
									]
								)
							]),
							new Node(this.posRightFinger, [{ y: -this.angFingerOpen }], null, [
								new Node(
									vec3.fromValues(0, 0, this.lenFinger / 2),
									null,
									vec3.fromValues(this.widthFinger / 2, this.widthFinger / 2, this.lenFinger / 2)
								),
								new Node(
									vec3.fromValues(0, 0, this.lenFinger),
									[{ y: this.angLowerFinger }],
									null,
									[
										new Node(
											vec3.fromValues(0, 0, this.lenFinger / 2),
											null,
											vec3.fromValues(
												this.widthFinger / 2,
												this.widthFinger / 2,
												this.lenFinger / 2
											)
										)
									]
								)
							])
						]
					)
				])
			])
		]);
	}

	updateScene() {
		this.scene = this.makeScene();
	}

	draw(drawArgs: DrawArgs) {
		const { gl, theProgram, vao } = drawArgs;
		const modelToCameraStack = new MatrixStack();

		gl.useProgram(theProgram);
		gl.bindVertexArray(vao);

		this.scene.render(modelToCameraStack, drawArgs);

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

export class Node {
	parent: Node | null = null;

	constructor(
		public origin: vec3 | null = null,
		public angles: RotationAngle[] | null = null,
		public size: vec3 | null = null,
		public children: Node[] | null = null
	) {}

	render(stack: MatrixStack, drawArgs: DrawArgs) {
		const { gl, modelToCameraMatrixUniform, indexData } = drawArgs;

		stack.push();

		if (this.origin) {
			stack.translate(this.origin);
		}

		for (const angle of this.angles ?? []) {
			if ('x' in angle) stack.rotateX(angle.x);
			if ('y' in angle) stack.rotateY(angle.y);
			if ('z' in angle) stack.rotateZ(angle.z);
		}

		if (this.size) {
			stack.push();
			stack.scale(this.size);
			gl.uniformMatrix4fv(modelToCameraMatrixUniform, false, stack.top());
			gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
			stack.pop();
		}

		for (const child of this.children ?? []) {
			child.render(stack, drawArgs);
		}

		stack.pop();
	}
}
