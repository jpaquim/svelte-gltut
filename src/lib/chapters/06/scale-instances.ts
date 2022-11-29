import { mat4, vec3, vec4 } from 'gl-matrix';

type ScaleFunc = (elapsedTime: number) => vec3;

class Instance {
	constructor(public calcScale: ScaleFunc, public offset: vec3) {}

	constructMatrix(elapsedTime: number): mat4 {
		// original solution
		// const theScale = this.calcScale(elapsedTime);
		// const theMat = mat4.create();
		// theMat[0] = theScale[0];
		// theMat[4 * 1 + 1] = theScale[1];
		// theMat[4 * 2 + 2] = theScale[2];
		// more idiomatic: use gl-matrix's fromScale helper
		const theMat = mat4.fromScaling(mat4.create(), this.calcScale(elapsedTime));
		(theMat as Float32Array).set(
			vec4.fromValues(...(this.offset as [number, number, number]), 1),
			4 * 3
		);

		return theMat;
	}
}

function calcLerpFactor(elapsedTime: number, loopDuration: number): number {
	let value = (elapsedTime % loopDuration) / loopDuration;
	if (value > 0.5) {
		value = 1 - value;
	}

	return 2 * value;
}

function mix(min: number, max: number, factor: number): number {
	return min + (max - min) * factor;
}

function nullScale(_: number) {
	return vec3.fromValues(1, 1, 1);
}

function staticUniformScale(_: number) {
	return vec3.fromValues(4, 4, 4);
}

function staticNonUniformScale(_: number) {
	return vec3.fromValues(0.5, 1, 10);
}

function dynamicUniformScale(elapsedTime: number) {
	const loopDuration = 3.0;

	return vec3.scale(
		vec3.create(),
		vec3.fromValues(1, 1, 1),
		mix(1, 4, calcLerpFactor(elapsedTime, loopDuration))
	);
}

function dynamicNonUniformScale(elapsedTime: number) {
	const xLoopDuration = 3.0;
	const zLoopDuration = 5.0;

	return vec3.fromValues(
		mix(1, 5, calcLerpFactor(elapsedTime, xLoopDuration)),
		1,
		mix(1, 10, calcLerpFactor(elapsedTime, zLoopDuration))
	);
}

export const instanceList = [
	new Instance(nullScale, vec3.fromValues(0, 0, -45)),
	new Instance(staticUniformScale, vec3.fromValues(-10, -10, -45)),
	new Instance(staticNonUniformScale, vec3.fromValues(-10, 10, -45)),
	new Instance(dynamicUniformScale, vec3.fromValues(10, 10, -45)),
	new Instance(dynamicNonUniformScale, vec3.fromValues(10, -10, -45))
];
