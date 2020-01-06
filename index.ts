#! /usr/bin/env node

import { readdirSync, lstatSync } from 'fs';
import { join, relative } from 'path';
import { exec } from 'child_process';

const root = process.cwd();

console.log(join(root, 'name'));

const excludes = [ '.git', '.gitignore' ];

function findAllFileNames(root: string): string[] {
	let fnames: string[] = [];
	const findName = (path: string) => {
		let names = readdirSync(path);
		names.forEach((name: string) => {
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

function parseLogInfo(stdoutInfo: string) {
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
