const {bot} = require('./botconfig')
const {downloadFile,unzipFile,sendFiles} = require('./services')
module.exports = {

    testChat(chatId) {
        try {
            
        } catch (err) {
            delete state.chatId
            bot.sendMessage(chatId,'this is your msg: ')
        }
    },

    async unzipResponse(chatId,msg,pass) {
        try {
            const {filepath,filename} = await downloadFile(msg)
            const dir = await unzipFile(filepath,filename,pass)
            await sendFiles(dir,chatId)

            
            bot.sendMessage(chatId,'done')

        } catch (err) {
            bot.sendMessage(chatId,err.message);
        }
    }


}
