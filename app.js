const Client = require('ssh2-sftp-client');
const sftp = new Client();
const fs = require('fs')
const path = require('path');
const { error } = require('console');

async function connectFtp({ host, port, username, password }) {
    return await sftp.connect({
        host,
        port,
        username,
        password
    })
}

// setup connection string as here
function connectTionString() {
    return {
        host: '',
        port: '',
        username: '',
        password: ''
    }
}

async function recursiveSearch(pathTarget){
    try {
        const isRightPath = await sftp.exists(pathTarget)
        if (!isRightPath) {
            console.log('Wrong path')
            return
        }

        let filesNow = await sftp.list(pathTarget)
        let filesResult = []

        if (filesNow.length <= 0) {
            return filesResult
        }
        // let scanFile = undefined
        for (let index = 0; index < filesNow.length; index++) {
            filesNow[index].path = pathTarget
            filesResult.push(filesNow[index])
            if(filesNow[index].type === 'd'){
                const deepPath = path.join(pathTarget,filesNow[index].name, '/')
                const deepFiles = await recursiveSearch(deepPath)
                filesResult.push(...deepFiles)
            }
        }

        return filesResult


    } catch (error) {
        console.error(error)
    }
}


async function fileFilter(files) {
    let fileAfterFilter = []
    files.forEach((element, index) => {
        fileAfterFilter.push({
            no: index + 1,
            name: element.name,
            modifyTime: new Date(element.modifyTime).toUTCString(),
            path: element.path
        })
    });
    return fileAfterFilter
}


async function writeLogFile(data) {
    // console.log(data)
    fs.writeFileSync('./log.txt', ``, (err) => {
        if (err) throw err;
    })
    data.forEach(element => {
        fs.appendFileSync('./log.txt', `No ${element.no} - filename: ${element.name} - modifytime: ${new Date(element.modifyTime).getFullYear()}:${new Date(element.modifyTime).getMonth()}:${new Date(element.modifyTime).getDate()}  - Path : ${element.path}\n`, (err) => {
            if (err) throw err;
        })
    })
    console.log('Wrote!!')
    return
}

const PATHTARGET = '/home/NBTC_LTEa/ftp/demo'

async function main() {

    await connectFtp(connectTionString())
    const data = await recursiveSearch(PATHTARGET)
    const filtered = await fileFilter(data)
    await writeLogFile(filtered)
}

main()

