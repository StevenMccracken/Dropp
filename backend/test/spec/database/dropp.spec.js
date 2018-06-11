const Log = require('../../logger');
const Dropp = require('../../../src/models/Dropp');
const Utils = require('../../../src/utilities/utils');
const Location = require('../../../src/models/Location');
const Firebase = require('../../../src/firebase/firebase');
const DroppError = require('../../../src/errors/DroppError');
const DroppAccessor = require('../../../src/database/dropp');
const Constants = require('../../../src/utilities/constants');

const testName = 'Dropp Accessor';
Firebase.start(process.env.MOCK === '1');
const getDroppTitle = 'Get dropp';
/* eslint-disable no-undef */
describe(getDroppTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, getDroppTitle, true);
    this.location = new Location({
      latitude: 0,
      longitude: 0,
    });

    this.testDropp = new Dropp({
      location: this.location,
      media: 'false',
      text: 'test',
      timestamp: 1,
      username: 'test',
    });

    await DroppAccessor.add(this.testDropp);
    Log.beforeEach(testName, getDroppTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, getDroppTitle, true);
    await DroppAccessor.remove(this.testDropp);
    delete this.location;
    delete this.testDropp;
    Log.afterEach(testName, getDroppTitle, false);
    done();
  });

  const it1 = 'throws an error for an invalid dropp ID';
  it(it1, async (done) => {
    Log.it(testName, getDroppTitle, it1, true);
    try {
      await DroppAccessor.get(null);
      expect(false).toBe(true);
      Log.log(testName, getDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log.log(testName, getDroppTitle, error.details);
    }

    Log.it(testName, getDroppTitle, it1, false);
    done();
  });

  const it2 = 'returns null for the forbidden dropp';
  it(it2, async (done) => {
    Log.it(testName, getDroppTitle, it2, true);
    const dropp = await DroppAccessor.get(Constants.database.dropp.forbiddenDroppId);
    expect(dropp).toBeNull();
    Log.log(testName, getDroppTitle, dropp);
    Log.it(testName, getDroppTitle, it2, false);
    done();
  });

  const it3 = 'returns null for a non-existent dropp';
  it(it3, async (done) => {
    Log.it(testName, getDroppTitle, it3, true);
    const dropp = await DroppAccessor.get(Utils.newUuid());
    expect(dropp).toBeNull();
    Log.log(testName, getDroppTitle, dropp);
    Log.it(testName, getDroppTitle, it3, false);
    done();
  });

  const it4 = 'returns a dropp for a valid ID';
  it(it4, async (done) => {
    Log.it(testName, getDroppTitle, it4, true);
    const dropp = await DroppAccessor.get(this.testDropp.id);
    expect(dropp instanceof Dropp).toBe(true);
    expect(dropp.id).toBe(this.testDropp.id);
    expect(dropp.text).toBe(this.testDropp.text);
    expect(dropp.media).toBe(this.testDropp.media);
    expect(dropp.location.latitude).toBe(this.testDropp.location.latitude);
    expect(dropp.location.longitude).toBe(this.testDropp.location.longitude);
    expect(dropp.username).toBe(this.testDropp.username);
    expect(dropp.timestamp).toBe(this.testDropp.timestamp);
    Log.log(testName, getDroppTitle, dropp);
    Log.it(testName, getDroppTitle, it4, false);
    done();
  });
});

