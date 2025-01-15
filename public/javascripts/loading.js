//문서가 로드되었을 때 csv 파싱 함수 적용
window.onload = function(){
    //csv 파일이 업로드 되되었을 때 파일 파싱
    document.querySelector('#csv_file')
    .addEventListener('change', function(){
        //파일 읽기
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function(){
            var text = reader.result;
            //행을 기준으로 첫번 째 파싱
            var first_parsing = text.split('\n');
            //열을 기준으로 두번 째 파싱
            var second_parsing = [];
            for(var i = 0;i<first_parsing.length;i++){
                second_parsing.push(first_parsing[i].split(','));
            }
            //열에 대한 정보를 저장
            var col = second_parsing[0];
            //행에 대한 정보를 저장
            var row = set_row(second_parsing);
            //테이블 생성
            var table = document.querySelector('#csv').childNodes[0];
            var tr = document.createElement('tr')
            //열 리스트 생성성
            var col_td = document.createElement('td')
            col_td.innerHTML = 'column List: '
            var col_list = document.createElement('select');
            col_list.setAttribute('id', 'col_list');
            for(var i = 0;i<col.length;i++){
                let option = document.createElement('option');
                option.setAttribute('value', i);
                option.innerHTML = col[i];
                col_list.appendChild(option);
            }
            col_td.appendChild(col_list);

            //행 리스트 생성
            var row_td = document.createElement('td');
            row_td.innerHTML = 'row List: '
            var row_list = document.createElement('select');
            row_list.setAttribute('id', 'row_list');
            for(var i = 0;i<row.length;i++){
                let option = document.createElement('option');
                option.setAttribute('value', i);
                option.innerHTML = row[i].path;
                row_list.appendChild(option);
            }
            row_td.appendChild(row_list);

            //적용 버튼 생성
            var commit = document.createElement('td');
            var commit_btn = document.createElement('button');
            commit_btn.setAttribute('id', 'commit_btn');
            commit_btn.innerHTML = '적용';
            commit.appendChild(commit_btn);

            tr.appendChild(col_td);
            tr.appendChild(row_td);
            tr.appendChild(commit);

            table.appendChild(tr);

            alert('파싱이 완료되었습니다.')

            //행에 대한 정보를 저장하는 함수
            function set_row(data){
                var sw = true;
                var result = [];
                for(var i = 1; i<data.length;i++){
                    if(data[i][0] == ''){
                        if(!sw){
                            sw = true;
                            result[result.length-1]['end'] = i-1
                        }
                        continue
                    }
                    if(sw){
                        var path = data[i][0].split('\\')[2]
                        var start = i
                        var obj = {path: path, start:start}
                        result.push(obj)
                        sw = false
                    }
                }
                return result
            }
        }
        reader.readAsText(file);
    });
}
function send(){
    let formdata = new FormData();

    var filename = document.getElementById('file_name').innerHTML;
    var original = document.getElementById('original_name').innerHTML;
    var tblFile = document.querySelector('#tbl_file').files[0];
    if(!tblFile){
        alert('TBL 파일을 입력해주세요');
        return;
    }

    var changed = document.querySelectorAll('.changed_text');
    var changed_text = [];

    for(var i = 0;i<changed.length;i++){
        var obj = {id: changed[i].id, text: changed[i].value};
        changed_text.push(obj);
    }

    //TBL 파일 입력
    var reader = new FileReader();
    reader.readAsText(tblFile);
    reader.onload = function(){
    var result = reader.result;

    //TBL 파일 인덱싱
    var tbl_file = [];
    result = result.split('\n');
    for(var i = 0;i<result.length;i++){
        var id  = result[i].split('=')[0];
        var text = result[i].split('=')[1];
        var obj = {id: id, text: text};
        tbl_file.push(obj);
    }
    

    formdata.append('file name', filename);
    formdata.append('original name', original);
    formdata.append('changed text', JSON.stringify(changed_text));
    formdata.append('table', JSON.stringify(tbl_file));

    fetch('/build', {
        method: 'POST',
        body: formdata
    }).then((response) => {
        if(!response.ok){
            console.error('Error:', response);
            alert('Error');
            return;
        }
        return response.text();
    }).then((data) => {
        var obj = JSON.parse(data);
        fetch(`/download?data=${obj.file}&name=${obj.original}`).then((response) => {
        if(!response.ok){
            console.error('Error:', response);
            alert('Error');
            return;
        }
        const header = response.headers.get('Content-Disposition')
        const parts = header.split(';')
        filename = parts[1].split('=')[1].replaceAll('"', '')

        return response.blob();
    }).then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }).catch((error) => {
        console.error('Error:', error);
        alert('Error');
    });
}).catch((error) => {
    console.error('Error:', error);
    alert('Error'); 
});
    }
}