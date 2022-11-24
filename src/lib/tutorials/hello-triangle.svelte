<script lang="ts">
	import { Canvas, assert } from '$lib';

	let gl: WebGL2RenderingContext;

	let destroy: () => void;

	function createShader(eShaderType: number, strShaderFile: string): WebGLShader {
		const shader = gl.createShader(eShaderType);
		assert(shader);

		gl.shaderSource(shader, strShaderFile);

		gl.compileShader(shader);

		const status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (!status) {
			const strInfoLog = gl.getShaderInfoLog(shader);
			const strShaderType = {
				[gl.VERTEX_SHADER]: 'vertex',
				[gl.FRAGMENT_SHADER]: 'fragment'
			}[eShaderType];
			console.error(`Compile failure in ${strShaderType}:\n${strInfoLog}`);
		}

		return shader;
	}

	function createProgram(shaderList: WebGLShader[]): WebGLProgram {
		const program = gl.createProgram();
		assert(program);

		for (const shader of shaderList) {
			gl.attachShader(program, shader);
		}

		gl.linkProgram(program);

		const status = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (!status) {
			const strInfoLog = gl.getProgramInfoLog(program);
			console.error(`Linker failure: ${strInfoLog}`);
		}

		for (const shader of shaderList) {
			gl.detachShader(program, shader);
		}

		return program;
	}

	let theProgram: WebGLProgram;

	const strVertexShader = `#version 300 es
in vec4 position;
void main() {
	gl_Position = position;
}
`;

	const strFragmentShader = `#version 300 es
precision highp float;
out vec4 outputColor;
void main() {
	outputColor = vec4(1, 1, 1, 1);
}
`;

	function initializeProgram() {
		const shaderList = [
			createShader(gl.VERTEX_SHADER, strVertexShader),
			createShader(gl.FRAGMENT_SHADER, strFragmentShader)
		];

		theProgram = createProgram(shaderList);

		for (const shader of shaderList) {
			gl.deleteShader(shader);
		}
	}

	const vertexPositions = new Float32Array([
		0.75, 0.75, 0, 1, 0.75, -0.75, 0, 1, -0.75, -0.75, 0, 1
	]);

	let positionBufferObject: WebGLBuffer;
	let vao: WebGLVertexArrayObject;
	let positionAttribLocation: number;

	function initializeVertexBuffer() {
		const buffer = gl.createBuffer();
		assert(buffer);
		positionBufferObject = buffer;

		gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferObject);
		gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	function init() {
		initializeProgram();
		initializeVertexBuffer();

		const vertexArray = gl.createVertexArray();
		assert(vertexArray);
		vao = vertexArray;
		gl.bindVertexArray(vao);

		positionAttribLocation = gl.getAttribLocation(theProgram, 'position');
	}

	function display() {
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		gl.useProgram(theProgram);

		gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferObject);
		gl.enableVertexAttribArray(positionAttribLocation);
		gl.vertexAttribPointer(positionAttribLocation, 4, gl.FLOAT, false, 0, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 3);

		gl.disableVertexAttribArray(positionAttribLocation);
		gl.useProgram(null);
	}

	const aspectRatio = 1;

	function reshape(width: number, height: number) {
		let x = 0;
		let y = 0;
		let viewportWidth = width;
		let viewportHeight = height;
		if (width > aspectRatio * height) {
			viewportWidth = aspectRatio * height;
			x = (width - viewportWidth) / 2;
		} else {
			viewportHeight = width / aspectRatio;
			y = (height - viewportHeight) / 2;
		}
		gl.viewport(x, y, viewportWidth, viewportHeight);
		// to ignore aspect ratio:
		// gl.viewport(0, 0, width, height);
	}

	function keyboard(key: number) {
		switch (key) {
			case 27:
				destroy();
				break;
		}
	}
</script>

<Canvas bind:gl bind:destroy {init} {reshape} {display} {keyboard} />
