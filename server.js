const express = require('express');
const app = express();
const multer = require('multer');
const path = require('path');
//const port = parseInt(process.env.PORT) || 8080;
const port = 5000;
//const sharp = require('sharp');
//const fs = require('fs');

//Tentuin folder penyimpanan sementara
const storage = multer.diskStorage({
    destination: './pictures',
    filename: (req, file, cb)=>{
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
})

const upload = multer({
    storage: storage,
    
});
app.use(express.json());

app.use('/result', express.static('pictures'));

//Buat endpoint upload image
app.post("/upload", upload.single('data'), (req,res) => {
    
    // pred_Image = req.file.filename;
    res.json({
        status: 200,
        success: true,
        //url: `https://bangkit-last-project.et.r.appspot.com/result/${req.file.filename}`
        url: `http://localhost:5000/result/${req.file.filename}`
    });
    //res.send(pred_Image);
    //predictPic('./organic.jpg');
});

app.post('/register', (req, res) => {
    // Ambil data pengguna dari body permintaan
    const { username, password } = req.body;
  
    // Simpan data pengguna ke database atau penyimpanan lainnya
    // Pastikan untuk menyimpan password dengan menggunakan hashing seperti bcryptjs
  
    res.status(200).json({ message: 'Registrasi berhasil' });
});


app.post('/login', (req, res) => {
  // Ambil data pengguna dari body permintaan
  const { username, password } = req.body;

  // Cek apakah username dan password valid
  // Misalnya, bandingkan password yang dihash dengan yang ada di database menggunakan bcryptjs

  // Jika valid, buat dan kirimkan token JWT sebagai respons
  // Token JWT dapat berisi informasi seperti ID pengguna atau peran untuk digunakan dalam otentikasi selanjutnya

  res.status(200).json({ token: 'contoh-token-jwt' });
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
    
});

module.exports = app;