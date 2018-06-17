const Log = require('../../logger');
const TestConstants = require('../../constants');
const Utils = require('../../../src/utilities/utils');
const MockFirebase = require('../../../src/firebase/firebase.mock');

const urlPartsTitle = 'URL parts';
/* eslint-disable no-undef */
describe(urlPartsTitle, () => {
  const it01 = 'returns empty array for non-string argument';
  it(it01, () => {
    Log.it(TestConstants.firebase.mock.testName, urlPartsTitle, it01, true);
    const result = MockFirebase.urlParts(null);
    expect(result.length).toBe(0);
    Log.log(TestConstants.firebase.mock.testName, urlPartsTitle, result);
    Log.it(TestConstants.firebase.mock.testName, urlPartsTitle, it01, false);
  });

  const it02 = 'returns empty array for an empty string';
  it(it02, () => {
    Log.it(TestConstants.firebase.mock.testName, urlPartsTitle, it02, true);
    const result = MockFirebase.urlParts('');
    expect(result.length).toBe(0);
    Log.log(TestConstants.firebase.mock.testName, urlPartsTitle, result);
    Log.it(TestConstants.firebase.mock.testName, urlPartsTitle, it02, false);
  });

  const it2 = 'returns an array of length 1 for a string with no \'/\'s';
  it(it2, () => {
    Log.it(TestConstants.firebase.mock.testName, urlPartsTitle, it2, true);
    const url = Utils.newUuid();
    const result = MockFirebase.urlParts(url);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(url);
    Log.log(TestConstants.firebase.mock.testName, urlPartsTitle, result);
    Log.it(TestConstants.firebase.mock.testName, urlPartsTitle, it2, false);
  });

  const it25 = 'returns an array without an empty string as the first element when the url starts with a \'/\'';
  it(it25, () => {
    Log.it(TestConstants.firebase.mock.testName, urlPartsTitle, it25, true);
    const result = MockFirebase.urlParts(`/${TestConstants.params.test}`);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(TestConstants.params.test);
    Log.log(TestConstants.firebase.mock.testName, urlPartsTitle, result);
    Log.it(TestConstants.firebase.mock.testName, urlPartsTitle, it25, false);
  });

  const it3 = 'returns an array with all the correct parts';
  it(it3, () => {
    Log.it(TestConstants.firebase.mock.testName, urlPartsTitle, it3, true);
    const parts = [
      Utils.newUuid(),
      Utils.newUuid(),
      Utils.newUuid(),
      Utils.newUuid(),
    ];

    const result = MockFirebase.urlParts(parts.join('/'));
    expect(result.length).toBe(4);
    expect(result[0]).toBe(parts[0]);
    expect(result[1]).toBe(parts[1]);
    expect(result[2]).toBe(parts[2]);
    expect(result[3]).toBe(parts[3]);
    Log.log(TestConstants.firebase.mock.testName, urlPartsTitle, result);
    Log.it(TestConstants.firebase.mock.testName, urlPartsTitle, it3, false);
  });
});

const getTitle = 'Get';
describe(getTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(TestConstants.firebase.mock.testName, getTitle, true);
    this.data = TestConstants.params.test;
    this.paths = [TestConstants.params.test, TestConstants.params.test, TestConstants.params.test];
    await MockFirebase.setData(this.paths, this.data);
    Log.beforeEach(TestConstants.firebase.mock.testName, getTitle, false);
    done();
  });

  const it1 = 'returns null for a null path';
  it(it1, async (done) => {
    Log.it(TestConstants.firebase.mock.testName, getTitle, it1, true);
    const result = await MockFirebase.get(null);
    expect(result.val()).toBeNull();
    Log.log(TestConstants.firebase.mock.testName, getTitle, result.val());
    Log.it(TestConstants.firebase.mock.testName, getTitle, it1, false);
    done();
  });

  const it2 = 'returns null for a non-existent path';
  it(it2, async (done) => {
    Log.it(TestConstants.firebase.mock.testName, getTitle, it2, true);
    const paths = this.paths.concat([this.data, Utils.newUuid()]);
    const result = await MockFirebase.get(paths);
    expect(result.val()).toBeNull();
    Log.log(TestConstants.firebase.mock.testName, getTitle, result.val());
    Log.it(TestConstants.firebase.mock.testName, getTitle, it2, false);
    done();
  });

  const it3 = 'returns null for a semi-existent path';
  it(it3, async (done) => {
    Log.it(TestConstants.firebase.mock.testName, getTitle, it3, true);
    const paths = [
      this.paths[0],
      this.paths[1],
      Utils.newUuid(),
    ];

    const result = await MockFirebase.get(paths);
    expect(result.val()).toBeNull();
    Log.log(TestConstants.firebase.mock.testName, getTitle, result.val());
    Log.it(TestConstants.firebase.mock.testName, getTitle, it3, false);
    done();
  });

  const it4 = 'returns a value for an existing path';
  it(it4, async (done) => {
    Log.it(TestConstants.firebase.mock.testName, getTitle, it4, true);
    const result = await MockFirebase.get(this.paths);
    expect(result.val()).toBe(this.data);
    Log.log(TestConstants.firebase.mock.testName, getTitle, result.val());
    Log.it(TestConstants.firebase.mock.testName, getTitle, it4, false);
    done();
  });
});

