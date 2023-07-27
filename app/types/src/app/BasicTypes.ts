// this should be the ONLY usage of the "any" type and be ONLY used if there is no other possibility!
export type anyObject = {
	[key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};
