//정규화된 테이블을 받아서 인코더를 만드는 함수
function make(table=[]){
    let encoder = {};
    let encode_table = {};
    let decode_table = {};
    for(var i = 0;i<table.length;i++){
        encode_table[table[i].text] = parseInt(table[i].id,16);
    }
    for(var i = 0;i<table.length;i++){
        decode_table[parseInt(table[i].id,16)] = table[i].text;
    }
    decode_table[0x00] = '';
    decode_table[0x0A] = '\n';
    decode_table[0x0D] = '\r';
    encode_table['\n'] = 0x0A;
    encode_table['\r'] = 0x0D;
    encoder.encode = function(text=''){
        var result = [];
        for(var i = 0;i<text.length;i++){
            result.push(encode_table[text[i]]);
        }
        result.push(0x00);
        result.push(0x00);
        return new Uint16Array(result);
    }
    encoder.decode = function(data=new Uint16Array()){
        var result = '';
        for(var i = 0;i<data.length;i++){
            result += decode_table[data[i]];
        }
        return result;
    }
    return encoder;
}

module.exports = make;