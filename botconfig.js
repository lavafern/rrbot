require('dotenv').config()
const {TELEGRAM_BOT_TOKEN} = process.env
const telegramBot = require('node-telegram-bot-api')
const token = TELEGRAM_BOT_TOKEN
const bot = new telegramBot(token, {polling: true})

module.exports = {telegramBot,token,bot}