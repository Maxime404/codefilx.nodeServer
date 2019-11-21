// [1] Create server http with command line: node main.js <PORT>
// [2] GET http://localhost:PORT --> <h1>Hello, World!</h1>
// [3] GET    /?name=Ch0pper --> <h1>Hello, Ch0pper!</h1>
// [4] POST   /students/ with {name: "Zoro", school: "Efrei"}
//  --> create students.json on server side + add [id] to user
// [5] PUT    /students/1 update students with id 1 on file
// [6] DELETE /students/1 delete the student
// [7] DELETE /students delete all students

const http = require('http')
const url = require('url')
const fs = require('fs')

const LOCAL_DATABASE = 'students.json'

// get arguments
const args = process.argv.slice(2)

// get port number
const port = parseInt(args[0])

const server = http.createServer(function (request, response) {
    const { pathname, query } = url.parse(request.url, true)

    console.log('New request from: ', pathname)

    if (request.method === 'GET') {
        if (pathname === '/') {
            const { name } = query
            response.write(`<h1>Hello, ${name || 'World'}!</h1>`)
        }
    }

    if (request.method === 'POST') {
        if (pathname === '/students') {
            let body = ''
            request.on('data', chunk => {
                body += chunk.toString()
            })

            request.on('end', () => {
                console.log(request.headers)
                const user = JSON.parse(body)

                let data
                if (!fs.existsSync(LOCAL_DATABASE)) {
                    user.id = 1
                    data = [user]
                } else {
                    const json = require(`./${LOCAL_DATABASE}`)
                    user.id = json.length + 1
                    json.push(user)
                    data = json
                }

                fs.writeFileSync(LOCAL_DATABASE, JSON.stringify(data, null, 4))
            })

            // 2 file system managment
        }
    }

    response.end()
})

server.listen(port)
console.log(`Server is listening on port ${port} 🎉`)