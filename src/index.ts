#! /usr/bin/env node
import { parseGitLog } from "./parseGitLog";

const { readdirSync, lstatSync } = require('fs');
const { join, relative } = require('path');
const { exec } = require('child_process');

const root = process.cwd();

console.log(join(root, 'name'));

const excludes = ['.git', '.gitignore'];

function findAllFileNames(root: string): string[] {
	let fnames: string[] = [];
	const findName = (path: string) => {
		let files = readdirSync(path);
		files.forEach((file: string) => {
			let fpath = join(path, file);
			if (excludes.includes(file) === false) {
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

const fnames = findAllFileNames(root);
const relativeNames = fnames.map((fname) => relative(root, fname));

relativeNames.forEach((name) => {
	// on Windows use "file.js" instead of 'file.js'
	exec(`git log --follow --shortstat "${name}"`, (err: any, stdout: any, stderr: any) => {
		if (err) {
			console.log('err', err);
		}
		// console.log('stdout', stdout);
	});
});
