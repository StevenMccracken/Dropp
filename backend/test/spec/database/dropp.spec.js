const Log = require('../../logger');
const Dropp = require('../../../src/models/Dropp');
const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');
const DroppAccessor = require('../../../src/database/dropp');

/**
 * Logs a message for a User Middleware test
 * @param {String} _title the describe label
 * @param {String|Object} _details the log details
 */
function log(_title, _details) {
  Log(`Dropp Accessor ${_title}`, _details);
}

Firebase.start(process.env.MOCK === '1');
const getDroppTitle = 'Get dropp';
/* eslint-disable no-undef */
describe(getDroppTitle, () => {
  beforeEach(async (done) => {
    this.testDropp = new Dropp({
      location: '0,0',
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
    delete this.testDropp;
    done();
  });

  it('returns null for the forbidden dropp', async (done) => {
    const dropp = await DroppAccessor.get(DroppAccessor.forbiddenDroppId);
    expect(dropp).toBeNull();
    log(getDroppTitle, dropp);
    done();
  });

  it('returns null for a non-existent dropp', async (done) => {
    const dropp = await DroppAccessor.get(Utils.newUuid());
    expect(dropp).toBeNull();
    log(getDroppTitle, dropp);
    done();
  });

  it('returns a dropp for a valid ID', async (done) => {
    const dropp = await DroppAccessor.get(this.testDropp.id);
    expect(dropp).toBeDefined();
    expect(dropp).not.toBeNull();
    expect(dropp.id).toBe(this.testDropp.id);
    expect(dropp.text).toBe(this.testDropp.text);
    expect(dropp.media).toBe(this.testDropp.media);
    expect(dropp.location).toBe(this.testDropp.location);
    expect(dropp.username).toBe(this.testDropp.username);
    expect(dropp.timestamp).toBe(this.testDropp.timestamp);
    log(getDroppTitle, dropp);
    done();
  });
});

const getAllDroppsTitle = 'Get all dropps';
describe(getAllDroppsTitle, () => {
  beforeEach(async (done) => {
    this.testDropp = new Dropp({
      location: '0,0',
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
    log(getAllDroppsTitle, dropps.length);
    done();
  });
});

const dropp1 = new Dropp({
  location: '0,0',
  media: 'false',
  text: 'test',
  timestamp: 1,
  username: 'test',
});

const dropp2 = new Dropp({
  location: '0,0',
  media: 'false',
  text: 'test',
  timestamp: 1,
  username: 'test',
});

const dropp3 = new Dropp({
  location: '0,0',
  media: 'false',
  text: 'test',
  timestamp: 1,
  username: 'test',
});

const addDroppTitle1 = 'Add dropp 1';
describe(addDroppTitle1, () => {
  it('adds a dropp to the database', async (done) => {
    await DroppAccessor.add(dropp1);
    expect(dropp1.id).toBeDefined();
    Log(addDroppTitle1, dropp1.id);
    done();
  }, 10000);
});

const addDroppTitle2 = 'Add dropp 2';
describe(addDroppTitle2, () => {
  it('adds a dropp to the database', async (done) => {
    await DroppAccessor.add(dropp2);
    expect(dropp2.id).toBeDefined();
    Log(addDroppTitle2, dropp2.id);
    done();
  }, 10000);
});

const addDroppTitle3 = 'Add dropp 3';
describe(addDroppTitle3, () => {
  it('adds a dropp to the database', async (done) => {
    await DroppAccessor.add(dropp3);
    expect(dropp3.id).toBeDefined();
    Log(addDroppTitle3, dropp3.id);
    done();
  }, 10000);
});

const getDroppTitle2 = 'Get dropp 1';
describe(getDroppTitle2, () => {
  it('gets the added dropp from the database', async (done) => {
    const retrievedDropp = await DroppAccessor.get(dropp1.id);
    expect(retrievedDropp).toBeDefined();
    expect(retrievedDropp.id).toBe(dropp1.id);
    Log(getDroppTitle2, retrievedDropp.id);
    done();
  }, 10000);
});

const getAllDroppsTitle2 = 'Get all dropps';
describe(getAllDroppsTitle2, () => {
  it('gets all the dropps from the database', async (done) => {
    const dropps = await DroppAccessor.getAll();
    expect(Array.isArray(dropps)).toBe(true);
    expect(dropps.length).not.toBeLessThan(3);
    Log(getAllDroppsTitle2, dropps.length);
    done();
  }, 10000);
});

const updateDroppTextTitle = 'Update dropp text';
describe(updateDroppTextTitle, () => {
  it('updates a dropp in the database with new text', async (done) => {
    await DroppAccessor.updateText(dropp1, 'test 2');
    Log(updateDroppTextTitle, dropp1.id);
    done();
  }, 10000);
});

const deleteDroppTitle = 'Delete dropp';
describe(deleteDroppTitle, () => {
  it('deletes a dropp from the database', async (done) => {
    await DroppAccessor.remove(dropp1);
    Log(deleteDroppTitle);
    done();
  }, 10000);
});

const deleteDroppBulkTitle = 'Delete dropps in bulk';
describe(deleteDroppBulkTitle, () => {
  it('deletes dropps from the database in bulk', async (done) => {
    await DroppAccessor.bulkRemove([dropp2, dropp3]);
    Log(deleteDroppBulkTitle);
    done();
  }, 10000);
});
/* eslint-enable no-undef */
