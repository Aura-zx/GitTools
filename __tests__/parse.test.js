import { parseGitLog } from '../src/parseGitLog';

const case1 = {
	case: `commit 4b07a8f139ad5513bf0275e5d878b6641eef322c
Author: Aura-zx <kaomygod@gmail.com>
Date:   Wed Dec 11 00:45:34 2019 +0800

    fix: delete test data

 1 file changed, 98 deletions(-)`,
	res: {
		sha: '4b07a8f139ad5513bf0275e5d878b6641eef322c',
		author: 'Aura-zx<kaomygod@gmail.com>',
		date: 'Wed Dec 11 00:45:34 2019 +0800',
		commitMsg: 'fix: delete test data',
		insertions: 0,
		deletions: 98
	}
};
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

test('parse single commit', () => {
	expect(parseGitLog(case1.case)).toMatchObject([ case1.res ]);
});