const pushTitle = 'Push';
describe(pushTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(TestConstants.firebase.mock.testName, pushTitle, true);
    this.data = TestConstants.params.test;
    this.paths = [TestConstants.params.test, TestConstants.params.test, TestConstants.params.test];
    Log.beforeEach(TestConstants.firebase.mock.testName, pushTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(TestConstants.firebase.mock.testName, pushTitle, true);
    if (Utils.hasValue(this.url)) await MockFirebase.remove(this.paths);
    delete this.url;
    delete this.data;
    delete this.paths;
    Log.afterEach(TestConstants.firebase.mock.testName, pushTitle, false);
    done();
  });

  const it1 = 'returns undefined for a non-array path argument';
  it(it1, async (done) => {
    Log.it(TestConstants.firebase.mock.testName, pushTitle, it1, true);
    const result = await MockFirebase.push(null, this.data);
    expect(result).not.toBeDefined();
    Log.log(TestConstants.firebase.mock.testName, pushTitle, result);
    Log.it(TestConstants.firebase.mock.testName, pushTitle, it1, false);
    done();
  });

  const it2 = 'pushes data for an empty path array';
  it(it2, async (done) => {
    Log.it(TestConstants.firebase.mock.testName, pushTitle, it2, true);
    this.url = await MockFirebase.push([], this.data);
    expect(this.url).not.toContain('/');
    const data = await MockFirebase.get([this.url]);
    expect(data.val()).toBe(this.data);
    Log.log(TestConstants.firebase.mock.testName, pushTitle, this.url);
    Log.it(TestConstants.firebase.mock.testName, pushTitle, it2, false);
    done();
  });

  const it3 = 'pushes data for a non-empty path array';
  it(it3, async (done) => {
    Log.it(TestConstants.firebase.mock.testName, pushTitle, it3, true);
    this.url = await MockFirebase.push(this.paths, this.data);
    expect(this.url).toContain(`${TestConstants.params.test}/${TestConstants.params.test}/${TestConstants.params.test}/`);
    const data = await MockFirebase.get(this.url.split('/'));
    expect(data.val()).toBe(this.data);
    Log.log(TestConstants.firebase.mock.testName, pushTitle, this.url);
    Log.it(TestConstants.firebase.mock.testName, pushTitle, it3, false);
    done();
  });
});

