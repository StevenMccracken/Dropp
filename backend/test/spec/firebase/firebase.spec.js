const Log = require('../../logger');
const TestConstants = require('../../constants');
const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');
const Constants = require('../../../src/utilities/constants');

Firebase.start(process.env.MOCK === '1');
/* eslint-disable no-undef */
const firebaseFunctionsTitle = 'Firebase functions';
describe(firebaseFunctionsTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(TestConstants.firebase.testName, firebaseFunctionsTitle, true);
    this.testData = {
      key: TestConstants.params.value,
    };

    const url = await Firebase.add(`/${TestConstants.params.test}`, this.testData);
    const key = url.split('/').pop();
    this.testDataUrl = `/${TestConstants.params.test}/${key}`;
    Log.beforeEach(TestConstants.firebase.testName, firebaseFunctionsTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(TestConstants.firebase.testName, firebaseFunctionsTitle, true);
    await Firebase.remove(this.testDataUrl);
    delete this.testData;
    delete this.testDataUrl;
    Log.afterEach(TestConstants.firebase.testName, firebaseFunctionsTitle, false);
    done();
  });

  const getDataTitle = 'Get data';
  describe(getDataTitle, () => {
    const it1 = 'gets data from firebase';
    it(it1, async (done) => {
      Log.it(TestConstants.firebase.testName, getDataTitle, it1, true);
      const data = await Firebase.get(this.testDataUrl);
      expect(data.key).toBe(this.testData.key);
      Log.log(TestConstants.firebase.testName, getDataTitle, data);
      Log.it(TestConstants.firebase.testName, getDataTitle, it1, false);
      done();
    });

    const it2 = 'returns null for non-existent data';
    it(it2, async (done) => {
      Log.it(TestConstants.firebase.testName, getDataTitle, it2, true);
      const result = await Firebase.get(`/${Utils.newUuid()}`);
      expect(result).toBeNull();
      Log.log(TestConstants.firebase.testName, getDataTitle, result);
      Log.it(TestConstants.firebase.testName, getDataTitle, it2, false);
      done();
    });
  });

  const updateDataTitle = 'Update data';
  describe(updateDataTitle, () => {
    const it3 = 'updates data in firebase';
    it(it3, async (done) => {
      Log.it(TestConstants.firebase.testName, updateDataTitle, it3, true);
      const newData = { key: TestConstants.params.updatedValue };
      await Firebase.update(this.testDataUrl, newData);
      const data = await Firebase.get(this.testDataUrl);
      expect(data.key).toBe(newData.key);
      Log.log(TestConstants.firebase.testName, updateDataTitle, data);
      Log.it(TestConstants.firebase.testName, updateDataTitle, it3, false);
      done();
    });
  });
});

const bulkOperationsTitle = 'Bulk operations';
describe(bulkOperationsTitle, () => {
  beforeEach(() => {
    Log.beforeEach(TestConstants.firebase.testName, bulkOperationsTitle, true);
    this.bulkUpdateData = {};
    this.url1 = Utils.newUuid();
    this.url2 = Utils.newUuid();
    this.bulkUpdateData[this.url1] = Utils.newUuid();
    this.bulkUpdateData[this.url2] = { test: TestConstants.params.test };
    Log.beforeEach(TestConstants.firebase.testName, bulkOperationsTitle, false);
  });

  afterEach(() => {
    Log.afterEach(TestConstants.firebase.testName, bulkOperationsTitle, true);
    delete this.url1;
    delete this.url2;
    delete this.bulkUpdateData;
    Log.afterEach(TestConstants.firebase.testName, bulkOperationsTitle, false);
  });

  const bulkUpdateTitle = 'Bulk update data';
  describe(bulkUpdateTitle, () => {
    afterEach(async (done) => {
      Log.afterEach(TestConstants.firebase.testName, bulkUpdateTitle, true);
      await Firebase.bulkRemove([this.url1, this.url2]);
      Log.afterEach(TestConstants.firebase.testName, bulkUpdateTitle, false);
      done();
    });

    const it4 = 'updates multiple pieces of data in firebase';
    it(it4, async (done) => {
      Log.it(TestConstants.firebase.testName, bulkUpdateTitle, it4, true);
      await Firebase.bulkUpdate(this.bulkUpdateData);
      const result1 = await Firebase.get(`/${this.url1}`);
      expect(result1).toBe(this.bulkUpdateData[this.url1]);
      const result2 = await Firebase.get(`/${this.url2}`);
      expect(result2.test).toBe(TestConstants.params.test);
      Log.log(TestConstants.firebase.testName, bulkUpdateTitle, { result1, result2 });
      Log.it(TestConstants.firebase.testName, bulkUpdateTitle, it4, false);
      done();
    });
  });

  const bulkRemoveTitle = 'Bulk remove data';
  describe(bulkRemoveTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.firebase.testName, bulkRemoveTitle, true);
      await Firebase.bulkUpdate(this.bulkUpdateData);
      Log.beforeEach(TestConstants.firebase.testName, bulkRemoveTitle, false);
      done();
    });

    const it5 = 'removes multiple pieces of data from firebase';
    it(it5, async (done) => {
      Log.it(TestConstants.firebase.testName, bulkRemoveTitle, it5, true);
      await Firebase.bulkRemove([this.url1, this.url2]);
      const result1 = await Firebase.get(`/${this.url1}`);
      const result2 = await Firebase.get(`/${this.url2}`);
      expect(result1).toBeNull();
      expect(result2).toBeNull();
      Log.log(TestConstants.firebase.testName, bulkRemoveTitle, { result1, result2 });
      Log.it(TestConstants.firebase.testName, bulkRemoveTitle, it5, false);
      done();
    });
  });
});

