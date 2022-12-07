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
	parseFunc: (v: AttribData[], s: ReadableStream) => void;
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

		this.attribType?.parseFunc(this.dataArray, new ReadableStream());

		if (this.dataArray.length === 0) throw new Error('The attribute must have an array of values.');
		if (this.dataArray.length % this.size !== 0)
			throw new Error("The attribute's data must be a multiple of its size in elements.");
	}
}

class IndexData {}

class MeshData {}

export class Mesh {
	data = new MeshData();

	constructor(strFilename: string) {
		// TODO
	}

	render() {
		// TODO
	}
}
