const Log = require('../../logger');
const Utils = require('../../../app/utilities/utils');
const Firebase = require('../../../app/firebase/firebase');
const DroppAccessor = require('../../../app/database/dropp');

/* eslint-disable no-undef */
const startFirebaseTitle = 'Start Firebase';
describe(startFirebaseTitle, () => {
  it('starts the Firebase module', (done) => {
    Firebase.start();
    expect(Firebase.hasStarted()).toBe(true);
    Log(startFirebaseTitle, Firebase.hasStarted());
    done();
  }, 10000);
});

const getMissingDroppTitle = 'Get non-existent dropp';
describe(getMissingDroppTitle, () => {
  it('attempts to get a non-existent dropp from the database', async (done) => {
    const dropp = await DroppAccessor.get(Utils.newUuid());
    expect(dropp).toBe(null);
    Log(getMissingDroppTitle);
    done();
  }, 10000);
});

let droppId;
const data = {
  location: '0,0',
  media: 'false',
  text: 'test',
  timestamp: 1,
  username: 'test',
};

const addDroppTitle = 'Add dropp';
describe(addDroppTitle, () => {
  it('adds a dropp to the database', async (done) => {
    droppId = await DroppAccessor.add(data);
    expect(droppId).toBeDefined();
    Log(addDroppTitle, droppId);
    done();
  }, 10000);
});

const updateEntireDroppTitle = 'Update entire dropp';
describe(updateEntireDroppTitle, () => {
  it('updates a dropp in the database with entirely new data', async (done) => {
    await DroppAccessor.update(droppId, data);
    Log(updateEntireDroppTitle, droppId);
    done();
  }, 10000);
});

const updateDroppTextTitle = 'Update dropp text';
describe(updateDroppTextTitle, () => {
  it('updates a dropp in the database with new text', async (done) => {
    await DroppAccessor.updateText(droppId, 'test 2');
    Log(updateDroppTextTitle, droppId);
    done();
  }, 10000);
});

const deleteDroppTitle = 'Delete dropp';
describe(deleteDroppTitle, () => {
  it('deletes a dropp from the database', async (done) => {
    await DroppAccessor.remove(droppId);
    Log(deleteDroppTitle);
    done();
  }, 10000);
});
/* eslint-enable no-undef */
