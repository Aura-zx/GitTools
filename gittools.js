#! /usr/bin/env node

const { readdirSync, lstatSync, writeFile, appendFile } = require('fs');
const { join } = require('path');
const { execSync } = require('child_process');

const cpath = process.cwd();
const excludes = [ '.eslintrc.js', 'gittools.js', '.DS_Store', 'package.json' ];

function findAllFilesName(root) {
	const fnames = [];
	const findName = (path) => {
		const files = readdirSync(path);
		files.forEach((name) => {
			const fpath = join(path, name);
			if (excludes.includes(name) === false) {
				if (lstatSync(fpath).isDirectory()) {
					findName(fpath);
				} else {
					fnames.push(fpath);
				}
			}
		});
	};

	findName(root);
	return fnames;
}

const fnames = findAllFilesName(cpath);

function getStatsByAuthor(info) {
	const stats = {};
	const lines = info
		.toString()
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.trim() !== '')
		.filter((line) => {
			return line.startsWith('Author') || line.startsWith('1 file changed');
		})
		.map((line, index) => (index % 2 === 0 ? line.split(':') : line.split(',')))
		.map((line, index, arrs) => (index % 2 === 0 ? [ ...line, ...arrs[index + 1] ] : []))
		.filter((line) => line.length !== 0);

	lines.forEach((line) => {
		const author = line[1].trim();
		let ins = 0;
		let del = 0;
		if (line.length === 4) {
			if (line[3].trim().includes('+')) {
				ins = parseInt(line[3].trim().split(' ')[0], 10);
			} else if (line[3].trim().includes('-')) {
				del = parseInt(line[3].trim().split(' ')[0], 10);
			}
		}
		if (line.length === 5) {
			ins = parseInt(line[3].trim().split(' ')[0], 10);
			del = parseInt(line[4].trim().split(' ')[0], 10);
		}
		if (stats.hasOwnProperty(author) === false) {
			stats[author] = { ins, del };
		} else {
			stats[author].ins += ins;
			stats[author].del += del;
		}
	});

	const statsArr = Object.keys(stats)
		.map((key) => {
			return { [key]: stats[key] };
		})
		.sort((stat1, stat2) => {
			const author1 = Object.keys(stat1)[0];
			const author2 = Object.keys(stat2)[0];
			const contribute = stat1[author1].ins + stat1[author1].del - (stat2[author2].ins + stat2[author2].del);
			if (contribute < 0) {
				return 1;
			}
			if (contribute > 0) {
				return -1;
			}
			return 0;
		});

	return statsArr;
}

// writeFile(`${__dirname}/ststs.txt`, Buffer.from('start\\n', 'utf-8'), (err) => {
// 	if (err) {
// 		console.log('写入文件错误', err);
// 	}
// });

// const groupByDir = {};
// let i = 0;
// fnames.forEach((fname) => {
// 	const stdout = execSync(`git log --follow --shortstat ${fname}`);
// 	const stats = getStatsByAuthor(stdout);
// 	const fpaths = fname.split('/').reverse();
// 	const fileStats = {
// 		file: `${fpaths[1]}/${fpaths[0]}`,
// 		data: stats
// 	};

// 	if (Object.keys(groupByDir).includes(fpaths[1])) {
// 		// groupByDir[fpaths[1]] = stats
// 	}

// 	appendFile(`${__dirname}/ststs.txt`, `${JSON.stringify(fileStats)}\n`, (err) => {
// 		if (err) {
// 			console.log('追加写入文件错误', err);
// 		}
// 	});
// 	console.log(i++);
// });

const stats = [
	{
		file: 'AnimationOperateFeedbackInfo/index.jsx',
		data: [ { 'piaoYunFei <yunfei.piao@duobei.com>': { ins: 51, del: 1 } } ]
	},
	{
		file: 'AnimationOperateFeedbackInfo/index.less',
		data: [ { 'piaoYunFei <yunfei.piao@duobei.com>': { ins: 32, del: 1 } } ]
	},
	{
		file: 'AnswerQuestionHoverSlideButton/index.jsx',
		data: [
			{ 'jasonzou <jinsong.zou@duobei.com>': { ins: 56, del: 0 } },
			{ 'piaoYunFei <yunfei.piao@duobei.com>': { ins: 2, del: 1 } }
		]
	},
	{
		file: 'AnswerQuestionHoverSlideButton/index.less',
		data: [
			{ 'jasonzou <jinsong.zou@duobei.com>': { ins: 0, del: 0 } },
			{ 'xrush <shuai.xie@duobei.com>': { ins: 0, del: 0 } }
		]
	},
	{
		file: 'AnswerQuestionsArea/index.jsx',
		data: [
			{ 'guokaigdg <guokaigdg@gmail.com>': { ins: 165, del: 63 } },
			{ 'jasonzou <jinsong.zou@duobei.com>': { ins: 93, del: 84 } },
			{ 'zhouxin <xin.zhou@duobei.com>': { ins: 1, del: 1 } }
		]
	},
	{
		file: 'AnswerQuestionsArea/index.less',
		data: [
			{ 'guokaigdg <guokaigdg@gmail.com>': { ins: 302, del: 178 } },
			{ 'jasonzou <jinsong.zou@duobei.com>': { ins: 85, del: 108 } }
		]
	},
	{
		file: 'AnswererSettings/index.jsx',
		data: [
			{ 'jasonzou <jinsong.zou@duobei.com>': { ins: 60, del: 72 } },
			{ 'zhouxin <xin.zhou@duobei.com>': { ins: 132, del: 0 } },
			{ 'guokaigdg <guokaigdg@gmail.com>': { ins: 7, del: 4 } }
		]
	},
	{
		file: 'AnswererSettings/index.less',
		data: [
			{ 'jasonzou <jinsong.zou@duobei.com>': { ins: 101, del: 102 } },
			{ 'zhouxin <xin.zhou@duobei.com>': { ins: 115, del: 0 } },
			{ 'guokaigdg <guokaigdg@gmail.com>': { ins: 29, del: 23 } }
		]
	},
	{
		file: 'AnswererStat/index.jsx',
		data: [
			{ 'zhouxin <xin.zhou@duobei.com>': { ins: 132, del: 7 } },
			{ 'jasonzou <jinsong.zou@duobei.com>': { ins: 70, del: 52 } }
		]
	},
	{
		file: 'AnswererStat/index.less',
		data: [
			{ 'jasonzou <jinsong.zou@duobei.com>': { ins: 74, del: 40 } },
			{ 'zhouxin <xin.zhou@duobei.com>': { ins: 62, del: 0 } }
		]
	},
	{
		file: 'AnswererStatHoverSlideButton/index.jsx',
		data: [
			{ 'jasonzou <jinsong.zou@duobei.com>': { ins: 39, del: 0 } },
			{ 'piaoYunFei <yunfei.piao@duobei.com>': { ins: 1, del: 1 } }
		]
	},
	{
		file: 'AnswererStatHoverSlideButton/index.less',
		data: [
			{ 'jasonzou <jinsong.zou@duobei.com>': { ins: 0, del: 0 } },
			{ 'xrush <shuai.xie@duobei.com>': { ins: 0, del: 0 } }
		]
	},
	{
		file: 'AnswererStatItem/index.jsx',
		data: [
			{ 'zhouxin <xin.zhou@duobei.com>': { ins: 116, del: 27 } },
			{ 'jasonzou <jinsong.zou@duobei.com>': { ins: 19, del: 40 } }
		]
	},
	{
		file: 'AnswererStatItem/index.less',
		data: [
			{ 'zhouxin <xin.zhou@duobei.com>': { ins: 92, del: 27 } },
			{ 'jasonzou <jinsong.zou@duobei.com>': { ins: 33, del: 48 } }
		]
	}
];

const res = {};
stats.map((stat) => {
	const p = Object.keys(stat.data[0])[0];
	if (res.hasOwnProperty(p)) {
		res[p].push(stat.file);
	} else {
		res[p] = [];
	}
});

console.log(res);
