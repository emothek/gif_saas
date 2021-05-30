require("dotenv/config");
var cors = require("cors");

// Extract the exec function from the child_process module
const spawn = require("child_process").spawn;
const exec = require("child_process").exec;

 
 
const nanoid = require('nanoid').nanoid;
//
const express = require('express');
const bodyParser = require('body-parser');
const { unlink } = require('fs').promises;

const app = express();
const port = 3000;
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const db = require('./models/index')
const dbConfig = require('./db.config')
const Role = db.role

db.mongoose
    .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log('Successfully conencted to MongoDB')
        initial()
    })
    .catch(err => {
        console.error("Connection error", err);
        process.exit();
    })


function initial() {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
        new Role({
            name: "user"
        }).save(err => {
            if (err) {
            console.log("error", err);
            }
    
            console.log("added 'user' to roles collection");
        });
    
        new Role({
            name: "superadmin"
        }).save(err => {
            if (err) {
            console.log("error", err);
            }
    
            console.log("added 'super-admin' to roles collection");
        });
    
        new Role({
            name: "admin"
        }).save(err => {
            if (err) {
            console.log("error", err);
            }
    
            console.log("added 'admin' to roles collection");
        });
        }
    });
}

require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/gif.routes')(app);




const previewTwitter = (url) => {
    console.log(url)
    return new Promise (function (resolve, reject){
        let cmd = `gallery-dl -g ${url}`

 
        if(!cmd){
            reject({event:'Error', success: false, msg: 'Error '})
            return false;
        }
        let _url = null;
        exec(cmd, (err, stdout, stderr) => {
                console.log('stdout is:' + stdout)
                _url = stdout.trim();
                console.log('stderr is:' + stderr)
                console.log('error is:' + err)
            }).on('exit', code => {
                console.log('final exit code is', code)
            })
            .on('close', (res,signal) => {
                console.log(res)
                console.log(signal)
                if(res === 0)
                    resolve({event:'Success', success: true, url: _url})
                else
                    reject({event:'Error', success: false, msg: signal})
            }).on('error', err => {
                reject({event:'Error', success: false, msg: err})
            })

     })
    
}



app.post('/previewTwitter', (req, res)=>{
    const { twitter_url } = req.body;
    
    previewTwitter(twitter_url).then(result=>{
        console.log(result)
        return res.status(200).json({event: 'success', success: true, url: result.url})

    }).catch(err=>{

        console.log(err)
        return res.status(400).json({message: err})
    })

})


const download = (url, start, duration, filename, twitter=false) => {

    return new Promise (function (resolve, reject){

        // validate youtube URL before exec_process
        //let childProcess = exec()
        //console.log('.....')
        let cmd = null;
        if(twitter){
            cmd = `ffmpeg $(gallery-dl -g ${url} | sed 's/.*/-ss ${start} -i &/') -strict -2 -t ${duration} -c copy '${filename}'`
        }else{
            cmd = `ffmpeg $(youtube-dl -g ${url} | sed 's/.*/-ss ${start} -i &/') -strict -2 -t ${duration} -c copy '${filename}'`
        }
        //const cmd_ = `youtube-dl '${url}' --external-downloader ffmpeg --external-downloader-args "-ss ${start} -t ${duration}" --output ${filename}`
        // redirect transcoded ip-cam stream to http response
        //childProcess.stdout.pipe(res);
 
        if(!cmd){
            reject({event:'Error', success: false, msg: 'Error '})
            return false;
        }

        exec(cmd, (err, stdout, stderr) => {
                console.log('stdout is:' + stdout)
                console.log('stderr is:' + stderr)
                console.log('error is:' + err)
            }).on('exit', code => {
                console.log('final exit code is', code)
            })
            .on('close', (res,signal) => {
                console.log(res)
                console.log(signal)
                if(res === 0)
                    resolve({event:'Success', success: true, filename: filename})
                else
                    reject({event:'Error', success: false, msg: signal})
            })

     })
    
}

const garbageCollector = (file) => {
    return new Promise (async (resolve, reject) => {
 
        try {
            await unlink(file);
            resolve({event:'Success', success:true, msg: `${file} deleted successfully.`})
            console.log(`successfully deleted ${file}`);
        } catch (error) {
            console.error('there was an error:', error.message);
            reject({event:'Error', success:false, msg: error.message})
        }
 
    })
}

