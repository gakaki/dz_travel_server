//
// let fakeCalcCurrIndex = ( eNotReceived ) => {
//     let current                                                  = 0;
//     if ( eNotReceived <= 0 ){
//         current                                                  = 1;
//     }else{
//         current                                                  = eNotReceived ;
//     }
//     let total                                                    = 10;
//     current                                                      = total - eNotReceived;
//     if (current <= 1) current = 1;
//     console.log(`[debug] current index is ${current}/10`);
//     return  current;
// }
//
// fakeCalcCurrIndex(-1);   // 2/10
// fakeCalcCurrIndex(0);   // 2/10;
//
// fakeCalcCurrIndex(1);   // 2/10
// fakeCalcCurrIndex(2);   // 2/10
// fakeCalcCurrIndex(3);   // 2/10
// fakeCalcCurrIndex(10);  //10
// fakeCalcCurrIndex(11);  //10
//
//
//
//
// // database get all events
// // get all events not received
// // into  the container for the counter
// // if click 1 event show than counter -1 pop one event than add to received
// // else add data to container
//
// // need a list view to show all the event list