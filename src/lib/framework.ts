import { compileShader, linkProgram } from './glutil';

let gl: WebGL2RenderingContext;

export function setContext(ctx: WebGL2RenderingContext) {
	gl = ctx;
}

function handleError(error: unknown) {
	if (error instanceof Error) {
		console.error(error.message);
	} else {
		console.error(error);
	}
}

export async function loadShader(
	eShaderType: number,
	strShaderFilename: string
): Promise<WebGLShader> {
	const strShaderFile = (await import(`./shaders/${strShaderFilename}.glsl?raw`)).default;
	try {
		return compileShader(gl, eShaderType, strShaderFile);
	} catch (error) {
		handleError(error);
		throw error;
	}
}

export function createProgram(shaderList: WebGLShader[]): WebGLProgram {
	try {
		const prog = linkProgram(gl, shaderList);
		return prog;
	} catch (error) {
		handleError(error);
		throw error;
	} finally {
		for (const shader of shaderList) {
			gl.deleteShader(shader);
		}
	}
}
