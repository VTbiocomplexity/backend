const RafterService = require('./rafter');
const fetch = require('node-fetch');
const buildUrl = require('./util/buildUrl');

class JobService extends RafterService {
  list(limit=25) {
    let query = "?&sort(-creation_date,-update_date)" + 
      (limit ? "&limit(" + limit + ")"  : "")

    let url = buildUrl(this.url, 'job/');

    url = url + query;

    return this.makeRequest(url);
  }

  show(id) {
    let url = buildUrl(this.url, 'job', id);

    return this.makeRequest(url);
  }

  submit(definition, input, outputName, outputLocation) {
    let url = buildUrl(this.url, 'job/');

    let job = { 
      job_definition: definition,
      input,
      output_container: outputLocation,
      output_name: outputName
    };    

    return this.makeRequest(url, 
      {
        method: 'POST', 
        headers: {
          'content-type': 'application/json'
        } ,
        body: JSON.stringify(job)
      }
    );
  }

  cancel() {
    throw new Error('Not implemented.');
  }

  hold() {
    throw new Error('Not implemented.');
  }

  createDefinition(
    name, 
    description, 
    inputSchema, 
    type='task',
    ignoreStdout=false,
    ignoreStderr=false) {

    let url = buildUrl(this.url, 'job_definition/');    
    let jobDefinition = {
      id: name,
      type,
      description,
      ignoreStdout,
      ignoreStderr
    };

    if(inputSchema) jobDefinition.input = inputSchema;

    return this.makeRequest(
      url, 
      {
        method: 'POST', 
        headers: { 'content-type': 'application/json' }, 
        body: JSON.stringify(jobDefinition)
      }
    );
  }

  listDefinitions() {
    let url = buildUrl(this.url, 'job_definition/');

    return this.makeRequest(url); 
  }

  showDefinition(id) {
    let url = buildUrl(this.url, 'job_definition', id);

    return this.makeRequest(url);
  }

  patchDefinition(id, ...patches) {
    let url = buildUrl(this.url, 'job_definition', id);
    return this.makeRequest(
      url,
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json-patch+json' },
        body: JSON.stringify(patches)
      }
    );
  }

  addExecutor(id, executor) {
    return this.makeRequest(
      url,
      {
        method: 'PATCH',
        headers: { 'content-type': 'application/json-patch+json' },
        body: JSON.stringify(patches)
      }
    );
  }
}

JobService.patches = {
  changeType: type => {
    return {
      op: 'replace',
      path: '/type',
      value: type
    };
  },
  changeDesc: desc => {
    return {
      op: 'replace',
      path: '/description',
      value: desc
    };
  },
  ignoreStderr: (ignore=true) => {
    return {
      op: 'add',
      path: '/ignore_stderr',
      value: ignore
    }
  },
  ignoreStdout: (ignore=true) => {
    return {
      op: 'add',
      path: '/ignore_stdout',
      value: ignore
    }
  },
  enable: () => {
    return {
      op: 'replace',
      path: '/enabled',
      value: true
    }
  },
  disable: () => {
    return {
      op: 'replace',
      path: '/enabled',
      value: false
    }
  },
  addExecutor: (executor, position='-') => {
    return {
      op: 'add',
      path: '/executors/' + position,
      value: executor
    }
  },
  modifyExecutor: (position, key, value) => {
    return {
      op: 'replace',
      path: '/executors/' + position + '/' + key,
      value: value
    }
  },
  removeExecutor: position => {
    return {
      op: 'remove',
      path: '/executors/' + pos
    }
  },
  addStage: (name, fileRef) => {
    return {
      op: 'add',
      path: '/stage/' + name,
      value: fileRef
    }
  },
  removeStage: name => {
    return {
      op: 'remove',
      path: '/stage/' + name
    }
  }
}

module.exports = JobService;
