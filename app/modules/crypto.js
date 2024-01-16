'use strict';

const crypto = require('crypto');

const ENCRYPTION_KEY = CONFIG.crypto.key; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

// AES 256 Encrypt
exports.enc = (str) => {
	if (str) {
		const secretKeyToByteArray = Buffer.from(ENCRYPTION_KEY, 'utf8');
		const ivParameter = Buffer.from(ENCRYPTION_KEY.slice(0, 16));
		const cipher = crypto.createCipheriv('aes-256-cbc', secretKeyToByteArray, ivParameter);
		let encryptedValue = cipher.update(str, 'utf8', 'base64');
		encryptedValue += cipher.final('base64');
		return encryptedValue;
	} else {
		return str;
	}
};

// AES 256 Decrypt
exports.dec = (str) => {
	if (str) {
		const secretKeyToBufferArray = Buffer.from(ENCRYPTION_KEY, 'utf8');
		const ivParameter = Buffer.from(ENCRYPTION_KEY.slice(0, 16));
		const cipher = crypto.createDecipheriv('aes-256-cbc', secretKeyToBufferArray, ivParameter);
		let decryptedValue = cipher.update(str, 'base64', 'utf8');
		decryptedValue += cipher.final('utf8');
		return decryptedValue;
	} else {
		return str;
	}
};

// SHA 512 Encrypt (with Random Salt)
exports.sha512 = (str, onSuccess, onError) => {
	if (str) {
		crypto.randomBytes(54, (err, buf) => {
			const salt = buf.toString('base64');

			// crypto.pbkdf2 (문자열, 소금(랜덤값), 반복횟수, digest 길이, 인코딩방식
			crypto.pbkdf2 (str, salt, 100000, 64, 'sha512', async (err, key) => {
				if (!err) {
					if (typeof onSuccess === 'function') {
						onSuccess(key.toString('base64'), salt);
					} else {
						return;
					}
				} else {
					if (typeof onSuccess === 'function') {
						onError(err);
					} else {
						return;
					}
				}
			});
		});
	} else {
		if (typeof onSuccess === 'function') {
			onSuccess(str);
		} else {
			return;
		}
	}
};

// SHA 512 Encrypt (with Specific Salt)
exports.sha512BySalt = (str, salt, onSuccess, onError) => {
	if (str) {
		// crypto.pbkdf2 (문자열, 소금(랜덤값), 반복횟수, digest 길이, 인코딩방식
		crypto.pbkdf2 (str, salt, 100000, 64, 'sha512', async (err, key) => {
			if (!err) {
				if (typeof onSuccess === 'function') {
					onSuccess(key.toString('base64'));
				} else {
					return;
				}
			} else {
				if (typeof onSuccess === 'function') {
					onSuccess(err);
				} else {
					return;
				}
			}
		});
	} else {
		if (typeof onSuccess === 'function') {
			onSuccess(str);
		} else {
			return;
		}
	}
};

// SHA 512 Encrypt (with Specific Salt & Hax Mac) => Java 호환
exports.sha512BySaltWithHMac = (str, salt, onSuccess) => {
	const algoFormatted = "SHA-512".toLowerCase().replace('-', '');
	const hash = crypto.createHmac(algoFormatted, salt);
	hash.update(str);

	if (typeof onSuccess === 'function') {
		onSuccess(hash.digest('hex'));
	} else {
		return hash.digest('hex');
	}
};

// Salt 값 생성
exports.generateSalt = () => {
	return crypto.randomBytes(54).toString('base64');
};

// 임시 비밀번호 생성
exports.generateString = (length) => {
	let chars = 'abcdefghkmnopqrstuvwxyz0123456789~!@?';
	let chars_length = chars.length;
	let result = '';

	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars_length));
	}

	return result;
}