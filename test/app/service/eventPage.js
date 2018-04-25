//
// let fakeCalcCurrIndex = ( eReceivedCount ) => {
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
// fakeCalcCurrIndex(-1);   // 2/10
// fakeCalcCurrIndex(0);   // 2/10;
//
// fakeCalcCurrIndex(1);   // 2/10
// fakeCalcCurrIndex(2);   // 2/10
// fakeCalcCurrIndex(3);   // 2/10
// fakeCalcCurrIndex(10);  //10
// fakeCalcCurrIndex(11);  //10
