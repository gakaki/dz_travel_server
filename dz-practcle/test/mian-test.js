const assert            = require('assert');
const randomSeconds     = require('../randomSeconds');

describe('#main.js', () => {

        it('sum() should return 0', async () => {
            let res = randomSeconds.randomDefault();
            console.log(res);
            assert( res >= 60 * 1000 * 5 && res <= 60 * 1000 * 15 );
        });
        it('randomTest()', async () => {
            let res = randomSeconds.randomTest();
            console.log(res);
            assert( res >= 1 * 1000  && res <= 5 * 1000 );
        });

});
