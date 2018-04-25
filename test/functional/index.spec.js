describe('Index test', () => {
  beforeEach((done) => {
    mockgoose(mongoose).then(() => {
      allowedUrl = JSON.parse(process.env.AllowUrl).urls[0];
      global.server = require('../../index'); // eslint-disable-line global-require
      done();
    });
  });

  it('should return status 200 when use -> app.get', (done) => {
    chai.request(server)
    .get('/anyUrl')
    .set({ origin: allowedUrl })
    .set('authorization', 'Bearer ')
    .end((err, res) => {
      expect(res).to.have.status(200);
      done();
    });
  });

  it('should return hello when get sent to /hello/sayhi', (done) => {
    chai.request(server)
    .get('/hello/sayhi')
    .set({ origin: allowedUrl })
    .set('authorization', 'Bearer ')
    .end((err, res) => {
      expect(res).to.have.status(200);
      // res.json().then((data) => {
      console.log(res.body);
      expect(res.body).to.eql({ message: 'hello' });
      done();
      // });
      // done();
    // });
    });
  });
});
