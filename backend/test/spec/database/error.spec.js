const Log = require('../../logger');
const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');
const ErrorAccessor = require('../../../src/database/error');

const testName = 'Error Accessor';
Firebase.start(process.env.MOCK === '1');
const getErrorTitle = 'Get error';
/* eslint-disable no-undef */
describe(getErrorTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, getErrorTitle, true);
    this.testError = {
      test: 'test',
    };

    this.testErrorId = await ErrorAccessor.add(this.testError);
    Log.beforeEach(testName, getErrorTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, getErrorTitle, true);
    await ErrorAccessor.remove(this.testErrorId);
    delete this.testError;
    delete this.testErrorId;
    Log.afterEach(testName, getErrorTitle, false);
    done();
  });

  const it1 = 'returns null for an invalid error ID';
  it(it1, async (done) => {
    Log.it(testName, getErrorTitle, it1, true);
    const result = await ErrorAccessor.get(null);
    expect(result).toBeNull();
    Log.log(testName, getErrorTitle, result);
    Log.it(testName, getErrorTitle, it1, false);
    done();
  });

  const it2 = 'returns undefined when an error occurs';
  it(it2, async (done) => {
    Log.it(testName, getErrorTitle, it2, true);
    const result = await ErrorAccessor.get('$');
    expect(result).not.toBeDefined();
    Log.log(testName, getErrorTitle, result);
    Log.it(testName, getErrorTitle, it2, false);
    done();
  });

  const it3 = 'returns null for a non-existent error ID';
  it(it3, async (done) => {
    Log.it(testName, getErrorTitle, it3, true);
    const result = await ErrorAccessor.get(Utils.newUuid());
    expect(result).toBeNull();
    Log.log(testName, getErrorTitle, result);
    Log.it(testName, getErrorTitle, it3, false);
    done();
  });

  const it4 = 'returns details for an valid error ID';
  it(it4, async (done) => {
    Log.it(testName, getErrorTitle, it4, true);
    const result = await ErrorAccessor.get(this.testErrorId);
    expect(Object.keys(result).length).toBe(Object.keys(this.testError).length);
    expect(result.test).toBe(this.testError.test);
    Log.log(testName, getErrorTitle, result);
    Log.it(testName, getErrorTitle, it4, false);
    done();
  });
});

const addErrorTitle = 'Add error';
describe(addErrorTitle, () => {
  beforeEach(() => {
    Log.beforeEach(testName, addErrorTitle, true);
    this.testError = {
      test: 'test',
    };

    Log.beforeEach(testName, addErrorTitle, false);
  });

  afterEach(async (done) => {
    Log.afterEach(testName, addErrorTitle, true);
    if (Utils.hasValue(this.testErrorId)) await ErrorAccessor.remove(this.testErrorId);
    delete this.testError;
    delete this.testErrorId;
    Log.afterEach(testName, addErrorTitle, false);
    done();
  });

  const it1 = 'returns undefined for an invalid info object';
  it(it1, async (done) => {
    Log.it(testName, addErrorTitle, it1, true);
    this.testErrorId = await ErrorAccessor.add(null);
    expect(this.testErrorId).not.toBeDefined();
    Log.log(testName, addErrorTitle, this.testErrorId);
    Log.it(testName, addErrorTitle, it1, false);
    done();
  });

  const it2 = 'adds error info for a valid info object';
  it(it2, async (done) => {
    Log.it(testName, addErrorTitle, it2, true);
    this.testErrorId = await ErrorAccessor.add(this.testError);
    expect(typeof this.testErrorId).toBe('string');
    expect(this.testErrorId.length).not.toBe(0);
    const result = await ErrorAccessor.get(this.testErrorId);
    expect(Object.keys(result).length).toBe(Object.keys(this.testError).length);
    expect(result.test).toBe(this.testError.test);
    Log.log(testName, addErrorTitle, this.testErrorId);
    Log.it(testName, addErrorTitle, it2, false);
    done();
  });
});

const removeErrorTitle = 'Remove error';
describe(removeErrorTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, removeErrorTitle, true);
    this.testError = {
      test: 'test',
    };

    this.testErrorId = await ErrorAccessor.add(this.testError);
    Log.beforeEach(testName, removeErrorTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, removeErrorTitle, true);
    if (Utils.hasValue(this.testErrorId)) await ErrorAccessor.remove(this.testErrorId);
    delete this.testError;
    delete this.testErrorId;
    Log.afterEach(testName, removeErrorTitle, false);
    done();
  });

  const it1 = 'does nothing for an invalid error ID argument';
  it(it1, async (done) => {
    Log.it(testName, removeErrorTitle, it1, true);
    await ErrorAccessor.remove(null);
    const result = await ErrorAccessor.get(this.testErrorId);
    expect(Object.keys(result).length).toBe(Object.keys(this.testError).length);
    expect(result.test).toBe(this.testError.test);
    Log.log(testName, removeErrorTitle, result);
    Log.it(testName, removeErrorTitle, it1, false);
    done();
  });

  const it2 = 'does nothing for an invalid error ID';
  it(it2, async (done) => {
    Log.it(testName, removeErrorTitle, it2, true);
    await ErrorAccessor.remove('$');
    const result = await ErrorAccessor.get(this.testErrorId);
    expect(Object.keys(result).length).toBe(Object.keys(this.testError).length);
    expect(result.test).toBe(this.testError.test);
    Log.log(testName, removeErrorTitle, result);
    Log.it(testName, removeErrorTitle, it1, false);
    done();
  });

  const it3 = 'deletes error logs for an existing error ID';
  it(it3, async (done) => {
    Log.it(testName, removeErrorTitle, it3, true);
    await ErrorAccessor.remove(this.testErrorId);
    const result = await ErrorAccessor.get(this.testErrorId);
    expect(result).toBeNull();
    Log.log(testName, removeErrorTitle, result);
    Log.it(testName, removeErrorTitle, it3, false);
    done();
  });
});
