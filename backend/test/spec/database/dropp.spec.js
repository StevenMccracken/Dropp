const Log = require('../../logger');
const Dropp = require('../../../src/models/Dropp');
const Utils = require('../../../src/utilities/utils');
const Location = require('../../../src/models/Location');
const Firebase = require('../../../src/firebase/firebase');
const DroppError = require('../../../src/errors/DroppError');
const DroppAccessor = require('../../../src/database/dropp');

const testName = 'Dropp Accessor';
Firebase.start(process.env.MOCK === '1');
const getDroppTitle = 'Get dropp';
/* eslint-disable no-undef */
describe(getDroppTitle, () => {
  beforeEach(async (done) => {
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
    done();
  });

  afterEach(async (done) => {
    await DroppAccessor.remove(this.testDropp);
    delete this.location;
    delete this.testDropp;
    done();
  });

  it('throws an error for an invalid dropp ID', async (done) => {
    try {
      await DroppAccessor.get(null);
      expect(false).toBe(true);
      Log(testName, getDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log(testName, getDroppTitle, error.details);
    }

    done();
  });

  it('returns null for the forbidden dropp', async (done) => {
    const dropp = await DroppAccessor.get(DroppAccessor.forbiddenDroppId);
    expect(dropp).toBeNull();
    Log(testName, getDroppTitle, dropp);
    done();
  });

  it('returns null for a non-existent dropp', async (done) => {
    const dropp = await DroppAccessor.get(Utils.newUuid());
    expect(dropp).toBeNull();
    Log(testName, getDroppTitle, dropp);
    done();
  });

  it('returns a dropp for a valid ID', async (done) => {
    const dropp = await DroppAccessor.get(this.testDropp.id);
    expect(dropp instanceof Dropp).toBe(true);
    expect(dropp.id).toBe(this.testDropp.id);
    expect(dropp.text).toBe(this.testDropp.text);
    expect(dropp.media).toBe(this.testDropp.media);
    expect(dropp.location.latitude).toBe(this.testDropp.location.latitude);
    expect(dropp.location.longitude).toBe(this.testDropp.location.longitude);
    expect(dropp.username).toBe(this.testDropp.username);
    expect(dropp.timestamp).toBe(this.testDropp.timestamp);
    Log(testName, getDroppTitle, dropp);
    done();
  });
});

const getAllDroppsTitle = 'Get all dropps';
describe(getAllDroppsTitle, () => {
  beforeEach(async (done) => {
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
    done();
  });

  afterEach(async (done) => {
    await DroppAccessor.remove(this.testDropp);
    delete this.location;
    delete this.testDropp;
    done();
  });

  it('returns all the dropps', async (done) => {
    const dropps = await DroppAccessor.getAll();

    // Check that array doesn't have invalid values
    expect(Array.isArray(dropps)).toBe(true);
    expect(dropps.includes(null)).toBe(false);
    expect(dropps.filter(dropp => dropp.id === DroppAccessor.forbiddenDroppId).length).toBe(0);

    // Check that array has expected value
    expect(dropps.filter(dropp => dropp.id === this.testDropp.id).length).toBe(1);
    Log(testName, getAllDroppsTitle, dropps.length);
    done();
  });
});

const createDroppTitle = 'Create dropp';
describe(createDroppTitle, () => {
  beforeEach(() => {
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
  });

  afterEach(() => {
    delete this.location;
    delete this.testDropp;
  });

  it('throws an error for an invalid dropp object', async (done) => {
    try {
      await DroppAccessor.add(null);
      expect(false).toBe(true);
      Log(testName, createDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log(testName, createDroppTitle, error.details);
    }

    done();
  });

  it('throws an error for invalid text', async (done) => {
    this.testDropp.text = false;
    try {
      await DroppAccessor.add(this.testDropp);
      expect(false).toBe(true);
      Log(testName, createDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('text');
      Log(testName, createDroppTitle, error.details);
    }

    done();
  });

  it('throws an error for invalid media', async (done) => {
    this.testDropp.media = 1;
    try {
      await DroppAccessor.add(this.testDropp);
      expect(false).toBe(true);
      Log(testName, createDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('media');
      Log(testName, createDroppTitle, error.details);
    }

    done();
  });

  it('throws an error for an invalid location', async (done) => {
    this.testDropp.location = 1;
    try {
      await DroppAccessor.add(this.testDropp);
      expect(false).toBe(true);
      Log(testName, createDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('location');
      Log(testName, createDroppTitle, error.details);
    }

    done();
  });

  it('throws an error for an invalid username', async (done) => {
    this.testDropp.username = 1;
    try {
      await DroppAccessor.add(this.testDropp);
      expect(false).toBe(true);
      Log(testName, createDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('username');
      Log(testName, createDroppTitle, error.details);
    }

    done();
  });

  it('throws an error for an invalid timestamp', async (done) => {
    this.testDropp.timestamp = false;
    try {
      await DroppAccessor.add(this.testDropp);
      expect(false).toBe(true);
      Log(testName, createDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('timestamp');
      Log(testName, createDroppTitle, error.details);
    }

    done();
  });

  it('adds a dropp to the database for a valid dropp', async (done) => {
    const result = await DroppAccessor.add(this.testDropp);
    expect(result).toBe(this.testDropp);
    expect(typeof result.id).toBe('string');
    expect(result.id.length).not.toBe(0);
    Log(testName, createDroppTitle, result);
    done();
  });
});

const updateDroppTitle = 'Update dropp';
describe(updateDroppTitle, () => {
  beforeEach(async (done) => {
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
    done();
  });

  afterEach(async (done) => {
    await DroppAccessor.remove(this.testDropp);
    delete this.location;
    delete this.testDropp;
    done();
  });

  it('throws an error for an invalid dropp object', async (done) => {
    try {
      await DroppAccessor.updateText(null, 'test');
      expect(false).toBe(true);
      Log(testName, updateDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log(testName, updateDroppTitle, error.details);
    }

    done();
  });

  it('throws an error for invalid text', async (done) => {
    try {
      await DroppAccessor.updateText(this.testDropp, null);
      expect(false).toBe(true);
      Log(testName, updateDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.InvalidRequest.type);
      expect(error.details.error.message).toBe('text');
      Log(testName, updateDroppTitle, error.details);
    }

    done();
  });

  it('updates the text for valid text', async (done) => {
    const newText = Utils.newUuid();
    await DroppAccessor.updateText(this.testDropp, newText);
    expect(this.testDropp.text).toBe(newText);
    Log(testName, updateDroppTitle, this.testDropp);
    done();
  });
});

const removeDroppTitle = 'Remove dropp';
describe(removeDroppTitle, () => {
  beforeEach(async (done) => {
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
    done();
  });

  afterEach(async (done) => {
    if (Utils.hasValue(this.testDropp)) await DroppAccessor.remove(this.testDropp);
    delete this.location;
    delete this.testDropp;
    done();
  });

  it('throws an error for an invalid dropp object', async (done) => {
    try {
      await DroppAccessor.remove(null);
      expect(false).toBe(true);
      Log(testName, removeDroppTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log(testName, removeDroppTitle, error.details);
    }

    done();
  });

  it('removes a dropp from the database', async (done) => {
    await DroppAccessor.remove(this.testDropp);
    const result = await DroppAccessor.get(this.testDropp.id);
    expect(result).toBeNull();
    Log(testName, removeDroppTitle, result);
    done();
  });
});

const bulkRemoveTitle = 'Bulk remove dropps';
describe(bulkRemoveTitle, () => {
  beforeEach(async (done) => {
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
    done();
  });

  afterEach(async (done) => {
    if (Utils.hasValue(this.testDropp1)) await DroppAccessor.remove(this.testDropp1);
    if (Utils.hasValue(this.testDropp2)) await DroppAccessor.remove(this.testDropp2);
    delete this.location;
    delete this.testDropp1;
    delete this.testDropp2;
    done();
  });

  it('throws an error for an invalid dropp list object', async (done) => {
    try {
      await DroppAccessor.bulkRemove(null);
      expect(false).toBe(true);
      Log(testName, bulkRemoveTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log(testName, bulkRemoveTitle, error.details);
    }

    done();
  });

  it('throws an error for an invalid dropp inside a valid list object', async (done) => {
    const dropps = [this.testDropp1, null];
    try {
      await DroppAccessor.bulkRemove(dropps);
      expect(false).toBe(true);
      Log(testName, bulkRemoveTitle, 'Should have thrown error');
    } catch (error) {
      expect(error.name).toBe('DroppError');
      expect(error.details.error.type).toBe(DroppError.type.Server.type);
      expect(error.details.error.message).toBe(DroppError.type.Server.message);
      Log(testName, bulkRemoveTitle, error.details);
    }

    done();
  });

  it('removes multiple dropps from the database at once', async (done) => {
    const dropps = [this.testDropp1, this.testDropp2];
    await DroppAccessor.bulkRemove(dropps);
    const dropp1 = await DroppAccessor.get(this.testDropp1.id);
    const dropp2 = await DroppAccessor.get(this.testDropp2.id);
    expect(dropp1).toBeNull();
    expect(dropp2).toBeNull();
    Log(testName, bulkRemoveTitle, [dropp1, dropp2]);
    done();
  });

  it('does not throw an error for a dropp without an ID', async (done) => {
    const originalId = this.testDropp1.id;
    this.testDropp1.id = null;
    const dropps = [this.testDropp1];
    await DroppAccessor.bulkRemove(dropps);
    const result = await DroppAccessor.get(originalId);
    expect(result).not.toBeNull();
    expect(result.id).toBe(originalId);
    Log(testName, bulkRemoveTitle, result);

    // Reset dropp ID
    this.testDropp1.id = originalId;
    done();
  });
});
