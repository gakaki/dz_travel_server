const constant =require( "../../utils/constant");

const utils =require("../../utils/utils");
const noce =require("../../utils/nonce");
const uuid =require("uuid");

const englishConfigs = require("../../../sheets/english");
//const EnglishPlayer = require('../player/englishPlayer/englishPlayer');


/*
for(let i = 5;i<12;i++){
    let day =new Date("2018-3-"+i).getDay();
    if(day == 0){
        day=7
    }
    console.log(englishConfigs.Landing.Get(day).itemid);
}
*/

console.log(englishConfigs.seasons);
/*
function setQuestions(difficulty) {
    let wordLib = englishConfigs.words;
    let words = [];
    for (let word of wordLib) {
        if (word.difficulty == difficulty) {
            words.push(word);
        }
    }
    return getWord(words);
}

function getWord(words) {
    let indexs = new Set();
    while (indexs.size < 5) {
        let index = utils.Rangei(0, words.length);
        console.log(index);
        indexs.add(index);
    }
    console.log(indexs);
    let questions = [];
    for (let i of indexs) {
        let qword = words[i];
        let types = qword.type;
        let type = utils.Rangei(0, types.length);
        //  let type = 1;
        let word = {
            id: qword.id,
            english:qword.english,
            chinese:qword.China,
            symbol:qword.symbol,
            speech:qword.speech,
            type: types[type],
            eliminateNum:qword.eliminateNum,
            eliminate:qword.eliminate,
        };
        if(word.type == 1 ||word.type ==2){
            word.errorWords = getErrorAnswer(qword.id)
        }

        questions.push(word);
    }

    return questions;
}

function getErrorAnswer(wid){
    let wordLib = englishConfigs.words;
    // let errorWords = [];
    let words = new Set();
    while(words.size <3){
        let index = utils.Rangei(0, wordLib.length);
        if(index != wid){
            words.add(wordLib[index]);
        }
    }

    return Array.from(words);
}

let a =setQuestions(1);
console.log(JSON.stringify(a));*/
