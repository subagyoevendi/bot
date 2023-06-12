const { default: makeWASocket, DisconnectReason, useSingleFileAuthState, makeInMemoryStore, fetchLatestBaileysVersion } = require('@adiwajshing/baileys')
const { state } = useSingleFileAuthState(`./sesion.json`)
const messageHandler = require('./messageHandler')
const yargs = require('yargs/yargs')
const pino = require('pino')
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) })

global.yargs = yargs(process.argv).argv


async function connectToWhatsApp () {
	const { version, isLatest } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        printQRInTerminal: true,
        auth: state,
		browser: ['DistrictRp','Opera','1.0.0'],
		version
    })
	store.bind(sock.ev)

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            var _a, _b
			var shouldReconnect = ((_b = (_a = lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode) !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })

	sock.setStatus = (status) => {
		sock.query({
			tag: 'iq',
			attrs: {
			to: '@s.whatsapp.net',
			type: 'set',
			xmlns: 'status',
			},
			content: [{
			tag: 'status',
			attrs: {},
			content: Buffer.from(status, 'utf-8')
			}]
			})
			return status
		}

    sock.ev.on('messages.upsert', async (m) => {
    	m.messages.forEach(async (message) => {
			if (!message.message || message.key.fromMe || message.key && message.key.remoteJid == 'status@broadcast') return
			if (message.message.ephemeralMessage) {
				message.message = message.message.ephemeralMessage.message
			}
		
		try {
			await messageHandler(sock, message);
		} catch(e) {
			if (!global.yargs.dev) {
				console.log("[ERROR] " + e.message);
				sock.sendMessage(message.key.remoteJid, {"text":"Terjadi error! coba lagi nanti"}, { quoted: message });
			} else {
				console.log(e);
			}
		}
    	})
    })

}

connectToWhatsApp()