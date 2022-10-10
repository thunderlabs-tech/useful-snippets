// https://stackoverflow.com/questions/42999983/typescript-removing-readonly-modifier
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };
