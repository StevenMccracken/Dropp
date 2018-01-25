const Log = require('../../logger');
const Dropp = require('../../../app/models/Dropp');
const Utils = require('../../../app/utilities/utils');
const Firebase = require('../../../app/firebase/firebase');
const DroppAccessor = require('../../../app/database/dropp');

/* eslint-disable no-undef */
Firebase.start();

const getMissingDroppTitle = 'Get non-existent dropp';
describe(getMissingDroppTitle, () => {
  it('attempts to get a non-existent dropp from the database', async (done) => {
    const dropp = await DroppAccessor.get(Utils.newUuid());
    expect(dropp).toBe(null);
    Log(getMissingDroppTitle, `Non-existent dropp is ${dropp}`);
    done();
  }, 10000);
});

const dropp = new Dropp({
  location: '0,0',
  media: 'false',
  text: 'test',
  timestamp: 1,
  username: 'test',
});

const addDroppTitle = 'Add dropp';
describe(addDroppTitle, () => {
  it('adds a dropp to the database', async (done) => {
    await DroppAccessor.add(dropp);
    expect(dropp.id).toBeDefined();
    Log(addDroppTitle, dropp.id);
    done();
  }, 10000);
});

const updateDroppTextTitle = 'Update dropp text';
describe(updateDroppTextTitle, () => {
  it('updates a dropp in the database with new text', async (done) => {
    await DroppAccessor.updateText(dropp, 'test 2');
    Log(updateDroppTextTitle, dropp.id);
    done();
  }, 10000);
});

const deleteDroppTitle = 'Delete dropp';
describe(deleteDroppTitle, () => {
  it('deletes a dropp from the database', async (done) => {
    await DroppAccessor.remove(dropp);
    Log(deleteDroppTitle);
    done();
  }, 10000);
});
/* eslint-enable no-undef */
