var fs = require('fs')
const ipfsClient = require('ipfs-http-client')
const express = require('express')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const all = require('it-all')
const uint8ArrayConcat = require('uint8arrays/concat')
const uint8ArrayToString = require('uint8arrays/to-string')

const ipfs = new ipfsClient({host: 'ipfs.infura.io', port: 5001, protocol: 'https'})

const app = express() 

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true}))
app.use(fileUpload())

app.get('/', (req, res) => {
    res.render('home')
})

app.post('/upload', (req, res) => {
    
    console.log(req.body);
    
    const fileName = req.body.data;
    
    const fileHash = await addFile(fileName, filePath);
    console.log(fileHash);
    console.log(`https://ipfs.io/ipfs/${fileHash}/`);

    res.send(fileHash);
})

app.get('/get_cid/:cid', async (req, res) => {
    const cid = req.params.cid;
    console.log(cid);

    for await (const file of ipfs.get(cid)) {
      console.log(file.type, file.path)
    
      if (!file.content) continue;
    
      const content = []
    
      for await (const chunk of file.content) {
        content.push(chunk)
      }
    
      console.log(content)
    }
})

app.get('/cat/:cid', async(req, res)=>{
    //const cid = 'QmVUwpM3cnRYADMZaAQth8DVoDWRNuRDk3c9K4o2XVrpEF';
    const cid = req.params.cid;
    console.log(cid);
    const data = uint8ArrayConcat(await all(ipfs.cat(cid)))
    // console.log(data);
    // console.log(data.length);
    // console.log(uint8ArrayToString(data));
    const str_data = uint8ArrayToString(data);

    let newfilename = `file_${+ new Date()}.json`;
    fs.writeFile(newfilename, str_data, (err) => {
        if(!err) {
            console.log('Data written');
        } else {
            console.log(err);
        }
    });
})

const addFile = async (fileContent) => {
    const fileAdded = await ipfs.add(fileContent)
    console.log(fileAdded);
    //return fileAdded[0].hash; 
    return fileAdded.cid.toString(); 
}

app.listen(3000, ()=>console.log('Server is listenning on port 3000'))
