const { app, mock, assert } = require('egg-mock/bootstrap');

describe('test/controller/home.test.js', () => {
    describe('GET /', () => {
        it('should status 200 and get the body', async () => {
            // 对 app 发起 `GET /` 请求
            const result = await app.httpRequest()
                .get('/tour/test')
                .expect(200)
                .expect("1");

            assert(result.status === 200);
        });
    });
});