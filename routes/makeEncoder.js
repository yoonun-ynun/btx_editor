//정규화된 테이블을 받아서 인코더를 만드는 함수
function make(table){
    let encoder = {};
    var encode_table = {};
    for(var i = 0;i<table.length;i++){
        encode_table[table[i].text] = parseInt(table[i].id,16);
    }
    encode_table['\n'] = 0x0A;
    encode_table['\r'] = 0x0D;
    encoder.encode_table = encode_table;
    encoder.encode = function(text){
        var result = [];
        for(var i = 0;i<text.length;i++){
            result.push(this.encode_table[text[i]]);
        }
        result.push(0x00);
        result.push(0x00);
        return new Uint16Array(result);
    }
}

module.exports = make;