function shuffleString(str) {
	const arr = str.split('');
	let n = arr.length;

	for (let i = n - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));

		[arr[i], arr[j]] = [arr[j], arr[i]]; // ES6 array destructuring for swapping
	}

	return arr.join('');
}

function truncateString(s, truncLength) {
	if (s.length <= truncLength) {
		return s;
	}

	return s.slice(0, truncLength);
}

function hideString(s) {
	const buf = [];
	for (const c of s) {
		if (c === ' ') {
			buf.push(' ');
		} else {
			buf.push('\u2588');
		}
	}

	return buf.join('');
}

module.exports = { hideString, truncateString };
