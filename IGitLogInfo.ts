interface IGitLogInfo {
	commitId: string;
	date: string;
	commitMsg: string;
	insertions?: number;
	deletions?: number;
}

export { IGitLogInfo };
