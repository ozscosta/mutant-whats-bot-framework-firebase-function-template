const { ActivityHandler, StatusCodes } = require('botbuilder');
const { db } = require('./firebase');

const CONVERSATION_DATA_PROPERTY = "CONVERSATION_DATA_PROPERTY"

class BotExemplo extends ActivityHandler {
    constructor(conversationState) {
        super();

        if (!conversationState) throw new Error("[BotTriagem]: Missing parameter. conversationState is required");

        this.conversationState = conversationState;
        this.conversationDataAccessor = this.conversationState.createProperty(CONVERSATION_DATA_PROPERTY)

        this.onMessage(async (context, next) => {
            this.conversationData = await this.conversationDataAccessor.get(context, {})

            if (context.activity.channelData.actionType === "start-conversation") {
                // Quando há um start-conversation
                await this.startConversation(context)
            }

            else if (context.activity.channelData.actionType === "message") {
                // quando chega uma mensagem
                await this.handleMessage(context)
            }

            await next()
        })
    }

    async run(context) {
        await super.run(context)

        await this.conversationState.saveChanges(context, false)
    }

    async startConversation(context) {
        const {
            conversationId,
            transfer_to: transferTo,
            close: closeUrl,
            ticket: ticketId,
            token,
            start_message: startMessage,
            cookie,
            message_url: messageUrl
        } = context.activity.channelData

        const data = {
            transferTo,
            closeUrl,
            ticketId,
            token,
            startMessage,
            cookie,
            messageUrl
        }

        this.conversationData.conversationId = conversationId

        const flow = {
            currentStep: 'tipo_pessoa',
            promptTipoPessoa: false
        }

        await db.collection("messages").doc(conversationId).set({
            userData: {},
            conversationData: data,
            flow
        });

        context.activity.channelData = data;

        console.info(JSON.stringify({ closeUrl, closeUrl, cookie, token }))

        await context.sendActivity("Olá, bem vindo! Sou um bot inteligente e vou te auxiliar nesse atendimento.");

        await context.sendActivity((
            "Para melhor lhe atender, preciso que me informe alguns dados. Informe o número da opção correta:\n" +
            "<b>1</b> - Pessoa jurídica\n" +
            "<b>2</b> - Pessoa física"
        ));
    }

    async handleMessage(context) {
        const { conversationId } = context.activity.channelData

        this.messageDb = db.collection("messages").doc(conversationId)
        this.docDbData = await this.messageDb.get()
        const messageData = this.docDbData.data()

        // If the conversation has not yet started in the bot
        if (!this.docDbData.exists) {
            context.turnState.set("httpStatus", StatusCodes.BAD_REQUEST)
            context.turnState.set("httpBody", {
                "error": true,
                "message": "This conversation has not yet started in the bot."
            })

            return
        }

        // Check if the message has not already been transferred
        if (messageData.conversationData.transferredIn !== undefined) {
            context.turnState.set("httpStatus", StatusCodes.BAD_REQUEST)
            context.turnState.set("httpBody", {
                "error": true,
                "message": "This conversation has already been transferred to the attendent."
            })

            return
        }

        // Check if the message has not already been closed
        if (messageData.conversationData.closedIn !== undefined) {
            context.turnState.set("httpStatus", StatusCodes.BAD_REQUEST)
            context.turnState.set("httpBody", {
                "error": true,
                "message": "This conversation has already been closed."
            })

            return
        }

        this.conversationData = messageData.conversationData;
        context.activity.channelData = messageData.conversationData

        const flow = messageData.flow || {}

        this.userData = messageData.userData

        // A partir daqui, o bot entra em ação

        const text = context.activity.text

        if (["transferir", "transfere"].includes(text.toLowerCase())) {
            await context.sendActivity('Conforme sua solicitação, estarei te transferindo para um atendente, por favor aguarde!')

            await this.transferConversation(context.activity, context)
            return
        }

        if (["encerrar", "fechar"].includes(text.toLowerCase())) {
            await context.sendActivity('Conforme sua solicitação, estarei encerrando essa conversa.')

            await this.closeConversation(context.activity, context)
            return
        }

        // Aqui vai o código do seu bot :) Divirta-se

        await this.docDbData.ref.update({
            userData: this.userData,
            conversationData: this.conversationData,
            flow,
            lastInteraction: new Date()
        })
    }

    async transferConversation(activity, context) {
        activity.type = 'Handoff'
        await context.sendActivity(activity)

        await this.docDbData.ref.update({
            conversationData: {
                transferredIn: new Date().toISOString()
            }
        })
    }

    async closeConversation(activity, context) {
        activity.type = 'EndOfConversation'
        await context.sendActivity(activity)

        await this.docDbData.ref.update({
            conversationData: {
                closedIn: new Date().toISOString()
            }
        })
    }
}

module.exports.BotExemplo = BotExemplo;