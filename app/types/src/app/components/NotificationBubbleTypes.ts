export type BubbleMessage = {
	type: 'error' | 'info' | 'success' | 'warning';
	message: string;
};
