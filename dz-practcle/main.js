const randomSeconds   = require('./randomSeconds');
var kue     = require('kue')
    , queue   =  kue.createQueue({
    prefix: 'q',
    redis: {
        port: 6379,
        host: '10.1.70.106',
        auth: 'redis',
        db: 1,
        options: {
            // see https://github.com/mranney/node_redis#rediscreateclient
        }
    }
});

kue.app.listen(5555);
require('events').EventEmitter.defaultMaxListeners = 20;

const job_name = "random_event";

let job_create = async () => {
    let milliseconds = randomSeconds.randomTest();
    var job = queue.create( 
        job_name, 
        {
            title: 'welcome email for tj',
            to: 'tj@learnboost.com',
            template: 'welcome-email'
        }
    )
    .delay(milliseconds)
    .priority('high').save( function(err){
       if( !err ) {
           console.log( job.id , "delay seconds is" , milliseconds);
       }
    });

}
let job_deal = async ( job_data , done ) => {
    // if(!isValidEmail(address)) {
    //     return done(new Error('invalid to address'));
    // }
    // // email send stuff...
    //写入数据库表示事件已经产生了，需要写入到数据库中
    // let res = await mongodb.insert({
    //     'type' : 3
    // });
    console.log("job_deal",job_data);
    await job_create();
    //之后继续出发一条queue
    done();
}
queue.process( job_name,  function(job, done){
    job_deal( job.data, done );
});

// job.on('complete', function(result){
//   console.log('Job completed with data ', result);
// }).on('failed attempt', function(errorMessage, doneAttempts){
//   console.log('Job failed');
// }).on('failed', function(errorMessage){
//   console.log('Job failed');
// }).on('progress', function(progress, data){
//   console.log('\r  job #' + job.id + ' ' + progress + '% complete with data ', data );
// });

queue.on('job enqueue', function(id, type){
        console.log( 'Job %s got queued of type %s', id, type );
}).on('job complete', function(id, result){
kue.Job.get(id, function(err, job){
    if (err) {
        console.log("job get error",err);
        return;
    }
    job.remove(function(err){
    if (err) throw err;
        console.log('removed completed job #%d', job.id);
    });
});
}).on( 'error', function( err ) {
    console.log( 'Oops... ', err );
});


job_create();