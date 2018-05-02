const Log = require('../../logger');
const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');
const ErrorAccessor = require('../../../src/database/error');

/**
 * Logs a message for the current test files
 * @param {String} _title the describe label
 * @param {String|Object} _details the log details
 */
function log(_title, _details) {
  Log(`Error Accessor ${_title}`, _details);
}

Firebase.start(process.env.MOCK === '1');
const getErrorTitle = 'Get error';
/* eslint-disable no-undef */
describe(getErrorTitle, () => {
  beforeEach(async (done) => {
    this.testError = {
      test: 'test',
    };

    this.testErrorId = await ErrorAccessor.add(this.testError);
    done();
  });

  afterEach(async (done) => {
    await ErrorAccessor.remove(this.testErrorId);
    delete this.testError;
    delete this.testErrorId;
    done();
  });

  it('returns null for an invalid error ID', async (done) => {
    const result = await ErrorAccessor.get(null);
    expect(result).toBeNull();
    log(getErrorTitle, result);
    done();
  });

  it('returns undefined when an error occurs', async (done) => {
    const result = await ErrorAccessor.get('$');
    expect(result).not.toBeDefined();
    log(getErrorTitle, result);
    done();
  });

  it('returns null for a non-existent error ID', async (done) => {
    const result = await ErrorAccessor.get(Utils.newUuid());
    expect(result).toBeNull();
    log(getErrorTitle, result);
    done();
  });

  it('returns details for an valid error ID', async (done) => {
    const result = await ErrorAccessor.get(this.testErrorId);
    expect(result).toBe(this.testError);
    log(getErrorTitle, result);
    done();
  });
});

const addErrorTitle = 'Add error';
describe(addErrorTitle, () => {
  beforeEach(() => {
    this.testError = {
      test: 'test',
    };
  });

  afterEach(async (done) => {
    if (this.testErrorId) {
      await ErrorAccessor.remove(this.testErrorId);
      delete this.testErrorId;
    }

    delete this.testError;
    done();
  });

  it('returns undefined for an invalid info object', async (done) => {
    this.testErrorId = await ErrorAccessor.add(null);
    expect(this.testErrorId).not.toBeDefined();
    log(addErrorTitle, this.testErrorId);
    done();
  });

  it('adds error info for a valid info object', async (done) => {
    this.testErrorId = await ErrorAccessor.add(this.testError);
    expect(typeof this.testErrorId).toBe('string');
    expect(this.testErrorId.length).not.toBe(0);
    const result = await ErrorAccessor.get(this.testErrorId);
    expect(result).toBe(this.testError);
    log(addErrorTitle, this.testErrorId);
    done();
  });
});

const removeErrorTitle = 'Remove error';
describe(removeErrorTitle, () => {
  beforeEach(async (done) => {
    this.testError = {
      test: 'test',
    };

    this.testErrorId = await ErrorAccessor.add(this.testError);
    done();
  });

  afterEach(async (done) => {
    if (this.testErrorId) {
      await ErrorAccessor.remove(this.testErrorId);
      delete this.testErrorId;
    }

    delete this.testError;
    done();
  });

  it('does nothing for an invalid error ID argument', async (done) => {
    await ErrorAccessor.remove(null);
    const result = await ErrorAccessor.get(this.testErrorId);
    expect(result).toBe(this.testError);
    log(removeErrorTitle, result);
    done();
  });

  it('does nothing for an invalid error ID', async (done) => {
    await ErrorAccessor.remove('$');
    const result = await ErrorAccessor.get(this.testErrorId);
    expect(result).toBe(this.testError);
    log(removeErrorTitle, result);
    done();
  });

  it('deletes error logs for an existing error ID', async (done) => {
    await ErrorAccessor.remove(this.testErrorId);
    const result = await ErrorAccessor.get(this.testErrorId);
    expect(result).toBeNull();
    log(removeErrorTitle, result);
    done();
  });
});
/* eslint-enable no-undef */
