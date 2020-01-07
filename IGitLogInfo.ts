interface IGitLogInfo {
	sha: string;
	author: string;
	date: string;
	commitMsg: string;
	insertions: number;
	deletions: number;
}

export { IGitLogInfo };
