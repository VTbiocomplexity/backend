const JobService = require('../job');
const nock = require('nock');

let url = 'http://localhost/';
let token = 'token';
let js = new JobService(url, token);

describe('JobService.list()', () => {
  afterEach(nock.cleanAll);

  it('makes a GET request', () => {
    nock(url)
      .get('/job/')
      .query({ 'sort(-creation_date,-update_date)': '', 'limit(25)': '' })
      .reply(200, []);

    return expect(js.list()).resolves.toEqual(expect.any(Array));
  });

  it('rejects when there is an error', () => {
    nock(url)
      .get('/job/')
      .query({ 'sort(-creation_date,-update_date)': '', 'limit(25)': '' })
      .reply(400);

    return expect(js.list()).rejects.toEqual(new Error('Bad Request'));
  });

  it('allows us to change the limit', () => {
    nock(url)
      .get('/job/')
      .query({ 'sort(-creation_date,-update_date)': '', 'limit(30)': '' })
      .reply(200, []);

    return expect(js.list(30)).resolves.toEqual(expect.any(Array));
  });

  it('allows us to remove the limit', () => {
    nock(url)
      .get('/job/')
      .query({ 'sort(-creation_date,-update_date)': ''})
      .reply(200, []);

    return expect(js.list(false)).resolves.toEqual(expect.any(Array));
  });

  it('allows us to remove the limit by setting the limit to 0', () => {
    nock(url)
      .get('/job/')
      .query({ 'sort(-creation_date,-update_date)': ''})
      .reply(200, []);

    return expect(js.list(0)).resolves.toEqual(expect.any(Array));
  });
});

describe('JobService.show()', () => {
  afterEach(nock.cleanAll);

  it('makes a GET request', () => {
    nock(url)
      .get('/job/1')
      .reply(200, []);

    return expect(js.show(1)).resolves.toEqual(expect.anything());
  });

  it('rejects when there is an error', () => {
    nock(url)
      .get('/job/1')
      .reply(400);

    return expect(js.show(1)).rejects.toEqual(new Error('Bad Request'));
  });
});

describe('JobService.submit()', () => {
  afterEach(nock.cleanAll);

  it('makes a POST request', () => {
    nock(url, 
      {
        reqheaders: {
          'authorization': token,
          'accept': 'application/json',
          'content-type': 'application/json'
        }
      }  
    )
      .post('/job/', 
        {
          job_definition: 'def',
          input: { foo: 'bar'},
          output_container: '/test/path',
          output_name: 'job'
        }
      )
      .reply(200, {});

    let name = 'job';
    let loc = '/test/path';
    let definition = 'def';
    let input = {foo: 'bar'};
    
    return expect(js.submit(definition, input, name, loc))
      .resolves
      .toEqual(expect.anything());
  });

  it('rejects when there is an error', () => {
    nock(url)
      .post('/job/')
      .reply(400);

    let name = 'job';
    let loc = '/test/path';
    let definition = 'def';
    let input = {foo: 'bar'};

    return expect(js.submit(definition, input, name, loc))
      .rejects
      .toEqual(new Error('Bad Request'));
  });
});

describe('JobService.cancel()', () => {
});

describe('JobService.hold()', () => {
});

describe('JobService.createDefinition()', () => {
  afterEach(nock.cleanAll);

  it('POSTS', () => {
    nock(url, {
      reqheaders: {
        'accept': 'application/json',
        'authorization': token,
        'content-type': 'application/json'
      }
    })
      .post('/job_definition/')/*, {
        id: 'test',
        type: 'task',
        description: 'test',
        ignoreStdout: false,
        ignoreStderr: false
      })
      */
      .reply(200, {});

    return expect(js.createDefinition(
      'test', 'test', null, 'task', false, false))
      .resolves.toEqual({});
  });

  it('has a schema when you provide one', () => {
    nock(url, {
      reqheaders: {
        'accept': 'application/json',
        'authorization': token,
        'content-type': 'application/json'
      }
    })
      .post('/job_definition/')/*, {
        id: 'test',
        type: 'task',
        input: {
          test: 'test'
        },
        description: 'test',
        ignoreStdout: false,
        ignoreStderr: false
      })*/
      .reply(200, {});

    return expect(js.createDefinition(
      'test', 'test', {test: 'test'}, 'task', false, false))
      .resolves.toEqual({});
  });
});

describe('JobService.listDefinitions()', () => {
  it('GETS', () => {
    nock(url, 
      { 
        reqheaders: {
          accept: 'application/json',
          authorization: token
        }
      }
    )
      .get('/job_definition/')
      .reply(200, []);
    
    return expect(js.listDefinitions())
      .resolves
      .toEqual([]);
  });
});

describe('JobService.patchDefinition()', () => {
  it('PATCHES', () => {
    nock(url, {
      reqheaders: {
        'accept': 'application/json',
        'content-type': 'application/json-patch+json',
        'authorization': token
      }
    })
      .patch('/job_definition/1')
      .reply(200, {});

    return expect(js.patchDefinition('1')).resolves.toEqual({});
  });

  it('JobService has patches', () => { 
    expect(JobService.patches).toBeDefined();
  });

  it('accepts patches from the JobService.patches object', () => {
    nock(url, {
      reqheaders: {
        'accept': 'application/json',
        'content-type': 'application/json-patch+json',
        'authorization': token
      }
    })
      .patch('/job_definition/1', 
        [
          {
            op: 'replace',
            path: '/type',
            value: 'foo'
          }
        ]
      )
      .reply(200, {});

    return expect(js.patchDefinition('1', JobService.patches.changeType('foo')))
      .resolves.toEqual({});
  });

  it('accepts multiple patches from the JobService.patches object', () => {
    nock(url, {
      reqheaders: {
        'accept': 'application/json',
        'content-type': 'application/json-patch+json',
        'authorization': token
      }
    })
      .patch('/job_definition/1', 
        [
          {
            op: 'replace',
            path: '/type',
            value: 'foo'
          },
          {
            op: 'replace',
            path: '/enabled',
            value: false
          }
        ]
      )
      .reply(200, {});

    return expect(js.patchDefinition(
      '1', 
      JobService.patches.changeType('foo'),
      JobService.patches.disable()
    ))
      .resolves.toEqual({});
  });
});
