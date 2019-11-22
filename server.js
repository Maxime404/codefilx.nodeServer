// [1] Create server http with command line: node main.js <PORT>
// [2] GET http://localhost:PORT --> <h1>Hello, World!</h1>
// [3] GET    /?name=Ch0pper --> <h1>Hello, Ch0pper!</h1>
// [4] POST   /students/ with {name: "Zoro", school: "Efrei"}
//  --> create students.json on server side + add [id] to user
// [5] PUT    /students/1 update students with id 1 on file
// [6] DELETE /students/1 delete the student
// [7] DELETE /students delete all students

const http = require('http');
const url = require('url');
const fs = require('fs')

const LOCAL_DATABASE = 'students.json'
const args = process.argv.slice(2);

if (args.length !== 1) {
    console.log(`usage: node ${__filename.split('/').pop()} <PORT>`);
    process.exit(0);
}

const port = args[0];

const server = http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    console.log('New request: ', req.url);

    const { pathname, query } = url.parse(req.url, true);

    if (req.method === 'GET') {
        if (pathname === '/') {
            const { name } = query;
            res.write(`<h1>Hello, ${name || 'World'}!</h1>`);
        }
    }

    if (req.method === 'POST') {
        if (pathname === '/students') {
            let body = '';

            req.on('data', chunk => {
                body += chunk.toString();
                console.log(body)
            });

            req.on('end', () => {
                //console.log(req.headers);
                const user = JSON.parse(body);
                let data;

                if (!fs.existsSync(LOCAL_DATABASE)) {
                    user.id = 1
                    data = [user];
                } else {
                    const json = require(`./${LOCAL_DATABASE}`);
                    user.id = json.length + 1;
                    json.push(user);
                    data = json;
                }

                fs.writeFileSync(LOCAL_DATABASE, JSON.stringify(data, null, 4))
            });
        }
    }

    if (req.method === 'PUT') {
        if (pathname.includes('/students')) {
            const studentId = parseInt(pathname.slice(pathname.lastIndexOf('/') + 1));
            let body = '';

            req.on('data', chunk => {
                body += chunk.toString();
                console.log(body)
            });

            req.on('end', () => {
                //console.log(req.headers);
                const student = JSON.parse(body);
                const json = require(`./${LOCAL_DATABASE}`);
                json.forEach(jsonPerLine => {
                    if (jsonPerLine['id'] === studentId) {
                        Object.assign(jsonPerLine, student);
                    }
                });

                fs.writeFileSync(LOCAL_DATABASE, JSON.stringify(json, null, 4))
            });
        }
    }

    if (req.method === 'DELETE') {
        if (pathname.includes('/students')) {
            if (pathname === '/students') {
                json = [];
                fs.writeFileSync(LOCAL_DATABASE, JSON.stringify(json, null, 4))
            } else if (pathname.includes('/students')) {
                const studentId = parseInt(pathname.slice(pathname.lastIndexOf('/') + 1));

                req.on('end', () => {
                    const json = require(`./${LOCAL_DATABASE}`);
                    const newJson = [];

                    json.forEach(jsonPerLine => {
                        if (jsonPerLine['id'] !== studentId) {
                            newJson.push(jsonPerLine);
                        }
                    });

                    fs.writeFileSync(LOCAL_DATABASE, JSON.stringify(newJson, null, 4))
                });
            }
        }
    }


    res.end();
});
server.listen(port);
console.log(`Server is listening on port ${port} `);