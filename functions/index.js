const functions = require("firebase-functions");

const path = require('path');
const env = require('dotenv');

env.config({ path: path.join(__dirname, '..', '.env') });

const { ConversationState, MemoryStorage } = require('botbuilder');
const express = require('express');
const cors = require('cors');

const server = express();
server.use(express.json());
server.use(cors({ origin: true }));

const { MutantWhatsAdapter } = require('botframework-mutant-whats-adapter');

const botData = {
    id: '135',
    name: 'BOT-TRIAGEM-TESTES'
}

const mutantWhatsAdapter = new MutantWhatsAdapter(botData);

mutantWhatsAdapter.onTurnError = async (context, error) => {
    await context.sendTraceActivity(
        "OnTurnError Trace",
        `${error}`,
        "https://www.botframework.com/schemas/error",
        "TurnError"
    )
    await context.sendActivity("The bot encountered an error or bug.")
    await context.sendActivity("To continue to run this bot, please fix the bot source code.")
}

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);

const { BotExemplo } = require('./bot');

const bot = new BotExemplo(conversationState)

server.post('/start-conversation', async (req, res) => {
    await mutantWhatsAdapter.processActivity(req, res, "start-conversation", async (context) => {
        await bot.run(context)
    })
})

server.post('/messages', async (req, res) => {
    await mutantWhatsAdapter.processActivity(req, res, "message", async (context) => {
        await bot.run(context)
    })
})

exports.bot = functions.https.onRequest(server);
