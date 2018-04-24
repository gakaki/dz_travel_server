//
// let calcCurrIndex = ( eReceivedCount ) => {
//     let current                                                  = 0;
//     if ( eReceivedCount <= 0 ){
//         current                                                  = 1;
//     }else{
//         current                                                  = eReceivedCount >= 10 ? 10 : eReceivedCount ;
//     }
//     let total                                                    = 10;
//     current                                                      = total - current;
//     if (current <= 1) current = 1;
//     console.log(`[debug] current index is ${current}/10`);
//     return  current;
// }
// calcCurrIndex(-1);   // 2/10
// calcCurrIndex(0);   // 2/10;
//
// calcCurrIndex(1);   // 2/10
// calcCurrIndex(2);   // 2/10
// calcCurrIndex(3);   // 2/10
// calcCurrIndex(10);  //10
// calcCurrIndex(11);  //10
