const fs = require('fs');
const path = require('path');

function getMP3Locations(rootPath) {
	const items = [];

	function exploreDirectory(currentPath) {
		const files = fs.readdirSync(currentPath);
		const mp3Files = files.filter((file) =>
			file.toLowerCase().endsWith('.mp3')
		);

		if (mp3Files.length > 0) {
			const location = {
				path: currentPath.split(path.sep),
				files: mp3Files,
			};
			items.push(location);
		}

		for (const file of files) {
			const filePath = path.join(currentPath, file);
			const fileStats = fs.statSync(filePath);

			if (fileStats.isDirectory()) {
				exploreDirectory(filePath);
			}
		}
	}

	exploreDirectory(rootPath);
	return items;
}

const directoryPath = path.join('docs', 'files'); // Replace with the path to your "docs" directory
const result = getMP3Locations(directoryPath);
console.log(result);
