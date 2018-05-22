const Log = require('../../logger');
const Utils = require('../../../src/utilities/utils');
const MockFirebase = require('../../../src/firebase/firebase.mock');

const testName = 'Mock Firebase';
const urlPartsTitle = 'URL parts';
/* eslint-disable no-undef */
describe(urlPartsTitle, () => {
  it('returns empty array for non-string argument', (done) => {
    const result = MockFirebase.urlParts(null);
    expect(result.length).toBe(0);
    Log(testName, urlPartsTitle, result);
    done();
  });

  it('returns empty array for an empty string', (done) => {
    const result = MockFirebase.urlParts('');
    expect(result.length).toBe(0);
    Log(testName, urlPartsTitle, result);
    done();
  });

  it('returns an array of length 1 for a string with no \'/\'s', (done) => {
    const url = Utils.newUuid();
    const result = MockFirebase.urlParts(url);
    expect(result.length).toBe(1);
    expect(result[0]).toBe(url);
    Log(testName, urlPartsTitle, result);
    done();
  });

  it(
    'returns an array without an empty string as the first element when the url starts with a \'/\'',
    (done) => {
      const result = MockFirebase.urlParts('/test');
      expect(result.length).toBe(1);
      expect(result[0]).toBe('test');
      Log(testName, urlPartsTitle, result);
      done();
    }
  );

  it('returns an array with all the correct parts', (done) => {
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
    Log(testName, urlPartsTitle, result);
    done();
  });
});

const getTitle = 'Get';
describe(getTitle, () => {
  beforeEach(async (done) => {
    this.data = 'test';
    this.paths = ['test', 'test', 'test'];
    await MockFirebase.setData(this.paths, this.data);
    done();
  });

  it('returns null for a null path', async (done) => {
    const result = await MockFirebase.get(null);
    expect(result.val()).toBeNull();
    Log(testName, getTitle, result.val());
    done();
  });

  it('returns null for a non-existent path', async (done) => {
    const paths = this.paths.concat([this.data, Utils.newUuid()]);
    const result = await MockFirebase.get(paths);
    expect(result.val()).toBeNull();
    Log(testName, getTitle, result.val());
    done();
  });

  it('returns null for a semi-existent path', async (done) => {
    const paths = [
      this.paths[0],
      this.paths[1],
      Utils.newUuid(),
    ];

    const result = await MockFirebase.get(paths);
    expect(result.val()).toBeNull();
    Log(testName, getTitle, result.val());
    done();
  });

  it('returns a value for an existing path', async (done) => {
    const result = await MockFirebase.get(this.paths);
    expect(result.val()).toBe(this.data);
    Log(testName, getTitle, result.val());
    done();
  });
});

const pushTitle = 'Push';
describe(pushTitle, () => {
  beforeEach(async (done) => {
    this.data = 'test';
    this.paths = ['test', 'test', 'test'];
    done();
  });

  afterEach(async (done) => {
    if (Utils.hasValue(this.url)) await MockFirebase.remove(this.paths);
    delete this.url;
    delete this.data;
    delete this.paths;
    done();
  });

  it('returns undefined for a non-array path argument', async (done) => {
    const result = await MockFirebase.push(null, this.data);
    expect(result).not.toBeDefined();
    Log(testName, pushTitle, result);
    done();
  });

  it('pushes data for an empty path array', async (done) => {
    this.url = await MockFirebase.push([], this.data);
    expect(this.url).not.toContain('/');
    const data = await MockFirebase.get([this.url]);
    expect(data.val()).toBe(this.data);
    Log(testName, pushTitle, this.url);
    done();
  });

  it('pushes data for a non-empty path array', async (done) => {
    this.url = await MockFirebase.push(this.paths, this.data);
    expect(this.url).toContain('test/test/test/');
    const data = await MockFirebase.get(this.url.split('/'));
    expect(data.val()).toBe(this.data);
    Log(testName, pushTitle, this.url);
    done();
  });
});

