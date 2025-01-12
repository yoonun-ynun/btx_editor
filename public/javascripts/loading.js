
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