let RafterService = require('../rafter');

describe('RafterService', () => {
  it('can be created', () => {
    let r = new RafterService('waddup', 'token');
    expect(r.url).toBe('waddup');
    expect(r.token).toBe('token');
  });
});
