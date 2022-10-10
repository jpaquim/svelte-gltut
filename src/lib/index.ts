export function assert<T>(
	value: T,
	message = `Assert failed: ${value}`
): asserts value is NonNullable<T> {
	if (value === null || value === undefined) {
		throw new Error(message);
	}
}