const setTitle = 'Set';
describe(setTitle, () => {
  beforeEach(() => {
    Log.beforeEach(TestConstants.firebase.mock.testName, setTitle, true);
    this.data = TestConstants.params.test;
    this.paths = [
      Utils.newUuid(),
      Utils.newUuid(),
      Utils.newUuid(),
    ];

    this.deleteTestData = true;
    Log.beforeEach(TestConstants.firebase.mock.testName, setTitle, false);
  });

  afterEach(async (done) => {
    Log.afterEach(TestConstants.firebase.mock.testName, setTitle, true);
    if (this.deleteTestData === true) await MockFirebase.remove(this.paths);
    delete this.data;
    delete this.paths;
    delete this.deleteTestData;
    Log.afterEach(TestConstants.firebase.mock.testName, setTitle, false);
    done();
  });

  const it4 = 'does not set data for non-array paths argument';
  it(it4, async (done) => {
    Log.it(TestConstants.firebase.mock.testName, setTitle, it4, true);
    await MockFirebase.setData(null, this.data);
    const result = await MockFirebase.get(this.paths);
    expect(result.val()).toBeNull();
    this.deleteTestData = false;
    Log.log(TestConstants.firebase.mock.testName, setTitle, result.val());
    Log.it(TestConstants.firebase.mock.testName, setTitle, it4, false);
    done();
  });

  const it5 = 'sets data for an array of paths';
  it(it5, async (done) => {
    Log.it(TestConstants.firebase.mock.testName, setTitle, it5, true);
    await MockFirebase.setData(this.paths, this.data);
    const result = await MockFirebase.get(this.paths);
    expect(result.val()).toBe(this.data);
    Log.log(TestConstants.firebase.mock.testName, setTitle, result.val());
    Log.it(TestConstants.firebase.mock.testName, setTitle, it5, false);
    done();
  });

  const editDeleteSetTitle = 'Single Edit & Delete';
  describe(editDeleteSetTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.firebase.mock.testName, editDeleteSetTitle, true);
      await MockFirebase.setData(this.paths, this.data);
      Log.beforeEach(TestConstants.firebase.mock.testName, editDeleteSetTitle, false);
      done();
    });

    const it6 = 'edits existing data';
    it(it6, async (done) => {
      Log.it(TestConstants.firebase.mock.testName, editDeleteSetTitle, it6, true);
      // Verify data before update
      const result = await MockFirebase.get(this.paths);
      expect(result.val()).toBe(this.data);

      const newData = Utils.newUuid();
      await MockFirebase.setData(this.paths, newData);

      // Verify data after update
      const newResult = await MockFirebase.get(this.paths);
      expect(newResult.val()).toBe(newData);
      Log.log(TestConstants.firebase.mock.testName, editDeleteSetTitle, result.val());
      Log.it(TestConstants.firebase.mock.testName, editDeleteSetTitle, it6, false);
      done();
    });

    const it7 = 'removes existing data';
    it(it7, async (done) => {
      Log.it(TestConstants.firebase.mock.testName, editDeleteSetTitle, it7, true);
      // Verify data before update
      const result = await MockFirebase.get(this.paths);
      expect(result.val()).toBe(this.data);

      await MockFirebase.setData(this.paths, null);

      // Verify data after update
      const newResult = await MockFirebase.get(this.paths);
      expect(newResult.val()).toBeNull();
      Log.log(TestConstants.firebase.mock.testName, editDeleteSetTitle, result.val());
      Log.it(TestConstants.firebase.mock.testName, editDeleteSetTitle, it7, false);
      done();
    });
  });
});

const updateTitle = 'Update';
describe(updateTitle, () => {
  beforeEach(() => {
    Log.beforeEach(TestConstants.firebase.mock.testName, updateTitle, true);
    this.data = TestConstants.params.test;
    this.path1 = [
      Utils.newUuid(),
      Utils.newUuid(),
      Utils.newUuid(),
    ];

    this.path2 = [
      Utils.newUuid(),
      Utils.newUuid(),
      Utils.newUuid(),
    ];

    this.updates = {};
    this.updates[this.path1.join('/')] = this.data;
    this.updates[this.path2.join('/')] = this.data;
    this.deleteTestData = true;
    Log.beforeEach(TestConstants.firebase.mock.testName, updateTitle, false);
  });

  afterEach(async (done) => {
    Log.afterEach(TestConstants.firebase.mock.testName, updateTitle, true);
    if (this.deleteTestData === true) {
      this.updates[this.path1.join('/')] = null;
      this.updates[this.path2.join('/')] = null;
      await MockFirebase.update(this.updates);
    }

    delete this.data;
    delete this.paths;
    delete this.updates;
    delete this.deleteTestData;
    Log.afterEach(TestConstants.firebase.mock.testName, updateTitle, false);
    done();
  });

  const it1 = 'does not perform data for non-object argument';
  it(it1, async (done) => {
    Log.it(TestConstants.firebase.mock.testName, updateTitle, it1, true);
    await MockFirebase.update(null);
    const result1 = await MockFirebase.get(this.path1);
    const result2 = await MockFirebase.get(this.path2);
    expect(result1.val()).toBeNull();
    expect(result2.val()).toBeNull();
    this.deleteTestData = false;
    Log.log(TestConstants.firebase.mock.testName, updateTitle, { result1, result2 });
    Log.it(TestConstants.firebase.mock.testName, updateTitle, it1, false);
    done();
  });

  const it2 = 'performs multiple additions for a valid object argument';
  it(it2, async (done) => {
    Log.it(TestConstants.firebase.mock.testName, updateTitle, it2, true);
    await MockFirebase.update(this.updates);
    const result1 = await MockFirebase.get(this.path1);
    const result2 = await MockFirebase.get(this.path2);
    expect(result1.val()).toBe(this.data);
    expect(result2.val()).toBe(this.data);
    Log.log(TestConstants.firebase.mock.testName, updateTitle, { result1, result2 });
    Log.it(TestConstants.firebase.mock.testName, updateTitle, it2, false);
    done();
  });

  const editDeleteUpdateTitle = 'Multi Edit & Delete';
  describe(editDeleteUpdateTitle, () => {
    beforeEach(async (done) => {
      Log.beforeEach(TestConstants.firebase.mock.testName, editDeleteUpdateTitle, true);
      await MockFirebase.update(this.updates);
      Log.beforeEach(TestConstants.firebase.mock.testName, editDeleteUpdateTitle, false);
      done();
    });

    const it3 = 'performs multiple edits on existing data';
    it(it3, async (done) => {
      Log.it(TestConstants.firebase.mock.testName, updateTitle, it3, true);
      // Verify data before update
      const result1 = await MockFirebase.get(this.path1);
      const result2 = await MockFirebase.get(this.path2);
      expect(result1.val()).toBe(this.data);
      expect(result2.val()).toBe(this.data);

      const edits = {};
      const editedData = Utils.newUuid();
      edits[this.path1.join('/')] = editedData;
      edits[this.path2.join('/')] = editedData;
      await MockFirebase.update(edits);

      // Verify data after update
      const result3 = await MockFirebase.get(this.path1);
      const result4 = await MockFirebase.get(this.path2);
      expect(result3.val()).toBe(editedData);
      expect(result4.val()).toBe(editedData);

      Log.log(TestConstants.firebase.mock.testName, updateTitle, editDeleteUpdateTitle);
      Log.it(TestConstants.firebase.mock.testName, updateTitle, it3, false);
      done();
    });

    const it4 = 'performs multiple deletions on existing data';
    it(it4, async (done) => {
      Log.it(TestConstants.firebase.mock.testName, updateTitle, it4, true);
      // Verify data before update
      const result1 = await MockFirebase.get(this.path1);
      const result2 = await MockFirebase.get(this.path2);
      expect(result1.val()).toBe(this.data);
      expect(result2.val()).toBe(this.data);

      const deletions = {};
      deletions[this.path1.join('/')] = null;
      deletions[this.path2.join('/')] = null;
      await MockFirebase.update(deletions);

      // Verify data after update
      const result3 = await MockFirebase.get(this.path1);
      const result4 = await MockFirebase.get(this.path2);
      expect(result3.val()).toBeNull();
      expect(result4.val()).toBeNull();

      this.deleteTestData = false;
      Log.log(TestConstants.firebase.mock.testName, updateTitle, editDeleteUpdateTitle);
      Log.it(TestConstants.firebase.mock.testName, updateTitle, it4, false);
      done();
    });
  });
});