const setTitle = 'Set';
describe(setTitle, () => {
  beforeEach(() => {
    this.data = 'test';
    this.paths = [
      Utils.newUuid(),
      Utils.newUuid(),
      Utils.newUuid(),
    ];

    this.deleteTestData = true;
  });

  afterEach(async (done) => {
    if (this.deleteTestData === true) await MockFirebase.remove(this.paths);
    delete this.data;
    delete this.paths;
    delete this.deleteTestData;
    done();
  });

  it('does not set data for non-array paths argument', async (done) => {
    await MockFirebase.setData(null, this.data);
    const result = await MockFirebase.get(this.paths);
    expect(result.val()).toBeNull();
    this.deleteTestData = false;
    Log(testName, setTitle, result.val());
    done();
  });

  it('sets data for an array of paths', async (done) => {
    await MockFirebase.setData(this.paths, this.data);
    const result = await MockFirebase.get(this.paths);
    expect(result.val()).toBe(this.data);
    Log(testName, setTitle, result.val());
    done();
  });

  const editDeleteSetTitle = 'Single Edit & Delete';
  describe(editDeleteSetTitle, () => {
    beforeEach(async (done) => {
      await MockFirebase.setData(this.paths, this.data);
      done();
    });

    it('edits existing data', async (done) => {
      // Verify data before update
      const result = await MockFirebase.get(this.paths);
      expect(result.val()).toBe(this.data);

      const newData = Utils.newUuid();
      await MockFirebase.setData(this.paths, newData);

      // Verify data after update
      const newResult = await MockFirebase.get(this.paths);
      expect(newResult.val()).toBe(newData);
      Log(testName, editDeleteSetTitle, result.val());
      done();
    });

    it('removes existing data', async (done) => {
      // Verify data before update
      const result = await MockFirebase.get(this.paths);
      expect(result.val()).toBe(this.data);

      await MockFirebase.setData(this.paths, null);

      // Verify data after update
      const newResult = await MockFirebase.get(this.paths);
      expect(newResult.val()).toBeNull();
      Log(testName, editDeleteSetTitle, result.val());
      done();
    });
  });
});

const updateTitle = 'Update';
describe(updateTitle, () => {
  beforeEach(() => {
    this.data = 'test';
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
  });

  afterEach(async (done) => {
    if (this.deleteTestData === true) {
      this.updates[this.path1.join('/')] = null;
      this.updates[this.path2.join('/')] = null;
      await MockFirebase.update(this.updates);
    }

    delete this.data;
    delete this.paths;
    delete this.updates;
    delete this.deleteTestData;
    done();
  });

  it('does not perform data for non-object argument', async (done) => {
    await MockFirebase.update(null);
    const result1 = await MockFirebase.get(this.path1);
    const result2 = await MockFirebase.get(this.path2);
    expect(result1.val()).toBeNull();
    expect(result2.val()).toBeNull();
    this.deleteTestData = false;
    Log(testName, updateTitle, { result1, result2 });
    done();
  });

  it('performs multiple additions for a valid object argument', async (done) => {
    await MockFirebase.update(this.updates);
    const result1 = await MockFirebase.get(this.path1);
    const result2 = await MockFirebase.get(this.path2);
    expect(result1.val()).toBe(this.data);
    expect(result2.val()).toBe(this.data);
    Log(testName, updateTitle, { result1, result2 });
    done();
  });

  const editDeleteUpdateTitle = 'Multi Edit & Delete';
  describe(editDeleteUpdateTitle, () => {
    beforeEach(async (done) => {
      await MockFirebase.update(this.updates);
      done();
    });

    it('performs multiple edits on existing data', async (done) => {
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

      Log(testName, updateTitle, editDeleteUpdateTitle);
      done();
    });

    it('performs multiple deletions on existing data', async (done) => {
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
      Log(testName, updateTitle, editDeleteUpdateTitle);
      done();
    });
  });
});

const removeTitle = 'Remove';
describe(removeTitle, () => {
  beforeEach(async (done) => {
    this.data = 'test';
    this.paths = [
      Utils.newUuid(),
      Utils.newUuid(),
      Utils.newUuid(),
    ];

    this.deleteTestData = true;
    await MockFirebase.setData(this.paths, this.data);
    done();
  });

  afterEach(async (done) => {
    if (this.deleteTestData === true) await MockFirebase.remove(this.paths);
    delete this.data;
    delete this.paths;
    delete this.deleteTestData;
    done();
  });

  it('does not delete data for non-array paths argument', async (done) => {
    await MockFirebase.remove(null);
    const result = await MockFirebase.get(this.paths);
    expect(result.val()).toBe(this.data);
    Log(testName, removeTitle, result.val());
    done();
  });

  it('does delete data for a valid paths argument', async (done) => {
    await MockFirebase.remove(this.paths);
    const result = await MockFirebase.get(this.paths);
    expect(result.val()).toBeNull();
    this.deleteTestData = false;
    Log(testName, removeTitle, result.val());
    done();
  });
});

const refTitle = 'Datastore reference';
describe(refTitle, () => {
  it('returns an object with only 5 functions', (done) => {
    const result = MockFirebase.ref();
    expect(result).not.toBeNull();
    expect(Object.keys(result).length).toBe(5);
    expect(typeof result.once).toBe('function');
    expect(typeof result.push).toBe('function');
    expect(typeof result.set).toBe('function');
    expect(typeof result.update).toBe('function');
    expect(typeof result.remove).toBe('function');
    Log(testName, refTitle, result);
    done();
  });
});
