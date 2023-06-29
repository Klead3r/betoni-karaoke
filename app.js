const express = require('express');
const fs = require('fs');
const app = express();

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})

app.get('/files', (req, res) => {
    var results = [];

    fs.readdirSync('videos').forEach(function(file) {
        results.push({name: file.split('.')[0], path: file});
    });
    res.json(results);
})

app.get('/log/:song', (req, res) => {
    fs.appendFile('log.csv', req.params.song + "\n", function (err) {
      if (err) throw err;
    });

    res.json({
        song: req.params.path
    })
})

app.get('/logfile', (req, res) => {
  var contents = fs.readFileSync('log.csv');
  res.send(contents)
})

app.get('/video/:path', (req, res) => {
	const range = req.headers.range
	const videoPath = 'videos/' + req.params.path;
	const videoSize = fs.statSync(videoPath).size
	const chunkSize = 1 * 1e6;
	const start = Number(range.replace(/\D/g, ""))
	const end = Math.min(start + chunkSize, videoSize - 1)
	const contentLength = end - start + 1;
	const headers = {
		"Content-Range": `bytes ${start}-${end}/${videoSize}`,
		"Accept-Ranges": "bytes",
		"Content-Length": contentLength,
		"Content-Type": "video/mp4"
	}
	res.writeHead(206, headers)
	const stream = fs.createReadStream(videoPath, {
		start,
		end
	})
	stream.pipe(res)
})
app.listen(3000);