const removeTitle = 'Remove';
describe(removeTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(TestConstants.firebase.mock.testName, removeTitle, true);
    this.data = TestConstants.params.test;
    this.paths = [
      Utils.newUuid(),
      Utils.newUuid(),
      Utils.newUuid(),
    ];

    this.deleteTestData = true;
    await MockFirebase.setData(this.paths, this.data);
    Log.beforeEach(TestConstants.firebase.mock.testName, removeTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(TestConstants.firebase.mock.testName, removeTitle, true);
    if (this.deleteTestData === true) await MockFirebase.remove(this.paths);
    delete this.data;
    delete this.paths;
    delete this.deleteTestData;
    Log.afterEach(TestConstants.firebase.mock.testName, removeTitle, false);
    done();
  });

  const it1 = 'does not delete data for non-array paths argument';
  it(it1, async (done) => {
    Log.it(TestConstants.firebase.mock.testName, removeTitle, it1, true);
    await MockFirebase.remove(null);
    const result = await MockFirebase.get(this.paths);
    expect(result.val()).toBe(this.data);
    Log.log(TestConstants.firebase.mock.testName, removeTitle, result.val());
    Log.it(TestConstants.firebase.mock.testName, removeTitle, it1, false);
    done();
  });

  const it2 = 'does delete data for a valid paths argument';
  it(it2, async (done) => {
    Log.it(TestConstants.firebase.mock.testName, removeTitle, it2, true);
    await MockFirebase.remove(this.paths);
    const result = await MockFirebase.get(this.paths);
    expect(result.val()).toBeNull();
    this.deleteTestData = false;
    Log.log(TestConstants.firebase.mock.testName, removeTitle, result.val());
    Log.it(TestConstants.firebase.mock.testName, removeTitle, it2, false);
    done();
  });
});

const refTitle = 'Datastore reference';
describe(refTitle, () => {
  const it1 = 'returns an object with only 5 functions';
  it(it1, () => {
    Log.it(TestConstants.firebase.mock.testName, refTitle, it1, true);
    const result = MockFirebase.ref();
    expect(result).not.toBeNull();
    expect(Object.keys(result).length).toBe(5);
    expect(typeof result.once).toBe('function');
    expect(typeof result.push).toBe('function');
    expect(typeof result.set).toBe('function');
    expect(typeof result.update).toBe('function');
    expect(typeof result.remove).toBe('function');
    Log.it(TestConstants.firebase.mock.testName, refTitle, it1, false);
    Log.log(TestConstants.firebase.mock.testName, refTitle, result);
  });
});
