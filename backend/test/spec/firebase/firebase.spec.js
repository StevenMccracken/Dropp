const Log = require('../../logger');
const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');

const testName = 'Firebase';
Firebase.start(process.env.MOCK === '1');
/* eslint-disable no-undef */
describe('Firebase functions', () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, 'Firebase functions', true);
    this.testData = {
      key: 'value',
    };

    const url = await Firebase.add('/test', this.testData);
    const key = url.split('/').pop();
    this.testDataUrl = `/test/${key}`;
    Log.beforeEach(testName, 'Firebase functions', false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, 'Firebase functions', true);
    await Firebase.remove(this.testDataUrl);
    delete this.testData;
    delete this.testDataUrl;
    Log.afterEach(testName, 'Firebase functions', false);
    done();
  });

  const getDataTitle = 'Get data';
  describe(getDataTitle, () => {
    const it1 = 'gets data from firebase';
    it(it1, async (done) => {
      Log.it(testName, getDataTitle, it1, true);
      const data = await Firebase.get(this.testDataUrl);
      expect(data.key).toBe(this.testData.key);
      Log.log(testName, getDataTitle, data);
      Log.it(testName, getDataTitle, it1, false);
      done();
    });

    const it2 = 'returns null for non-existent data';
    it(it2, async (done) => {
      Log.it(testName, getDataTitle, it2, true);
      const result = await Firebase.get(`/${Utils.newUuid()}`);
      expect(result).toBeNull();
      Log.log(testName, getDataTitle, result);
      Log.it(testName, getDataTitle, it2, false);
      done();
    });
  });

  const updateDataTitle = 'Update data';
  describe(updateDataTitle, () => {
    const it3 = 'updates data in firebase';
    it(it3, async (done) => {
      Log.it(testName, updateDataTitle, it3, true);
      const newData = { key: 'updated value' };
      await Firebase.update(this.testDataUrl, newData);
      const data = await Firebase.get(this.testDataUrl);
      expect(data.key).toBe(newData.key);
      Log.log(testName, updateDataTitle, data);
      Log.it(testName, updateDataTitle, it3, false);
      done();
    });
  });
});

describe('Bulk operations', () => {
  beforeEach(() => {
    Log.beforeEach(testName, 'Bulk operations', true);
    this.bulkUpdateData = {};
    this.url1 = Utils.newUuid();
    this.url2 = Utils.newUuid();
    this.bulkUpdateData[this.url1] = Utils.newUuid();
    this.bulkUpdateData[this.url2] = { test: 'test' };
    Log.beforeEach(testName, 'Bulk operations', false);
  });

  afterEach(() => {
    Log.afterEach(testName, 'Bulk operations', true);
    delete this.url1;
    delete this.url2;
    delete this.bulkUpdateData;
    Log.afterEach(testName, 'Bulk operations', false);
  });

  const bulkUpdateTitle = 'Bulk update data';
  describe(bulkUpdateTitle, () => {
    afterEach(async (done) => {
      Log.afterEach(testName, bulkUpdateTitle, true);
      await Firebase.bulkRemove([this.url1, this.url2]);
      Log.afterEach(testName, bulkUpdateTitle, false);
      done();
    });

    const it4 = 'updates multiple pieces of data in firebase';
    it(it4, async (done) => {
      Log.it(testName, bulkUpdateTitle, it4, true);
      await Firebase.bulkUpdate(this.bulkUpdateData);
      const result1 = await Firebase.get(`/${this.url1}`);
      expect(result1).toBe(this.bulkUpdateData[this.url1]);
      const result2 = await Firebase.get(`/${this.url2}`);
      expect(result2.test).toBe('test');
      Log.log(testName, bulkUpdateTitle, { result1, result2 });
      Log.it(testName, bulkUpdateTitle, it4, false);
      done();
    });
  });

  const bulkRemoveTitle = 'Bulk remove data';
  describe(bulkRemoveTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(testName, bulkRemoveTitle, true);
      await Firebase.bulkUpdate(this.bulkUpdateData);
      Log.beforeEach(testName, bulkRemoveTitle, false);
      done();
    });

    const it5 = 'removes multiple pieces of data from firebase';
    it(it5, async (done) => {
      Log.it(testName, bulkRemoveTitle, it5, true);
      await Firebase.bulkRemove([this.url1, this.url2]);
      const result1 = await Firebase.get(`/${this.url1}`);
      const result2 = await Firebase.get(`/${this.url2}`);
      expect(result1).toBeNull();
      expect(result2).toBeNull();
      Log.log(testName, bulkRemoveTitle, { result1, result2 });
      Log.it(testName, bulkRemoveTitle, it5, false);
      done();
    });
  });
});

const addDataTitle = 'Add data';
describe(addDataTitle, () => {
  afterEach(async (done) => {
    Log.afterEach(testName, addDataTitle, true);
    await Firebase.remove(this.testDataUrl);
    delete this.testDataUrl;
    Log.afterEach(testName, addDataTitle, false);
    done();
  });

  const it1 = 'adds data to firebase';
  it(it1, async (done) => {
    Log.it(testName, addDataTitle, it1, true);
    const data = { key: 'value' };
    const url = await Firebase.add('/test', data);
    const key = url.split('/').pop();
    expect(key).not.toBe('');
    this.testDataUrl = `/test/${key}`;
    Log.log(testName, addDataTitle, url);
    Log.it(testName, addDataTitle, it1, false);
    done();
  });
});

const deleteDataTitle = 'Delete data';
describe(deleteDataTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, deleteDataTitle, true);
    const data = { key: 'value' };
    const url = await Firebase.add('/test', data);
    const key = url.split('/').pop();
    this.testDataUrl = `/test/${key}`;
    Log.beforeEach(testName, deleteDataTitle, false);
    done();
  });

  afterEach(() => {
    Log.afterEach(testName, deleteDataTitle, true);
    delete this.testDataUrl;
    Log.afterEach(testName, deleteDataTitle, false);
  });

  const it1 = 'deletes data from firebase';
  it(it1, async (done) => {
    Log.it(testName, deleteDataTitle, it1, true);
    await Firebase.remove(this.testDataUrl);
    const result = await Firebase.get(this.testDataUrl);
    expect(result).toBeNull();
    Log.log(testName, deleteDataTitle, result);
    Log.it(testName, deleteDataTitle, it1, false);
    done();
  });
});

const invalidUrlTitle = 'Request invalid URL';
describe(invalidUrlTitle, () => {
  const it1 = 'throws an error because the URL is invalid';
  it(it1, async (done) => {
    Log.it(testName, invalidUrlTitle, it1, true);
    try {
      const result = await Firebase.get('.$[]');
      expect(result).toBeNull();
      Log.log(testName, invalidUrlTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DatabaseError');
      Log.log(testName, invalidUrlTitle, error);
    }

    Log.it(testName, invalidUrlTitle, it1, false);
    done();
  });
});
