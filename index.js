#! /usr/bin/env node

const { readdirSync, lstatSync } = require('fs');
const { join, relative } = require('path');

const { exec } = require('child_process');

const root = process.cwd();

console.log(join(root, 'name'));

const excludes = [ '.git', '.gitignore' ];

function findAllFileNames(root) {
	let fnames = [];
	const findName = (path) => {
		let names = readdirSync(path);
		names.forEach((name) => {
			let fpath = join(path, name);
			if (excludes.includes(name)) {
				return;
			} else if (lstatSync(fpath).isDirectory()) {
				findName(fpath);
			} else {
				fnames.push(fpath);
			}
		});
	};
	findName(root);
	return fnames;
}

function parseLogInfo(stdoutInfo) {
	const info = stdoutInfo.toString().split('\n');
	return info;
}

const fnames = findAllFileNames(root);
const relativeNames = fnames.map((fname) => relative(root, fname));

relativeNames.forEach((name) => {
	// on Windows use "file.js" instead of 'file.js'
	exec(`git log --follow --shortstat "${name}"`, (err, stdout, stderr) => {
		if (err) {
			console.log('err', err);
		}
		// console.log('stdout', stdout);
	});
});
