Esquelo para geração de bots usando Bot Framework e Mutant Whats
======

Esqueleto para aplicação de bot usando o Bot Framework da Microsoft e o broker
de WhatsApp da Mutant (Mutant Whats). Esse projeto foi desenhado pra ser "deployado"
com as functions do firebase e usando o firebase firestore como banco de dados.

Esse esqueleto já está configurado para receber/enviar mensagens via "mutant whats"
e também "encerrar conversa" e "transferir conversa para atendente, via EZFront".

## Configuração inicial do projeto

Para executar o projeto, é necessário configurar o ambiente seguindo o tutorial 
do próprio firebase, [nesse link](https://firebase.google.com/docs/functions/get-started#set-up-node.js-and-the-firebase-cli)

Caso queira executar o projeto localmente, [siga esses passos](https://firebase.google.com/docs/functions/get-started#emulate-execution-of-your-functions)

Para conectar ao firestore, o banco de dados que usamos nesse esqueleto,
é necessário seguir os passos [nesse link](https://firebase.google.com/docs/firestore/quickstart#initialize)

## Desenvolvendo seu bot

Apos seguir os passos para configurar o projeto, insira o código do seu bot no arquivo `functions/bot.js` a partir da linha 151
