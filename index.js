var ldap = require('ldapjs');
const express = require('express');
const path = require('path');

var cors = require('cors')

var app = express()

const https = require('https');
const fs = require('fs');

var key = fs.readFileSync(__dirname + '/../../cert/private.key');
var cert = fs.readFileSync(__dirname + '/../../cert/certificate.crt');
var ca = fs.readFileSync(__dirname + '/../../cert/ca_bundle.crt');
var options = {
  key: key,
  cert: cert,
  ca: ca
};

app.use(cors())
var cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(
	express.urlencoded({
	  extended: true
	})
  )
  
  app.use(express.json())

const { exec } = require("child_process");

const PORT = process.env.PORT || 3001;

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, './devops_ftp/build')));

// Handle GET requests to /api route

app.post("/credentials", (req, res) => {
	let response = req.body

	console.log(response);
	console.log(req.cookies)


	exec(`ldapwhoami -vvv -h 35.222.21.151 -p 389 -D 'uid=${response.user},ou=People,dc=csi4660,dc=local' -x -w ${response.password}`, (error, stdout, stderr) => {
		if (error) {
			console.log(`error: ${error.message}`);
			return;
		}
		if (stderr) {
			console.log(`stderr: ${stderr}`);
		}
		console.log(`stdout: ${stdout}`);

		if (stdout.includes('Success (0)')) {
			console.log('forwarding success')

			let token = ''

			exec(`ldapsearch -x -b dc=csi4660,dc=local 'uid=${response.user}'`, (error, stdout, stderr) => {
				if (stdout.includes('cn')) {
					console.log('token success')
					token = stdout.split('\n').find(str => str.includes('gecos: ')).replace('gecos: ', '')
					res.cookie("token", token);
					res.json({success: true})
				}
			})
		}
	});
});

app.get("/checkToken", (req, res) => {
	let response = req.query.token

	exec(`ldapsearch -x -b dc=csi4660,dc=local 'gecos=${response}'`, (error, stdout, stderr) => {
		if (error) {
			console.log(`error: ${error.message}`);
			return;
		}
		if (stderr) {
			console.log(`stderr: ${stderr}`);
		}
		console.log(`stdout: ${stdout}`);

		if (stdout.includes('cn')) {
			console.log('token success')
			let string = stdout.split('\n').find(str => str.includes('uid: ')).replace('uid: ', '')
			res.status(200)
			res.json({token: response, username: string})
		} else {
			res.sendStatus(400)
		}
	});
})

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
	let cookies = req.cookies
	console.log(cookies)

	if (cookies.token == undefined) {
		res.sendFile(path.resolve(__dirname, './devops_ftp/build', 'index.html'));
	} else {
		res.redirect(`https://dev.nightoff.org/token/${cookies.token}`)
	}

});


var server = https.createServer(options, app);

server.listen(9000, () => {
  console.log("server starting on port : " + 9000)
});

