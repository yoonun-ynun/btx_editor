var express = require('express');
var router = express.Router();
var fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })
const iconv = require('iconv-lite');


/* POST file upload */
router.post('/',upload.single('file'), function(req, res, next) {
    readFile(req.file.filename, res, req.file.originalname);
});

function readFile(filename, res, original){
    fs.readFile(`uploads/${filename}`,(err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        var view = new DataView(toArrayBuffer(data));
        var text = getText(view);
        
        res.render('upload', {text: text,original: original, file: filename});
    });
}

function getText(view){
    var start = 20;
    var length = view.getUint32(start, true);
    var pointers = [];
    var ids = [];
    for(var i = 0;i<length;i++){
        var offset = (start+4) + i * 8;
        pointers.push(view.getUint32(offset+4, true)+offset);
        ids[pointers[i]] = (view.getUint32(offset, true));
    }

    console.log(pointers)
    var Abf = view.buffer
    var result = [];
    for(var i = 0;i<pointers.length;i++){
        var offset = pointers[i];
        var endoff;
        if(i+1 == pointers.length){
            endoff = Abf.byteLength;
        }else{
            endoff = pointers[i+1];
        }
        var text = Abf.slice(offset,endoff);
        text = iconv.decode(text, 'utf-16le')
        result.push({id:ids[pointers[i]],text:text.replace(/\r/g, '').replace(/\u0000/g, '')});
    }
    console.log(result);
    return result;
}

function toArrayBuffer(buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return arrayBuffer;
}



module.exports = router;