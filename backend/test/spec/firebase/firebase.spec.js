const Log = require('../../logger');
const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');

const testName = 'Firebase';
Firebase.start(process.env.MOCK === '1');
/* eslint-disable no-undef */
describe('Firebase functions', () => {
  beforeEach(async (done) => {
    this.testData = {
      key: 'value',
    };

    const url = await Firebase.add('/test', this.testData);
    const key = url.split('/').pop();
    this.testDataUrl = `/test/${key}`;
    done();
  });

  afterEach(async (done) => {
    await Firebase.remove(this.testDataUrl);
    delete this.testData;
    delete this.testDataUrl;
    done();
  });

  const getDataTitle = 'Get data';
  describe(getDataTitle, () => {
    it('gets data from firebase', async (done) => {
      const data = await Firebase.get(this.testDataUrl);
      expect(data.key).toBe(this.testData.key);
      Log(testName, getDataTitle, data);
      done();
    });

    it('returns null for non-existent data', async (done) => {
      const result = await Firebase.get(`/${Utils.newUuid()}`);
      expect(result).toBeNull();
      Log(testName, getDataTitle, result);
      done();
    });
  });

  const updateDataTitle = 'Update data';
  describe(updateDataTitle, () => {
    it('updates data in firebase', async (done) => {
      const newData = { key: 'updated value' };
      await Firebase.update(this.testDataUrl, newData);
      const data = await Firebase.get(this.testDataUrl);
      expect(data.key).toBe(newData.key);
      Log(testName, updateDataTitle, data);
      done();
    });
  });
});

describe('Bulk operations', () => {
  beforeEach(() => {
    this.bulkUpdateData = {};
    this.url1 = Utils.newUuid();
    this.url2 = Utils.newUuid();
    this.bulkUpdateData[this.url1] = Utils.newUuid();
    this.bulkUpdateData[this.url2] = { test: 'test' };
  });

  afterEach(() => {
    delete this.url1;
    delete this.url2;
    delete this.bulkUpdateData;
  });

  const bulkUpdateTitle = 'Bulk update data';
  describe(bulkUpdateTitle, () => {
    afterEach(async (done) => {
      await Firebase.bulkRemove([this.url1, this.url2]);
      done();
    });

    it('updates multiple pieces of data in firebase', async (done) => {
      await Firebase.bulkUpdate(this.bulkUpdateData);
      const result1 = await Firebase.get(`/${this.url1}`);
      expect(result1).toBe(this.bulkUpdateData[this.url1]);
      const result2 = await Firebase.get(`/${this.url2}`);
      expect(result2.test).toBe('test');
      Log(testName, bulkUpdateTitle, { result1, result2 });
      done();
    });
  });

  const bulkRemoveTitle = 'Bulk remove data';
  describe(bulkRemoveTitle, () => {
    beforeEach(async (done) => {
      await Firebase.bulkUpdate(this.bulkUpdateData);
      done();
    });

    it('removes multiple pieces of data from firebase', async (done) => {
      await Firebase.bulkRemove([this.url1, this.url2]);
      const result1 = await Firebase.get(`/${this.url1}`);
      const result2 = await Firebase.get(`/${this.url2}`);
      expect(result1).toBeNull();
      expect(result2).toBeNull();
      Log(testName, bulkRemoveTitle, { result1, result2 });
      done();
    });
  });
});

const addDataTitle = 'Add data';
describe(addDataTitle, () => {
  afterEach(async (done) => {
    await Firebase.remove(this.testDataUrl);
    delete this.testDataUrl;
    done();
  });

  it('adds data to firebase', async (done) => {
    const data = { key: 'value' };
    const url = await Firebase.add('/test', data);
    const key = url.split('/').pop();
    expect(key).not.toBe('');
    this.testDataUrl = `/test/${key}`;
    Log(testName, addDataTitle, url);
    done();
  });
});

const deleteDataTitle = 'Delete data';
describe(deleteDataTitle, () => {
  beforeEach(async (done) => {
    const data = { key: 'value' };
    const url = await Firebase.add('/test', data);
    const key = url.split('/').pop();
    this.testDataUrl = `/test/${key}`;
    done();
  });

  afterEach(() => {
    delete this.testDataUrl;
  });

  it('deletes data from firebase', async (done) => {
    await Firebase.remove(this.testDataUrl);
    const result = await Firebase.get(this.testDataUrl);
    expect(result).toBeNull();
    Log(testName, deleteDataTitle, result);
    done();
  });
});

const invalidUrlTitle = 'Request invalid URL';
describe(invalidUrlTitle, () => {
  it('throws an error because the URL is invalid', async (done) => {
    try {
      const result = await Firebase.get('.$[]');
      expect(result).toBeNull();
      Log(testName, invalidUrlTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DatabaseError');
      Log(testName, invalidUrlTitle, error);
    }

    done();
  });
});
