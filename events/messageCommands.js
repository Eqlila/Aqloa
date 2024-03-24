const path = require('node:path');
const fs = require('node:fs');

const { Collection } = require('discord.js');

globalThis.commands = new Collection();

globalThis.commandsReload = () => {
	globalThis.commands = new Collection();

	console.error('\tKomendy:');

	const commandsDir = fs.readdirSync(config.directories.commandsDir).filter((fileName) => fileName.endsWith('.js'));

	for (let i = 0; i < commandsDir.length; i += 1) {
		const commandModulePath = path.join(process.cwd(), config.directories.commandsDir, commandsDir[i]);

		const commandModule = require(commandModulePath);

		if (typeof commandModule.name !== 'string' || typeof commandModule.execute !== 'function') {
			console.error(`${commandModulePath} is not a valid command module`);
			continue;
		}

		commands.set(commandModule.name, commandModule);

		console.log(`\t\t${commandsDir[i]} -> ${commandModule.name}`);
	}
}

globalThis.commandsReload();

module.exports = {
	name: 'messageCreate',
	async execute(message) {
		if (message.author.bot) return;

		let prefix = false;

		for (let i = 0; i < config.prefixes.length; i += 1) {
			const configuredPrefix = config.prefixes[i];

			if (message.content.startsWith(configuredPrefix)) {
				prefix = configuredPrefix;
				break;
			}
		}

		if (!prefix) {
			return;
		}

		const args = message.content.slice(prefix.length).trim().split(/ +/gmi);
		const command = globalThis.commands.get(args[0]);

		if (!command) {
			return;
		}

		try {
			await command.execute(message, args.slice(1), globalThis.client);
		} catch (e) {
			console.error(e);
			return await message.reply({
				content: 'błąd'
			});
		}
	}
}

