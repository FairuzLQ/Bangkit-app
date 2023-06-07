const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
const port = parseInt(process.env.PORT) || 8080;
const sharp = require('sharp');
const fs = require('fs');
var request = require('request');
const tf = require('@tensorflow/tfjs-node');

//buat iterasi hasil prediksi
let index = -1;
let result = "";

//Fngsi buat download, pake module request
var download = function(uri, filename, callback){
    request.head(uri, function(err, res, body){
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);
  
      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};


async function loadModel(){
    return tf.loadLayersModel('https://storage.googleapis.com/waste_classification_model/model.json');
}

async function preprocessImage(imagePath) {
    const image = await sharp(imagePath)
      .resize(150, 150)
      .normalize()
      .toBuffer();
  
    const input = tf.node.decodeImage(image, 3);
    const expandedInput = input.expandDims();
    return expandedInput;
};

async function predictPic(imagePath){
    const model = await loadModel();
    const models = await model;
    const inputTensor = await preprocessImage(imagePath);
    const predictions = await models.predict(inputTensor);

    //console.log('Predictions:');
    //console.log(predictions);
    inputTensor.dispose();
    //console.log(predictions.dataSync());
    //console.log(predictions.arraySync());
    
    const dataArray = predictions.arraySync();
    const predictEnd = dataArray[0][1];
    //console.log(predictEnd);

    for (let i = 0; i < dataArray[0].length; i++) {
        if (dataArray[0][i] === 1) {
          index = i;
          break;
        }
      }    
    
    let last_result = "";
    if(index === 0){
        last_result = "Organic Waste";
    }
    else if(index === 1){
        last_result = "Anorganic Waste";
    }
    else if(index === 2){
        last_result = "Hazardous Waste";
    }

    return { prediction: last_result };
    
};

//Make storage directory for pictures to predict
const storage = multer.diskStorage({
    destination: './pictures',
    filename: (req, file, cb)=>{
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
})

const upload = multer({
    storage: storage,
    
});

app.use('/result', express.static('pictures'));

//Buat endpoint upload image
app.post("/upload", upload.single('data'), async (req,res) => {
    try {//const last_predict = await predictPic('./anon.jpg');
        const imagePath = `./pictures/${req.file.filename}`;
        const last_predict = await predictPic(imagePath);    
        const another_data = {
            success: true,
            url: `http://34.101.210.218:8080/result/${req.file.filename}`
        }
        console.log(last_predict);
        let last_response = { ...last_predict, ...another_data};
        res.json(last_response);
        //Delete the image after sending the response
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log('Image file deleted');
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.get('/', function (req, res) {
    res.status(200).send('Connected').end();
    
});
  

app.listen(port, () => {
    console.log("Connected");
    //Download image
    //download('https://dicoding-web-img.sgp1.cdn.digitaloceanspaces.com/original/commons/homepage-partner-aws.png', 'google.png', function(){
    //    console.log('done');
    //});
    
    //predictPic('./anon.jpg');
    
});

module.exports = app;