const getAllDroppsTitle = 'Get all dropps';
describe(getAllDroppsTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, getAllDroppsTitle, true);
    this.location = new Location({
      latitude: 0,
      longitude: 0,
    });

    this.testDropp = new Dropp({
      location: this.location,
      media: 'false',
      text: 'test',
      timestamp: 1,
      username: 'test',
    });

    await DroppAccessor.add(this.testDropp);
    Log.beforeEach(testName, getAllDroppsTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, getAllDroppsTitle, true);
    await DroppAccessor.remove(this.testDropp);
    delete this.location;
    delete this.testDropp;
    Log.afterEach(testName, getAllDroppsTitle, false);
    done();
  });

  const it1 = 'returns all the dropps';
  it(it1, async (done) => {
    Log.it(testName, getAllDroppsTitle, it1, true);
    const dropps = await DroppAccessor.getAll();

    // Check that array doesn't have invalid values
    expect(Array.isArray(dropps)).toBe(true);
    expect(dropps.includes(null)).toBe(false);
    const filteredDropps = dropps.filter(dropp =>
      dropp.id === Constants.database.dropp.forbiddenDroppId);
    expect(filteredDropps.length).toBe(0);

    // Check that array has expected value
    expect(dropps.filter(dropp => dropp.id === this.testDropp.id).length).toBe(1);
    Log.log(testName, getAllDroppsTitle, dropps.length);
    Log.it(testName, getAllDroppsTitle, it1, false);
    done();
  });
});

