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

console.log(englishConfigs.Level.Get(1))

