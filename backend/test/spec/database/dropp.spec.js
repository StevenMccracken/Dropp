const Log = require('../../logger');
const Dropp = require('../../../src/models/Dropp');
const Utils = require('../../../src/utilities/utils');
const Firebase = require('../../../src/firebase/firebase');
const DroppAccessor = require('../../../src/database/dropp');

Firebase.start(process.env.MOCK === '1');
const getMissingDroppTitle = 'Get non-existent dropp';
/* eslint-disable no-undef */
describe(getMissingDroppTitle, () => {
  it('attempts to get a non-existent dropp from the database', async (done) => {
    const dropp = await DroppAccessor.get(Utils.newUuid());
    expect(dropp).toBeNull();
    Log(getMissingDroppTitle, `Non-existent dropp is ${dropp}`);
    done();
  }, 10000);
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

const getDroppTitle = 'Get dropp 1';
describe(getDroppTitle, () => {
  it('gets the added dropp from the database', async (done) => {
    const retrievedDropp = await DroppAccessor.get(dropp1.id);
    expect(retrievedDropp).toBeDefined();
    expect(retrievedDropp.id).toBe(dropp1.id);
    Log(getDroppTitle, retrievedDropp.id);
    done();
  }, 10000);
});

const getAllDroppsTitle = 'Get all dropps';
describe(getAllDroppsTitle, () => {
  it('gets all the dropps from the database', async (done) => {
    const dropps = await DroppAccessor.getAll();
    expect(Array.isArray(dropps)).toBe(true);
    expect(dropps.length).not.toBeLessThan(3);
    Log(getAllDroppsTitle, dropps.length);
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