const createDroppTitle = 'Create dropp';
describe(createDroppTitle, () => {
  beforeEach(() => {
    Log.beforeEach(testName, createDroppTitle, true);
    this.location = new Location({
      latitude: 0,
      longitude: 0,
    });

    this.testDropp = new Dropp({
      location: this.location,
      media: 'false',
      text: 'test',
      timestamp: 1,
      username: 'test',
    });

    Log.beforeEach(testName, createDroppTitle, false);
  });

  afterEach(() => {
    Log.afterEach(testName, createDroppTitle, true);
    delete this.location;
    delete this.testDropp;
    Log.afterEach(testName, createDroppTitle, false);
  });

  const it1 = 'throws an error for an invalid dropp object';
  it(it1, async (done) => {
    Log.it(testName, createDroppTitle, it1, true);
    try {
      await DroppAccessor.add(null);
      expect(false).toBe(true);
      Log.log(testName, createDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log.log(testName, createDroppTitle, error.details);
    }

    Log.it(testName, createDroppTitle, it1, false);
    done();
  });

  const it2 = 'throws an error for invalid text';
  it(it2, async (done) => {
    Log.it(testName, createDroppTitle, it2, true);
    this.testDropp.text = false;
    try {
      await DroppAccessor.add(this.testDropp);
      expect(false).toBe(true);
      Log.log(testName, createDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('text');
      Log.log(testName, createDroppTitle, error.details);
    }

    Log.it(testName, createDroppTitle, it2, false);
    done();
  });

  const it3 = 'throws an error for invalid media';
  it(it3, async (done) => {
    Log.it(testName, createDroppTitle, it3, true);
    this.testDropp.media = 1;
    try {
      await DroppAccessor.add(this.testDropp);
      expect(false).toBe(true);
      Log.log(testName, createDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('media');
      Log.log(testName, createDroppTitle, error.details);
    }

    Log.it(testName, createDroppTitle, it3, false);
    done();
  });

  const it4 = 'throws an error for an invalid location';
  it(it4, async (done) => {
    Log.it(testName, createDroppTitle, it4, true);
    this.testDropp.location = 1;
    try {
      await DroppAccessor.add(this.testDropp);
      expect(false).toBe(true);
      Log.log(testName, createDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('location');
      Log.log(testName, createDroppTitle, error.details);
    }

    Log.it(testName, createDroppTitle, it4, false);
    done();
  });

  const it5 = 'throws an error for an invalid username';
  it(it5, async (done) => {
    Log.it(testName, createDroppTitle, it5, true);
    this.testDropp.username = 1;
    try {
      await DroppAccessor.add(this.testDropp);
      expect(false).toBe(true);
      Log.log(testName, createDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('username');
      Log.log(testName, createDroppTitle, error.details);
    }

    Log.it(testName, createDroppTitle, it5, false);
    done();
  });

  const it6 = 'throws an error for an invalid timestamp';
  it(it6, async (done) => {
    Log.it(testName, createDroppTitle, it6, true);
    this.testDropp.timestamp = false;
    try {
      await DroppAccessor.add(this.testDropp);
      expect(false).toBe(true);
      Log.log(testName, createDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('timestamp');
      Log.log(testName, createDroppTitle, error.details);
    }

    Log.it(testName, createDroppTitle, it6, false);
    done();
  });

  const it7 = 'adds a dropp to the database for a valid dropp';
  it(it7, async (done) => {
    Log.it(testName, createDroppTitle, it7, true);
    const result = await DroppAccessor.add(this.testDropp);
    expect(result).toBe(this.testDropp);
    expect(typeof result.id).toBe('string');
    expect(result.id.length).not.toBe(0);
    Log.log(testName, createDroppTitle, result);
    Log.it(testName, createDroppTitle, it7, false);
    done();
  });
});

const updateDroppTitle = 'Update dropp';
describe(updateDroppTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, updateDroppTitle, true);
    this.location = new Location({
      latitude: 0,
      longitude: 0,
    });

    this.testDropp = new Dropp({
      location: this.location,
      media: 'false',
      text: 'test',
      timestamp: 1,
      username: 'test',
    });

    await DroppAccessor.add(this.testDropp);
    Log.beforeEach(testName, updateDroppTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, updateDroppTitle, true);
    await DroppAccessor.remove(this.testDropp);
    delete this.location;
    delete this.testDropp;
    Log.afterEach(testName, updateDroppTitle, false);
    done();
  });

  const it1 = 'throws an error for an invalid dropp object';
  it(it1, async (done) => {
    Log.it(testName, updateDroppTitle, it1, true);
    try {
      await DroppAccessor.updateText(null, 'test');
      expect(false).toBe(true);
      Log.log(testName, updateDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log.log(testName, updateDroppTitle, error.details);
    }

    Log.it(testName, updateDroppTitle, it1, false);
    done();
  });

  const it2 = 'throws an error for invalid text';
  it(it2, async (done) => {
    Log.it(testName, updateDroppTitle, it2, true);
    try {
      await DroppAccessor.updateText(this.testDropp, null);
      expect(false).toBe(true);
      Log.log(testName, updateDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('text');
      Log.log(testName, updateDroppTitle, error.details);
    }

    Log.it(testName, updateDroppTitle, it2, false);
    done();
  });

  const it3 = 'updates the text for valid text';
  it(it3, async (done) => {
    Log.it(testName, updateDroppTitle, it3, true);
    const newText = Utils.newUuid();
    await DroppAccessor.updateText(this.testDropp, newText);
    expect(this.testDropp.text).toBe(newText);
    Log.log(testName, updateDroppTitle, this.testDropp);
    Log.it(testName, updateDroppTitle, it3, false);
    done();
  });
});

const removeDroppTitle = 'Remove dropp';
describe(removeDroppTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, removeDroppTitle, true);
    this.location = new Location({
      latitude: 0,
      longitude: 0,
    });

    this.testDropp = new Dropp({
      location: this.location,
      media: 'false',
      text: 'test',
      timestamp: 1,
      username: 'test',
    });

    await DroppAccessor.add(this.testDropp);
    Log.beforeEach(testName, removeDroppTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, removeDroppTitle, true);
    if (Utils.hasValue(this.testDropp)) await DroppAccessor.remove(this.testDropp);
    delete this.location;
    delete this.testDropp;
    Log.afterEach(testName, removeDroppTitle, false);
    done();
  });

  const it1 = 'throws an error for an invalid dropp object';
  it(it1, async (done) => {
    Log.it(testName, removeDroppTitle, it1, true);
    try {
      await DroppAccessor.remove(null);
      expect(false).toBe(true);
      Log.log(testName, removeDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log.log(testName, removeDroppTitle, error.details);
    }

    Log.it(testName, removeDroppTitle, it1, false);
    done();
  });

  const it2 = 'removes a dropp from the database';
  it(it2, async (done) => {
    Log.it(testName, removeDroppTitle, it2, true);
    await DroppAccessor.remove(this.testDropp);
    const result = await DroppAccessor.get(this.testDropp.id);
    expect(result).toBeNull();
    Log.log(testName, removeDroppTitle, result);
    Log.it(testName, removeDroppTitle, it2, false);
    done();
  });
});

const bulkRemoveTitle = 'Bulk remove dropps';
describe(bulkRemoveTitle, () => {
  beforeEach(async (done) => {
    Log.beforeEach(testName, bulkRemoveTitle, true);
    this.location = new Location({
      latitude: 0,
      longitude: 0,
    });

    this.testDropp1 = new Dropp({
      location: this.location,
      media: 'false',
      text: 'test',
      timestamp: 1,
      username: 'test',
    });

    this.testDropp2 = new Dropp({
      location: this.location,
      media: 'false',
      text: 'test',
      timestamp: 1,
      username: 'test',
    });

    await DroppAccessor.add(this.testDropp1);
    await DroppAccessor.add(this.testDropp2);
    Log.beforeEach(testName, bulkRemoveTitle, false);
    done();
  });

  afterEach(async (done) => {
    Log.afterEach(testName, bulkRemoveTitle, true);
    if (Utils.hasValue(this.testDropp1)) await DroppAccessor.remove(this.testDropp1);
    if (Utils.hasValue(this.testDropp2)) await DroppAccessor.remove(this.testDropp2);
    delete this.location;
    delete this.testDropp1;
    delete this.testDropp2;
    Log.afterEach(testName, bulkRemoveTitle, false);
    done();
  });

  const it1 = 'throws an error for an invalid dropp list object';
  it(it1, async (done) => {
    Log.it(testName, bulkRemoveTitle, it1, true);
    try {
      await DroppAccessor.bulkRemove(null);
      expect(false).toBe(true);
      Log.log(testName, bulkRemoveTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log.log(testName, bulkRemoveTitle, error.details);
    }

    Log.it(testName, bulkRemoveTitle, it1, false);
    done();
  });

  const it2 = 'throws an error for an invalid dropp inside a valid list object';
  it(it2, async (done) => {
    Log.it(testName, bulkRemoveTitle, it2, true);
    const dropps = [this.testDropp1, null];
    try {
      await DroppAccessor.bulkRemove(dropps);
      expect(false).toBe(true);
      Log.log(testName, bulkRemoveTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log.log(testName, bulkRemoveTitle, error.details);
    }

    Log.it(testName, bulkRemoveTitle, it2, false);
    done();
  });

  const it3 = 'removes multiple dropps from the database at once';
  it(it3, async (done) => {
    Log.it(testName, bulkRemoveTitle, it3, true);
    const dropps = [this.testDropp1, this.testDropp2];
    await DroppAccessor.bulkRemove(dropps);
    const dropp1 = await DroppAccessor.get(this.testDropp1.id);
    const dropp2 = await DroppAccessor.get(this.testDropp2.id);
    expect(dropp1).toBeNull();
    expect(dropp2).toBeNull();
    Log.log(testName, bulkRemoveTitle, [dropp1, dropp2]);
    Log.it(testName, bulkRemoveTitle, it3, false);
    done();
  });

  const it4 = 'does not throw an error for a dropp without an ID';
  it(it4, async (done) => {
    Log.it(testName, bulkRemoveTitle, it4, true);
    const originalId = this.testDropp1.id;
    this.testDropp1.id = null;
    const dropps = [this.testDropp1];
    await DroppAccessor.bulkRemove(dropps);
    const result = await DroppAccessor.get(originalId);
    expect(result).not.toBeNull();
    expect(result.id).toBe(originalId);
    Log.log(testName, bulkRemoveTitle, result);

    // Reset dropp ID
    this.testDropp1.id = originalId;
    Log.it(testName, bulkRemoveTitle, it4, false);
    done();
  });
});