const addDataTitle = 'Add data';
describe(addDataTitle, () => {
  afterEach(async (done) => {
    Log.afterEach(TestConstants.firebase.testName, addDataTitle, true);
    await Firebase.remove(this.testDataUrl);
    delete this.testDataUrl;
    Log.afterEach(TestConstants.firebase.testName, addDataTitle, false);
    done();
  });

  const it1 = 'adds data to firebase';
  it(it1, async (done) => {
    Log.it(TestConstants.firebase.testName, addDataTitle, it1, true);
    const data = { key: TestConstants.params.value };
    const url = await Firebase.add(`/${TestConstants.params.test}`, data);
    const key = url.split('/').pop();
    expect(key).not.toBe(TestConstants.utils.strings.emptyString);
    this.testDataUrl = `/${TestConstants.params.test}/${key}`;
    Log.log(TestConstants.firebase.testName, addDataTitle, url);
    Log.it(TestConstants.firebase.testName, addDataTitle, it1, false);
    done();
  });
});

const deleteDataTitle = 'Delete data';
describe(deleteDataTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(TestConstants.firebase.testName, deleteDataTitle, true);
    const data = { key: TestConstants.params.value };
    const url = await Firebase.add(`/${TestConstants.params.test}`, data);
    const key = url.split('/').pop();
    this.testDataUrl = `/${TestConstants.params.test}/${key}`;
    Log.beforeEach(TestConstants.firebase.testName, deleteDataTitle, false);
    done();
  });

  afterEach(() => {
    Log.afterEach(TestConstants.firebase.testName, deleteDataTitle, true);
    delete this.testDataUrl;
    Log.afterEach(TestConstants.firebase.testName, deleteDataTitle, false);
  });

  const it1 = 'deletes data from firebase';
  it(it1, async (done) => {
    Log.it(TestConstants.firebase.testName, deleteDataTitle, it1, true);
    await Firebase.remove(this.testDataUrl);
    const result = await Firebase.get(this.testDataUrl);
    expect(result).toBeNull();
    Log.log(TestConstants.firebase.testName, deleteDataTitle, result);
    Log.it(TestConstants.firebase.testName, deleteDataTitle, it1, false);
    done();
  });
});

const invalidUrlTitle = 'Request invalid URL';
describe(invalidUrlTitle, () => {
  const it1 = 'throws an error because the URL is invalid';
  it(it1, async (done) => {
    Log.it(TestConstants.firebase.testName, invalidUrlTitle, it1, true);
    try {
      const result = await Firebase.get(TestConstants.params.invalidChars.url);
      expect(result).toBeNull();
      Log.log(
        TestConstants.firebase.testName,
        invalidUrlTitle,
        TestConstants.messages.shouldHaveThrown
      );
    } catch (error) {
      expect(error.name).toBe(Constants.errors.database.name);
      Log.log(TestConstants.firebase.testName, invalidUrlTitle, error);
    }

    Log.it(TestConstants.firebase.testName, invalidUrlTitle, it1, false);
    done();
  });
});
