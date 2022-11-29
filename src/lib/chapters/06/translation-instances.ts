import { mat4, vec3 } from 'gl-matrix';

type OffsetFunc = (elapsedTime: number) => vec3;

class Instance {
	constructor(public calcOffset: OffsetFunc) {}

	constructMatrix(elapsedTime: number): mat4 {
		// original solution
		// const theMat = mat4.create();
		// (theMat as Float32Array).set(
		// 	vec4.fromValues(...(this.calcOffset(elapsedTime) as [number, number, number]), 1),
		// 	3 * 4
		// );
		// more idiomatic: use gl-matrix's fromTranslation helper
		const theMat = mat4.fromTranslation(mat4.create(), this.calcOffset(elapsedTime));

		return theMat;
	}
}

function stationaryOffset(_: number) {
	return vec3.fromValues(0, 0, -20);
}

function ovalOffset(elapsedTime: number) {
	const loopDuration = 3.0;
	const scale = (2 * Math.PI) / loopDuration;

	const currTimeThroughLoop = elapsedTime % loopDuration;

	return vec3.fromValues(
		4 * Math.cos(currTimeThroughLoop * scale),
		6 * Math.sin(currTimeThroughLoop * scale),
		-20
	);
}

function bottomCircleOffset(elapsedTime: number) {
	const loopDuration = 12.0;
	const scale = (2 * Math.PI) / loopDuration;

	const currTimeThroughLoop = elapsedTime % loopDuration;

	return vec3.fromValues(
		5 * Math.cos(currTimeThroughLoop * scale),
		-3.5,
		5 * Math.sin(currTimeThroughLoop * scale) - 20
	);
}

export const instanceList = [
	new Instance(stationaryOffset),
	new Instance(ovalOffset),
	new Instance(bottomCircleOffset)
];
