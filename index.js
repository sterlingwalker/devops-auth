var ldap = require('ldapjs');
const express = require('express');
const path = require('path');

var cors = require('cors')

var app = express()
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
			res.cookie("token", "test");
			res.json({success: true})
		}
	});
});

app.post("/checkToken", (req, res) => {
	let response = req.body

	// ldapsearch -x -b dc=csi4660,dc=local 'uid=dijaz'
	exec(`ldapsearch -x -b dc=csi4660,dc=local 'gecos=${response.token}'`, (error, stdout, stderr) => {
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
			res.status(200)
			res.send(stdout)
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
		res.redirect('https://google.com')

	}

});

app.listen(PORT, () => {
	  console.log(`Server listening on ${PORT}`);
});
