import { mat4, vec2, vec3 } from 'gl-matrix';
import { degToRad } from '../framework';
import { assert } from '../utils';

/**
 * Implements a stack for glm::mat4 transformations.

 * A matrix stack is a sequence of transforms which you can preserve and restore as needed. The
 * stack has the concept of a "current matrix", which can be retrieved with the Top() function.
 * The top matrix can even be obtained as a float array. The pointer returned will remain valid until
 * this object is destroyed (though its values will change when you modify the current matrix).
 * This is useful for uploading matrices to OpenGL via
 * [`glUniformMatrix4fv`](http://www.opengl.org/wiki/GLAPI/glUniform).

 * The other functions will right-multiply a transformation matrix with the current matrix, thus
 * changing the current matrix.

 * The main power of the matrix stack is the ability to preserve and restore matrices in a stack fashion.
 * The current matrix can be preserved on the stack with Push() and the most recently preserved matrix
 * can be restored with Pop(). You must ensure that you do not Pop() more times than you Push(). Also,
 * while this matrix stack does not have an explicit size limit, if you Push() more times than you Pop(),
 * then you can eventually run out of memory (unless you create and destroy the MatrixStack every frame).

 * The best way to manage the stack is to never use the Push() and Pop() methods directly.
 * Instead, use the PushStack object to do all pushing and popping. That will ensure that
 * overflows and underflows cannot not happen.
 */
export class MatrixStack {
	// Initializes the matrix stack with the identity matrix.
	currMatrix = mat4.create();
	stack: mat4[] = [];

	// Initializes the matrix stack with the given matrix.
	constructor(initialMatrix?: mat4) {
		if (initialMatrix) {
			this.currMatrix = initialMatrix;
		}
	}

	// Preserves the current matrix on the stack.
	push() {
		this.stack.push(this.currMatrix);
	}

	// Restores the most recently preserved matrix.
	pop() {
		const popped = this.stack.pop();
		assert(popped);
		this.currMatrix = popped;
	}

	// Restores the current matrix to the value of the most recently preserved matrix.
	// This function does not affect the depth of the matrix stack.
	reset() {
		const top = this.stack.at(-1);
		assert(top);
		this.currMatrix = top;
	}

	// Retrieve the current matrix.
	top(): mat4 {
		return this.currMatrix;
	}

	/**
	 * Rotation Matrix Functions
	 *
	 * These functions right-multiply the current matrix with a rotation matrix of some form.
	 * All rotation angles are counter-clockwise for an observer looking down the axis direction.
	 * If an observer is facing so that the axis of rotation is pointing directly towards the user,
	 * then positive angles will rotate counter-clockwise.
	 **/

	// Applies a rotation matrix about the given axis, with the given angle in degrees.
	rotate(axis: vec3, angDegCCW: number) {
		this.currMatrix = mat4.rotate(mat4.create(), this.currMatrix, degToRad(angDegCCW), axis);
	}

	// Applies a rotation matrix about the given axis, with the given angle in radians.
	rotateRadians(axisOfRotation: vec3, angRadCCW: number) {
		const cos = Math.cos(angRadCCW);
		const invCos = 1 - cos;
		const sin = Math.sin(angRadCCW);

		const axis = vec3.normalize(vec3.create(), axisOfRotation);

		const theMat = mat4.create();
		theMat[0] = axis[0] * axis[0] + (1 - axis[0] * axis[0]) * cos;
		theMat[4] = axis[0] * axis[1] * invCos - axis[2] * sin;
		theMat[4 * 2] = axis[0] * axis[2] * invCos + axis[1] * sin;

		theMat[1] = axis[0] * axis[1] * invCos + axis[2] * sin;
		theMat[4 + 1] = axis[1] * axis[1] + (1 - axis[1] * axis[1]) * cos;
		theMat[4 * 2 + 1] = axis[1] * axis[2] * invCos - axis[0] * sin;

		theMat[2] = axis[0] * axis[2] * invCos - axis[1] * sin;
		theMat[4 + 2] = axis[1] * axis[2] * invCos + axis[0] * sin;
		theMat[4 * 2 + 2] = axis[2] * axis[2] + (1 - axis[2] * axis[2]) * cos;
		this.currMatrix = mat4.multiply(mat4.create(), this.currMatrix, theMat);
	}

