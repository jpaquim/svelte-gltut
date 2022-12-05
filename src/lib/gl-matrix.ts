import { type mat3, mat4 } from 'gl-matrix';

// prettier-ignore
export const mat3ToMat4 = (m3: mat3) =>
	mat4.fromValues(
		m3[0], m3[1], m3[2], 0,
		m3[3], m3[4], m3[5], 0,
		m3[6], m3[7], m3[8], 0,
		0, 0, 0, 1
	);

export const print = {
	mat3(m3: mat3) {
		console.log(`[${m3[0]} ${m3[3]} ${m3[6]}]`);
		console.log(`[${m3[1]} ${m3[4]} ${m3[7]}]`);
		console.log(`[${m3[2]} ${m3[5]} ${m3[8]}]`);
	},
	mat4(m4: mat4) {
		console.log(`[${m4[0]} ${m4[4]} ${m4[8]} ${m4[12]}]`);
		console.log(`[${m4[1]} ${m4[5]} ${m4[9]} ${m4[13]}]`);
		console.log(`[${m4[2]} ${m4[6]} ${m4[10]} ${m4[14]}]`);
		console.log(`[${m4[3]} ${m4[7]} ${m4[11]} ${m4[15]}]`);
	}
};
