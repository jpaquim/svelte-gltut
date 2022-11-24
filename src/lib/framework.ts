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
	shaderType: number,
	shaderFilename: string,
	chapter: number
): Promise<WebGLShader> {
	const folder = String(chapter).padStart(2, '0');
	const module = await import(`./chapters/${folder}/data/${shaderFilename}.glsl?raw`);
	const shaderText = module.default;
	try {
		return compileShader(gl, shaderType, shaderText);
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
