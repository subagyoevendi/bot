const cfg = require('./config.json')
const con = require('./lib/mysql')

module.exports = msgHandle = async (sock, message) => {
	try {
		const sender = message.isGroup ? (message.key.participant ? message.key.participant : message.participant) : message.key.remoteJid
		const sendNum = sender.split('@')[0]
		const ownerNumber = cfg.ownerBot[0]
		const isOwner = sendNum == ownerNumber
		const senderNumber = message.key.remoteJid
		const imageMessage = message.message.imageMessage
		const videoMessage = message.message.videoMessage
		const stickerMessage = message.message.stickerMessage
		const extendedTextMessage = message.message.extendedTextMessage
		const quotedMessageContext = extendedTextMessage && extendedTextMessage.contextInfo && extendedTextMessage.contextInfo
		const textMessage = message.message.conversation || message.message.extendedTextMessage && message.message.extendedTextMessage.text || imageMessage && imageMessage.caption || videoMessage && videoMessage.caption
		const args = textMessage.trim().split(/ +/).slice(1)
		let command, parameter
		if (textMessage) {
			// command = textMessage.trim().split(" ")[0]
			// parameter = textMessage.trim().split(" ").slice(1).join(" ")

			let a = textMessage.trim().split("\n")
			let b = ""
			command = a[0].split(" ")[0]
			b += a[0].split(" ").slice(1).join(" ")
			b += a.slice(1).join("\n")
			parameter = b.trim()
		}

		switch (command) {
			case "!help":
			{
				const text = `Halo kak selamat datang di *${sock.user.name}*!

	╭─❏ 『 *BOT MENU* 』
	║⎙─➤ help
	║⎙─➤ addakun
	║⎙─➤ addwl
	║⎙─➤ unwl
	┗⬣ ©️District Roleplay 2023`
				sock.sendMessage(senderNumber, { text }, { quoted: message })
			}
			break;
			case '!addakun': {
				if (!isOwner) return await sock.sendMessage(senderNumber, {"text": "Hanya bisa dilakukan oleh owner!"}, { quoted: message })
				const akun = args[0];
				if(!akun) return await sock.sendMessage(senderNumber, {"text": "Masukan nama akun!"}, { quoted: message })
				con.query(`SELECT * FROM whitelist WHERE username = '${akun}'`, (err, res) => {
					if(err) return console.log(err);
					if(!res[0])
					{
						const masukanNama = `INSERT INTO whitelist(username) VALUES ('${akun}')`
						con.query(masukanNama, function(err, res) {
						if(err) return console.log(err);
						if(!res[0]) {
							sock.sendMessage(senderNumber, { "text": `*Berhasil menambahkan akun ${akun} ke database!*`})
						}
					})
					} else {
						return sock.sendMessage(senderNumber, {"text": `*Akun dengan nama ${akun} sudah terdaftar!*`}, { quoted: message })
					}
				})
			}
			break;
			case '!addwl': {
				if (!isOwner) return await sock.sendMessage(senderNumber, {"text": "Hanya bisa dilakukan oleh owner!"}, { quoted: message })
				const akun = args[0];
				if(!akun) return await sock.sendMessage(senderNumber, {"text": "Masukan nama akun!"}, { quoted: message })
				con.query(`SELECT * FROM whitelist WHERE username = '${akun}'`, (err, res) => {
					if(err) return console.log(err);
					if(res[0])
					{
						var code = 1;
						con.query(`UPDATE whitelist SET wl ='${code}' WHERE username = '${akun}'`)
						sock.sendMessage(senderNumber, {"text": `*Berhasil menambahkan whitelist ke akun ${akun}!*`}, { quoted: message })
					} else {
						return sock.sendMessage(senderNumber, {"text": "Akun belum terdaftar!"}, { quoted: message })
					}
				})
			}
			break;
			case '!unwl': {
				if (!isOwner) return await sock.sendMessage(senderNumber, {"text": "Hanya bisa dilakukan oleh owner!"}, { quoted: message })
				const akun = args[0];
				if(!akun) return await sock.sendMessage(senderNumber, {"text": "Masukan nama akun!"}, { quoted: message })
				con.query(`SELECT * FROM whitelist WHERE username = '${akun}'`, (err, res) => {
					if(err) return console.log(err);
					if(res[0])
					{
						var code = 0;
						con.query(`UPDATE whitelist SET wl ='${code}' WHERE username = '${akun}'`)
						sock.sendMessage(senderNumber, {"text": `*Berhasil menghapus whitelist ke akun ${akun}!*`}, { quoted: message })
					} else {
						return sock.sendMessage(senderNumber, {"text": "Akun belum terdaftar!"}, { quoted: message })
					}
				})
			}
			break;
		}
	} catch (e) {
		console.log(e)
	}
}