	// Applies a rotation matrix about the +X axis, with the given angle in degrees.
	rotateX(angDegCCW: number) {
		this.rotate(vec3.fromValues(1, 0, 0), angDegCCW);
	}

	// Applies a rotation matrix about the +Y axis, with the given angle in degrees.
	rotateY(angDegCCW: number) {
		this.rotate(vec3.fromValues(0, 1, 0), angDegCCW);
	}

	// Applies a rotation matrix about the +Z axis, with the given angle in degrees.
	rotateZ(angDegCCW: number) {
		this.rotate(vec3.fromValues(0, 0, 1), angDegCCW);
	}

	/**
	 * Scale Matrix Functions
	 *
	 * These functions right-multiply the current matrix with a scaling matrix of some form.
	 **/

	// Applies a scale matrix, with the given glm::vec3 as the axis scales.
	scale(scaleVec: vec3): void;
	// Applies a scale matrix, with the given values as the axis scales.
	scale(scaleX: number, scaleY: number, scaleZ: number): void;
	// Applies a uniform scale matrix.
	scale(uniformScale: number): void;
	scale(scale: number | vec3, scaleY?: number, scaleZ?: number) {
		if (typeof scale == 'object') {
			this.currMatrix = mat4.scale(mat4.create(), this.currMatrix, scale);
		} else if (typeof scale == 'number' && typeof scaleY == 'number' && typeof scaleZ == 'number') {
			this.scale(vec3.fromValues(scale, scaleY, scaleZ));
		} else if (typeof scale == 'number') {
			this.scale(vec3.fromValues(scale, scale, scale));
		} else {
			throw new Error('unreachable');
		}
	}

	/**
	 * Translation Matrix Functions
	 *
	 * These functions right-multiply the current matrix with a translation matrix of some form.
	 **/

	// Applies a translation matrix, with the given glm::vec3 as the offset.
	translate(offsetVec: vec3): void;
	// Applies a translation matrix, with the given X, Y and Z values as the offset.
	translate(transX: number, transY: number, transZ: number): void;
	translate(trans: number | vec3, transY?: number, transZ?: number): void {
		if (typeof trans == 'object') {
			this.currMatrix = mat4.translate(mat4.create(), this.currMatrix, trans);
		} else if (typeof trans == 'number' && typeof transY == 'number' && typeof transZ == 'number') {
			this.translate(vec3.fromValues(trans, transY, transZ));
		} else {
			throw new Error('unreachable');
		}
	}

	/**
	 * Camera Matrix Functions
	 *
	 * These functions right-multiply the current matrix with a matrix that transforms from a world space to
	 * the camera space expected by the Perspective() or Orthographic() functions.
	 **/

	/**
	 * Applies a matrix that transforms to a camera-space defined by a position, a target in the world, and an up direction.
	 * @param cameraPos The world-space position of the camera.
	 * @param lookatPos The world-space position the camera should be facing. It should not be equal to \a cameraPos.
	 * @param upDir The world-space direction vector that should be considered up. The generated matrix will be bad
	 * if the up direction is along the same direction as the direction the camera faces (the direction between
	 * `cameraPos` and `lookatPos`).
	 */
	lookAt(cameraPos: vec3, lookatPos: vec3, upDir: vec3) {
		this.currMatrix = mat4.multiply(
			mat4.create(),
			this.currMatrix,
			mat4.lookAt(mat4.create(), cameraPos, lookatPos, upDir)
		);
	}

	/**
	 * Projection Matrix Functions
	 *
	 * These functions right-multiply the current matrix with a projection matrix of some form. These
	 * functions all transform positions into the 4D homogeneous space expected by the output of
	 * OpenGL vertex shaders. As such, these can be used directly with GLSL shaders.
	 *
	 * The space that these matrices transform from is defined as follows. The pre-projection space,
	 * called camera space or eye space, has the camera/eye position at the origin. The camera faces down the
	 * -Z axis, so objects with larger negative Z values are farther away. +Y is up and +X is to the right.
	 */

