import { IGitLogInfo } from './IGitLogInfo';

enum logAttr {
	SHA = 0,
	AUTHOR = 1,
	DATE = 2,
	COMMITMSG = 3,
	DIFF = 4
}

const LOGATTRSIZE = 5

function parseGitLog(log: string): IGitLogInfo[] {
	let gitLogInfo: IGitLogInfo[] = [];

	let progress = logAttr.SHA;
	const lines = log.toString().split('\r\n');
	lines.reduce((logs: IGitLogInfo[], cur: string) => {
		let attr = progress % LOGATTRSIZE
		if (attr === logAttr.SHA) {
			let log = {
				commit: cur.split(' ')[1]
			}
			logs.push(log)
			progress++;
			return logs
		} else if (attr === logAttr.AUTHOR) {
			logs[logs.length - 1].push(cur.split(':')[1].trim())
		}
	}, []);

	return gitLogInfo;
}
//
// const testInfo = `commit 4b07a8f139ad5513bf0275e5d878b6641eef322c
// Author: Aura-zx <kaomygod@gmail.com>
// Date:   Wed Dec 11 00:45:34 2019 +0800

//     fix: delete test data

//  1 file changed, 98 deletions(-)

// commit 55ff3e3acc6fbef19be1bbc88fae2fa50ad0fe6c
// Author: Aura-zx <kaomygod@gmail.com>
// Date:   Wed Dec 11 00:34:16 2019 +0800

//     feat: basic function

//  1 file changed, 217 insertions(+), 99 deletions(-)

// commit 2b342ff9884f1a67a449beb7bf08d6a775da3960
// Author: zhouxin <kaomygod@gmail.com>
// Date:   Tue Dec 10 18:15:16 2019 +0800

//     feat: get all files name and parse git log info

//  1 file changed, 108 insertions(+)`;
