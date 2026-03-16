const crypto = require('crypto');

const SALT_LENGTH = 16;

function generateSalt() {
	return crypto.randomBytes(SALT_LENGTH).toString('hex');
}

function hashPassword(password, salt) {
	return new Promise((resolve, reject) => {
		crypto.pbkdf2(password, salt, 310000, 32, 'sha256', function (err, hashedPassword) {
			if (err) {
				reject(err);
			} else {
				resolve(hashedPassword.toString('hex'));
			}
		});
	});
}

function validatePassword(password, salt, hashedPassword) {
	return new Promise((resolve, reject) => {
		hashPassword(password, salt)
			.then((hashedPassToValidate) => {
				const isValid = crypto.timingSafeEqual(
					Buffer.from(hashedPassword, 'hex'),
					Buffer.from(hashedPassToValidate, 'hex'),
				);

				if (isValid) {
					resolve(true);
				} else {
					resolve(false);
				}
			})
			.catch((err) => {
				reject(err);
			});
	});
}

module.exports = { hashPassword, generateSalt, validatePassword };