const convert = (filename, output, start='00:00:00', duration='00:00:05', resolution="400x300", fps="10", text, watermark='gifkur', font, fontSize, fontColor='white') => {
    
    font = font ? font : `times`;
    console.log('\n\n\n\n =====> ', font);
    console.log(fontSize);
    console.log(text)
    console.log('\n\n\n\n\n\n')

    return new Promise ((resolve, reject) => {
        let cmd = null;
 

        if(text){
            console.log('here =========>')
            console.log('\n\n\n\n\n')
            console.log(`./fonts/${font}.ttf`)

            cmd = [
                "-y",
                "-i", `${filename}`,
                "-i", `${__dirname}/assets/watermark.png`,
                "-pix_fmt","rgb8",
                "-r", fps,            
                "-s", resolution,
                "-t", duration,
                
                "-filter_complex",
                `[1][0]scale2ref=h=ow/mdar:w=iw/4[#A logo][bird];
                [#A logo]format=argb,colorchannelmixer=aa=0.75[#B logo transparent];
                [bird][#B logo transparent]overlay=(main_w-w)-(main_w*0.1):(main_h-h)-(main_h*0.1)[out];

                [out]drawtext='fontfile=./fonts/${font}.ttf': text='${text}': 
                fontcolor='${fontColor}': fontsize='${fontSize}': box=1: boxcolor=black@0: 
                boxborderw=5: x=(w-text_w)/2: y=(h-text_h)/1.4`,

                "-codec:a", "-o",
                `${output}`
            ];
        }else{
            cmd = [
                "-y",
                "-i", `${filename}`,
                "-i", `${__dirname}/assets/watermark.png`,
                "-pix_fmt","rgb8",
                "-r", fps,            
                "-s", resolution,
                "-t", duration,
                "-filter_complex",
                `[1][0]scale2ref=h=ow/mdar:w=iw/4[#A logo][bird]; 
                [#A logo]format=argb,colorchannelmixer=aa=0.75[#B logo transparent]; 
                [bird][#B logo transparent]overlay=(main_w-w)-(main_w*0.1):(main_h-h)-(main_h*0.1)`,
                "-codec:a", "-o",
                `${output}`             

            ] 
        }
        

        let ffmpeg = spawn('ffmpeg', cmd);
  
    
        ffmpeg.stdout.on('data', (data) => {
            console.log(`STDOUT DATA: ${data}`)
        })
        
        ffmpeg.stdout.on('end', (data) => {
            console.log(`PROCESSING END: ${data}`)
        })
    
        // error logging
        ffmpeg.stderr.setEncoding('utf8');  
        ffmpeg.stderr.on('data', (err) => {
            console.log(err);
        });

        ffmpeg.on('exit', code => {
            console.log('final exit code is', code)
        })
        ffmpeg.on('close', (res,signal) => {
            console.log(res)
            console.log(signal)
            if(res === 0){

                resolve({event:'Success', success: true, filename: output})
                garbageCollector(filename).then(e=> {
                    console.log(e)
                }).catch(err=> {
                    console.log(err)
                })


            }else{
                reject({event:'Error', success: false, msg: signal})
                garbageCollector(filename).then(e=> {
                    console.log(e)
                }).catch(err=> {
                    console.log(err)
                })
            }
        })
    }) 
}

  


app.post('/convert', (req, res) => {

    const { url , start , duration, text, fps,
         resolution, font, fontSize, fontColor } = req.body;
 
    const video_url = url ? url : 'https://www.youtube.com/watch?v=oHg5SJYRHA0';
    const s = start || '00:00:00'
    const d = duration || '00:00:03'
    const t = text || undefined;
    const _font = font || 'TrainOne-Regular';
    const _fontSize = fontSize || 54;
    const _fontColor = fontColor || 'white';
    const r = resolution || '400x300';
    const f = fps || '10';

    const fname = nanoid();
 

    const watermark = 'gifkur.com'

        download(video_url, s, d, `./${process.env.UPLOAD_FOLDER}/${fname}.mp4`).then(res_file=>{
        //console.log(res_file)
        if(res_file.success){

            convert(res_file.filename, `./${process.env.UPLOAD_FOLDER}/${fname}.gif`,
             undefined, undefined, r, f, t, 
             watermark, `${_font}`, _fontSize, _fontColor).then(res_gif=>{

                res.status(200).json(res_gif) 

            }).catch(err=>{
                //console.log(err)
                //res.send(err);
                res.status(400).json(err)
            })

        }
    }).catch(err=>{
        //console.log(err)
        //res.send(err);
        res.status(400).json(err)
    })
 

});

 
app.get('/gifs/:id', function(req, res){
    const file = `${__dirname}/gifs/${req.params.id}`;
    res.download(file)
});


  app.post('/delete', function(req, res){
      let f = req.body.url && req.body.url;
      f = f.substr(f.indexOf('gifs/'));
      
    const file = `${__dirname}/${f}`;
    garbageCollector(file).then(e=> {
        console.log(e)
        res.status(200).json(e)
    }).catch(err=> {
        console.log(err)
    })


  });

  



app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))

/**
 * child_process.exec(command[, options][, callback])
 * command - Command to execute. You can have space separated arguments if the command accepts any args
 * options - You can give options like Environment variables required for the child process
 * callback - function which will be called with the output when the process terminates.
 *     error - If any errors are thrown during the process exception
 *     stdout - Any data that gets returned by the process
 *     stderr - Any error that is logged by the process
 */
