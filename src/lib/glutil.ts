import { assert } from './utils';

export function compileShader(gl: WebGL2RenderingContext, shaderType: number, shaderText: string) {
	const shader = gl.createShader(shaderType);
	assert(shader);
	gl.shaderSource(shader, shaderText);
	gl.compileShader(shader);

	throwIfShaderCompileFailed(gl, shader);

	return shader;
}

export function linkProgram(gl: WebGL2RenderingContext, shaders: WebGLShader[]): WebGLProgram {
	// if (isSeparable) ThrowIfNotSeparable();

	const program = gl.createProgram();
	assert(program);

	// if (isSeparable) gl::ProgramParameteri(program, gl::PROGRAM_SEPARABLE, gl::TRUE_);

	return linkProgram1(gl, program, shaders);
}

function linkProgram1(gl: WebGL2RenderingContext, program: WebGLProgram, shaders: WebGLShader[]) {
	for (const shader of shaders) {
		gl.attachShader(program, shader);
	}

	gl.linkProgram(program);
	throwIfProgramLinkFailed(gl, program);

	for (const shader of shaders) {
		gl.detachShader(program, shader);
	}

	return program;
}

class CompileLinkException extends Error {
	constructor(gl: WebGL2RenderingContext, shader: WebGLShader);
	constructor(gl: WebGL2RenderingContext, program: WebGLProgram);
	constructor(gl: WebGL2RenderingContext, shaderOrProgram: WebGLShader | WebGLProgram) {
		let strInfoLog;
		if (shaderOrProgram instanceof WebGLShader) {
			const shader = shaderOrProgram;
			strInfoLog = gl.getShaderInfoLog(shader);
			gl.deleteShader(shader);
		} else if (shaderOrProgram instanceof WebGLProgram) {
			const program = shaderOrProgram;
			strInfoLog = gl.getProgramInfoLog(program);
			gl.deleteProgram(program);
		}
		assert(strInfoLog);
		super(strInfoLog);
	}
}

function throwIfShaderCompileFailed(gl: WebGL2RenderingContext, shader: WebGLShader) {
	const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (!status) {
		throw new CompileLinkException(gl, shader);
	}
}

function throwIfProgramLinkFailed(gl: WebGL2RenderingContext, program: WebGLProgram) {
	const status = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!status) {
		throw new CompileLinkException(gl, program);
	}
}
