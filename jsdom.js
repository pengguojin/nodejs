const JSDOM = require('jsdom').JSDOM;
const fs = require('fs');

fs.readFile('tmp/1.html', (err, buffer)=>{
    let jsdom = new JSDOM(buffer.toString());
    console.log(buffer.toString());
    
    let document = jsdom.window.document;
    
    let $ = document.querySelectorAll.bind(document);
    let txt = $('.div1')[0];
    console.log(txt.innerHTML);
});

