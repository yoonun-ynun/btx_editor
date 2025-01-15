var express = require('express');
var router = express.Router();
const multer = require('multer');
const upload = multer();
const fs = require('fs');
const iconv = require('iconv-lite');
const makeEncoder = require('./makeEncoder');

/* POST form data */
router.post('/',upload.none() ,function(req, res, next) {
    TextChange(req.body, res);
});

function TextChange(change, res){
    fs.readFile(`uploads/${change['file name']}`,(err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        var result = toArrayBuffer(data).slice(0, 24);
        var data = JSON.parse(change['changed text']);
        //테이블을 이용해서 인코더 생성
        var table = JSON.parse(change['table']);
        console.log(table);
        var encoder = makeEncoder(table);
        //헤더 처리
        for(var i = 0;i<data.length;i++){
            console.log(result);
            var dv = new DataView(new ArrayBuffer(4))
            dv.setUint32(0, data[i].id, true);
            var abuf = new ArrayBuffer(4);
            result = appendBuffer(result, dv.buffer);
            result = appendBuffer(result, abuf);
        }
        //텍스트 처리
        for(var i = 0;i<data.length;i++){
            //줄바꿈 문자 처리
            data[i].text = data[i].text.replace(/\n/g,'\r\r\n');
            //포인터 위치 저장
            dv = new DataView(result);
            dv.setUint32(28+i*8, result.byteLength-((24) + i * 8), true);
            //인코딩
            var buffer = encoder.encode(data[i].text).buffer;
            dv.setUint32(0, buffer.byteLength, true);
            toArrayBuffer(buffer);
            //데이터 저장
            result = appendBuffer(result, buffer);
        }
        var uint8 = new Uint8Array(result);
        console.log(result);
        fs.writeFile(`result/${change['file name']}.btx`, uint8,{encoding:'binary'}, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('File has been created');
            var obj = {file: `${change['file name']}`, original: `${change['original name']}`};
            res.send(JSON.stringify(obj));
        })
    });
}

//두 버퍼를 합치는 함수
function appendBuffer(buffer1, buffer2) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
  };

//버퍼를 어레이 버퍼로 바꾸는 함수
function toArrayBuffer(buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return arrayBuffer;
}

module.exports = router;