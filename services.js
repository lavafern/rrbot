const path = require('path')
const fs = require('fs')
const {token} = require('./botconfig')
const axios = require('axios')
const {bot} = require('./botconfig')
const {DOCKER_VOLUME_PATH} = process.env


module.exports = {
    async downloadFile (msg) {
        try {
            let zipFile = `http://localhost:8081/bot${token}/getFile?file_id=${msg.document.file_id}`;

            zipFile = await axios.get(zipFile)

            filePath = zipFile.data.result.file_path
            const fileName =  filePath.split('documents/')
            const fileFullPath = path.join(DOCKER_VOLUME_PATH,fileName[1])

            return {filepath: fileFullPath,filename: zipFile.data.result.file_id};

        } catch (err) {
            console.log('err at downloadfile:',err);
            throw err;
        }
    },

    async unzipFile(filepath,filename,pass) {
        const module = await import('unrar-promise')
        const {unrar} = module

        const password = pass !== 'no' ? pass : ''
        try {

            if (!fs.existsSync('.\\unzipped')) fs.mkdirSync('.\\unzipped');
            const targetDir = '.\\unzipped\\'+filename

            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);


            await unrar(filepath, targetDir, {
                password: password
            });

            fs.rmSync(path.join(filepath), { recursive: true, force: true })

            return targetDir;

        } catch (err) {
            console.log('err at unzipfile : ',err);
            throw err;
        }
    },


    async sendFiles(dir,chatId) {
        try {
            const parent = fs.readdirSync(dir).map((i) => {
                return dir+'\\'+i
            })
            const directories = [...parent]

            for (let i = 0; i < directories.length; i++) {
                // const targetFile = dir+'\\'+directories[i]
                const mapped = await new Promise((resolve,reject) => {
                    const tempDir = []
                    
                    fs.lstat(directories[i], async (err,stats) => {
                        if (err) {
                            reject(new Error("error at lstat "+err.message))
                        }
                        if (stats.isDirectory()) {
                            const files = fs.readdirSync(directories[i])
                            const previouspath = directories[i]

                            const allPromises = []

                            for (const i of files) {
                                const filetype = fs.lstatSync(previouspath+'\\'+i)

                                if (filetype.isFile() ) {

                                    const extension = i.split('.')
                                    const extensionStr = extension[extension.length -1]
                                    
                                    const promises = new Promise((resolve,reject) => {

                                        const fileBuffer = fs.readFile(previouspath+'\\'+i, async (err,data) => {
                                            if (err) {
                                                await bot.sendMessage(chatId,'Failed to buffer file')
                                                reject()
                                            }
    
                                            if (extensionStr.toLocaleLowerCase() == 'mp4') {
                                                try {
                                                    
                                                    await bot.sendVideo(chatId,data)
                                                } catch (err) {
                                                    await bot.sendMessage(chatId,'Failed to buffer file')

                                                }
                                            } else {
                                                try {
                                                    
                                                    await bot.sendPhoto(chatId,data)
                                                } catch (err) {
                                                    await bot.sendMessage(chatId,'Failed to buffer file')
                                                }
                                            }
                                            resolve()
    
                                        })
                                    })

                                    allPromises.push(promises)

                                }

                                if (filetype.isDirectory()) {
                                    tempDir.push(previouspath+'\\'+i)
                                }
                            }

                            await Promise.all(allPromises)

                            resolve({isPush:true,file:tempDir})

                        } 
                        if (stats.isFile()) {
                            fs.readFile(directories[i], async (err,data) => {
                                if (err) bot.sendMessage(chatId,'failed to read file')
                                await bot.sendPhoto(chatId,data)
                            })
                        }
                    })
                })
                
                const {isPush,file} = mapped

                if (isPush) {
                    
                    file.forEach(element => {
                        directories.push(element)
                    });
                }

                
            }

            fs.rmdirSync(dir, { recursive: true, force: true })

        } catch (err) {
            bot.sendMessage(chatId,err.message)
            console.log('error at sendfiles: ',err);
        }
    },

}