	/**
	 * Applies a standard, OpenGL-style perspective projection matrix.
	 * @param degFOV The field of view. This is the angle in degrees between directly forward and the farthest
	 * visible point horizontally.
	 * @param aspectRatio The ratio of the width of the view area to the height.
	 * @param zNear The closest camera-space distance to the camera that can be seen.
	 * The projection will be clipped against this value. It cannot be negative or 0.0.
	 * @param zFar The farthest camera-space distance from the camera that can be seen.
	 * The projection will be clipped against this value. It must be larger than \a zNear.
	 */
	perspective(degFOV: number, aspectRatio: number, zNear: number, zFar: number) {
		this.currMatrix = mat4.multiply(
			mat4.create(),
			this.currMatrix,
			mat4.perspective(mat4.create(), degToRad(degFOV), aspectRatio, zNear, zFar)
		);
	}

	/**
	 * Applies a standard, OpenGL-style orthographic projection matrix.
	 * @param left The left camera-space position in the X axis that will be captured within the projection.
	 * @param right The right camera-space position in the X axis that will be captured within the projection.
	 * @param bottom The bottom camera-space position in the Y axis that will be captured within the projection.
	 * @param top The top camera-space position in the Y axis that will be captured within the projection.
	 * @param zNear The front camera-space position in the Z axis that will be captured within the projection.
	 * @param zFar The rear camera-space position in the Z axis that will be captured within the projection.
	 */
	orthographic(
		left: number,
		right: number,
		bottom: number,
		top: number,
		zNear: number,
		zFar: number
	) {
		this.currMatrix = mat4.multiply(
			mat4.create(),
			this.currMatrix,
			mat4.ortho(mat4.create(), left, right, bottom, top, zNear, zFar)
		);
	}

	/**
	 * Applies an ortho matrix for pixel-accurate reproduction.
	 *
	 * A common use for orthographic projections is to create an ortho matrix that allows for pixel-accurate
	 * reproduction of textures. It allows you to provide vertices directly in window space.
	 *
	 * The camera space that this function creates can have the origin at the top-left (with +y going down)
	 * or bottom-left (with +y going up). Note that a top-left orientation will have to flip the Y coordinate,
	 * which means that the winding order of any triangles are reversed.
	 *
	 * The depth range is arbitrary and up to the user.
	 *
	 * @param size The size of the window space.
	 * @param depthRange The near and far depth range. The x coord is zNear, and the y coord is zFar.
	 * @param isTopLeft True if this should be top-left orientation, false if it should be bottom-left.
	 */
	pixelPerfectOrtho(size: vec2, depthRange: vec2, isTopLeft: boolean) {
		if (isTopLeft) {
			this.translate(-1, 1, (depthRange[0] + depthRange[1]) / 2);
			this.scale(2 / size[0], -2 / size[1], 1);
		} else {
			this.translate(-1, -1, (depthRange[0] + depthRange[1]) / 2);
			this.scale(2 / size[0], 2 / size[1], 2 / (depthRange[1] - depthRange[0]));
		}
	}

	/**
	 * Matrix Application
	 * These functions right-multiply a user-provided matrix by the current matrix; the result
	 * becomes the new current matrix.
	 */

	// Right-multiplies the current matrix with the given one, making the result new current matrix.
	applyMatrix(theMatrix: mat4) {
		this.currMatrix = mat4.multiply(mat4.create(), this.currMatrix, theMatrix);
	}

	/**
	 * Matrix Setting
	 * These functions directly set the value of the current matrix, replacing the old value.
	 * Previously preserved matrices on the stack are unaffected.
	 */

	// The given matrix becomes the current matrix.
	setMatrix(theMatrix: mat4) {
		this.currMatrix = theMatrix;
	}

	// Sets the current matrix to the identity matrix.
	setIdentity() {
		this.currMatrix = mat4.create();
	}
}
