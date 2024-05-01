require('dotenv').config()
const {bot} = require('./botconfig') 
const { testChat, unzipResponse} = require('./respose')
const fs = require('fs')

state = {}

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const messageText = msg.text;

    console.log('msg info :',msg);

    if (messageText === '/test') {
        return bot.sendMessage(chatId,'success')
    } 

    if (messageText === '/img') {
        fs.readFile('./w.PNG',(err,data) => {
            if (err) console.log('errrr');
            console.log('buf = ', data);
            bot.sendPhoto(chatId,data)
        })
        return 
    }

    if (messageText === '/chatmode') {
        state[`${chatId}`] = 'chatmode';
        return bot.sendMessage(chatId,'hello youre in chat mode, pls enter a message:')
    }

    
    if (state[`${chatId}`] === 'chatmode') {
        console.log('outside func');
        delete state.chatId
        testChat(chatId,bot)
        return
    }
    
    if (messageText === '/extract') {
        state[`${chatId}`] = 'extractmode-password';
        return bot.sendMessage(chatId,'please send your rar password : (type "no" if no password)')
    }

    if (state[`${chatId}`] === 'extractmode-password') {
        // state[`${chatId}`] = 'extractmode';
        console.log('msg:',msg);
        state[`${chatId}`] = 'extractmode';
        state[`${chatId}-rarpass`] = msg.text;

        return bot.sendMessage(chatId,'now please send you RAR file :')
    }

    if (state[`${chatId}`] === 'extractmode') {
        delete state[`${chatId}`] 
        console.log('state:',state);
        console.log('in extract');
        unzipResponse(chatId,msg,state[`${chatId}-rarpass`]);
        console.log('putside ww');
        delete state[`${chatId}-rarpass`]

        return
    }

    return bot.sendMessage(chatId,'command not recognize')

})

