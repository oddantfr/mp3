// export const actionNames = ['play', 'wait'] as const;
export const ActionName = {
	PLAY: 'play',
	WAIT: 'wait',
	NEXT: 'next',
	RANDOM: 'random',
} as const;

export type PlayAction = {
	name: 'play';
	playbackRate: number;
};
export type WaitAction = {
	name: 'wait';
	waitUnit: 's' | 'm' | 'h';
	waitNumber: number;
};
export type NextAction = {
	name: 'next';
	loop: boolean;
};
export type RandomAction = {
	name: 'random';
};

export type Progressable = {
	progress?: number
}

export type ActionValue = PlayAction | WaitAction | NextAction | RandomAction;
