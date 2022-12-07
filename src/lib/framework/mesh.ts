class RenderCmd {}

type AttribData = number | GLuint | GLint;
// TODO: GLfloat | GLint64 | GLintptr | GLsizei | GLuint64 | GLboolean;

interface PrimitiveType {
	primitiveName: string;
	primType: GLenum;
}

interface AttribType {
	nameFromFile: string;
	normalized: boolean;
	type: GLenum;
	numBytes: number;
	parseFunc: (v: AttribData[], s: string) => void;
	writeToBuffer: (e: GLenum, v: AttribData[], i: number, s: number) => void;
}

// PARSE_ARRAY_FUNCDEF

// WRITE_ARRAY_FUNCDEF

const allAttributeTypes: AttribType[] = [];

const allPrimitiveTypes: PrimitiveType[] = [];

// AttribTypeFinder

// PrimitiveTypeFinder

function getAttribType(type: string): AttribType {
	const attrib = allAttributeTypes.find((attribType) => attribType.nameFromFile === type);

	if (!attrib) {
		throw new Error("Unknown 'type' field.");
	}

	return attrib;
}

class Attribute {
	attribIx = 0xffffffff;
	attribType: AttribType | null = null;
	size = -1;
	isIntegral = false;
	dataArray: AttribData[] = [];

	constructor(attribElem: Element) {
		const attributeIndex = attribElem.getAttribute('index');
		if (attributeIndex === null || Number(attributeIndex) < 0 || Number(attributeIndex) > 16) {
			throw new Error('Attribute index must be between 0 and 16.');
		}
		this.attribIx = Number(attributeIndex);

		// TODO: ...

		this.attribType?.parseFunc(this.dataArray, '');

		if (this.dataArray.length === 0) throw new Error('The attribute must have an array of values.');
		if (this.dataArray.length % this.size !== 0)
			throw new Error("The attribute's data must be a multiple of its size in elements.");
	}
}

class IndexData {
	attribType: AttribType | null;
	dataArray: AttribData[] = [];
	// const AttribType *pAttribType;
	// std::vector<AttribData> dataArray;

	constructor(indexElem?: Element) {
		if (indexElem) {
			const type = indexElem.getAttribute('type');

			if (type != 'uint' && type != 'ushort' && type != 'ubyte')
				throw new Error("Improper 'type' attribute value on 'index' element.");

			this.attribType = getAttribType(type);

			// Read the text
			let s = '';
			for (const child of indexElem.children) {
				s += child.textContent;
			}
			this.attribType.parseFunc(this.dataArray, s);
			if (this.dataArray.length === 0)
				throw new Error('The index element must have an array of values.');
		} else {
			this.attribType = null;
		}
	}

	calcByteSize() {
		return this.dataArray.length * (this.attribType as AttribType).numBytes;
	}
}

function processRenderCmd(cmdElem: Element) {
	const cmd = new RenderCmd();

	return cmd;
}

type VAOMap = Record<string, GLuint>;
type VAOMapData = GLuint;

class MeshData {
	attribArraysBuffer: GLuint = 0;
	indexBuffer: GLuint = 0;
	vao: GLuint = 0;

	namedVAOs: VAOMap = {};

	primitives: RenderCmd[] = [];

	destroy() {
		// TODO
	}
}

export class Mesh {
	data = new MeshData();

	constructor(filename: string) {
		const attribs: Attribute[] = [];
		const attribIndexMap: Record<GLuint, number> = {}; // Maps from attribute indices to 'attribs' indices.

		const indexData: IndexData[] = [];

		const namedVaoList: [string, GLuint[]][] = [];

		{
			// TODO
		}
	}

	render(meshName?: string) {
		if (!meshName) {
			// TODO
		} else {
			// TODO
		}
	}

	deleteObjects() {
		// TODO
	}
}
