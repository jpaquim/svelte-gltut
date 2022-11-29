import { mat3, mat4, vec3 } from 'gl-matrix';

type RotationFunc = (elapsedTime: number) => mat3;

class Instance {
	constructor(public calcRotation: RotationFunc, public offset: vec3) {}

	constructMatrix(elapsedTime: number): mat4 {
		const rotMatrix = this.calcRotation(elapsedTime);
		const theMat = mat4.fromValues(
			rotMatrix[0],
			rotMatrix[1],
			rotMatrix[2],
			0,
			rotMatrix[3],
			rotMatrix[4],
			rotMatrix[5],
			0,
			rotMatrix[6],
			rotMatrix[7],
			rotMatrix[8],
			0,
			...(this.offset as [number, number, number]),
			1
		);

		return theMat;
	}
}

function nullRotation(_: number) {
	return mat3.create();
}

function computeAngleRad(elapsedTime: number, loopDuration: number) {
	const scale = (2 * Math.PI) / loopDuration;
	const currTimeThroughLoop = elapsedTime % loopDuration;
	return currTimeThroughLoop * scale;
}

function rotateX(elapsedTime: number) {
	const angRad = computeAngleRad(elapsedTime, 3);
	const cos = Math.cos(angRad);
	const sin = Math.sin(angRad);

	const theMat = mat3.create();
	theMat[3 + 1] = cos;
	theMat[3 * 2 + 1] = -sin;
	theMat[3 + 2] = sin;
	theMat[3 * 2 + 2] = cos;
	return theMat;
}

function rotateY(elapsedTime: number) {
	const angRad = computeAngleRad(elapsedTime, 2);
	const cos = Math.cos(angRad);
	const sin = Math.sin(angRad);

	const theMat = mat3.create();
	theMat[0] = cos;
	theMat[3 * 2] = sin;
	theMat[2] = -sin;
	theMat[3 * 2 + 2] = cos;
	return theMat;
}

function rotateZ(elapsedTime: number) {
	const angRad = computeAngleRad(elapsedTime, 2);
	const cos = Math.cos(angRad);
	const sin = Math.sin(angRad);

	const theMat = mat3.create();
	theMat[0] = cos;
	theMat[3] = -sin;
	theMat[1] = sin;
	theMat[3 + 1] = cos;
	return theMat;
}

function rotateAxis(elapsedTime: number) {
	const angRad = computeAngleRad(elapsedTime, 2);
	const cos = Math.cos(angRad);
	const invCos = 1 - cos;
	const sin = Math.sin(angRad);

	const axis = vec3.normalize(vec3.create(), vec3.fromValues(1, 1, 1));

	const theMat = mat3.create();
	theMat[0] = axis[0] * axis[0] + (1 - axis[0] * axis[0]) * cos;
	theMat[3] = axis[0] * axis[1] * invCos - axis[2] * sin;
	theMat[3 * 2] = axis[0] * axis[2] * invCos + axis[1] * sin;

	theMat[1] = axis[0] * axis[1] * invCos + axis[2] * sin;
	theMat[3 + 1] = axis[1] * axis[1] + (1 - axis[1] * axis[1]) * cos;
	theMat[3 * 2 + 1] = axis[1] * axis[2] * invCos - axis[0] * sin;

	theMat[2] = axis[0] * axis[2] * invCos - axis[1] * sin;
	theMat[3 + 2] = axis[1] * axis[2] * invCos + axis[0] * sin;
	theMat[3 * 2 + 2] = axis[2] * axis[2] + (1 - axis[2] * axis[2]) * cos;
	return theMat;
}

export const instanceList = [
	new Instance(nullRotation, vec3.fromValues(0, 0, -25)),
	new Instance(rotateX, vec3.fromValues(-5, -5, -25)),
	new Instance(rotateY, vec3.fromValues(-5, 5, -25)),
	new Instance(rotateZ, vec3.fromValues(5, 5, -25)),
	new Instance(rotateAxis, vec3.fromValues(5, -5, -25))
];
