const path = require('node:path');
const fs = require('node:fs');

const dotenv = require('dotenv');
const { Client, GatewayIntentBits } = require('discord.js');

globalThis.config = require('./config.json');
dotenv.config();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent
	]
});
globalThis.client = client;

globalThis.reloadEvents = () => {
	client.removeAllListeners();

	const eventsDir = fs.readdirSync(config.directories.eventsDir).filter((fileName) => fileName.endsWith('.js'));

	console.log('Eventy:');

	for (let i = 0; i < eventsDir.length; i += 1) {
		const eventModulePath = path.join(process.cwd(), config.directories.eventsDir, eventsDir[i]);

		const eventModule = require(eventModulePath);

		if (typeof eventModule.name !== 'string' || typeof eventModule.execute !== 'function') {
			console.error(`${eventModulePath} is not a valid event module`);
			break;
		}

		client.on(eventModule.name, eventModule.execute);

		console.log(`\t${eventModulePath} -> ${eventModule.name}`);
	}
}

globalThis.reloadEvents();

client.login(process.env.DISCORD_BOT_TOKEN);

