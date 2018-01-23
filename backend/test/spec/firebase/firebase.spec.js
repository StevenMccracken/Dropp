const Log = require('../../logger');
const Firebase = require('../../../app/firebase/firebase');

/* eslint-disable no-undef */
const startFirebaseTitle = 'Start Firebase';
describe(startFirebaseTitle, () => {
  it('starts the Firebase module', (done) => {
    Firebase.start();
    expect(Firebase.hasStarted()).toBe(true);
    Log(startFirebaseTitle, Firebase.hasStarted());
    done();
  });
});

let dataKey;
const data = { key: 'value' };
const addData = 'Add data';
describe(addData, () => {
  it('adds data to firebase', async (done) => {
    const dataUrl = await Firebase.add('/test', data);
    expect(dataUrl).toBeDefined();

    dataKey = dataUrl.split('/').pop();
    expect(dataKey).toBeDefined();

    Log(addData, dataKey);
    done();
  }, 10000);
});

const getData = 'Get data';
describe(getData, () => {
  it('gets data from firebase', async (done) => {
    const retrievedData = await Firebase.get(`/test/${dataKey}`);
    expect(retrievedData).toBeDefined();
    expect(retrievedData.key).toBeDefined();
    expect(retrievedData.key).toEqual(data.key);
    Log(getData, retrievedData);
    done();
  }, 10000);
});

const updatedData = { key: 'updated value' };
const updateData = 'Update data';
describe(updateData, () => {
  it('updates data in firebase', async (done) => {
    await Firebase.update(`/test/${dataKey}`, updatedData);
    Log(updateData);
    done();
  }, 10000);
});

const getUpdatedData = 'Get updated data';
describe(getUpdatedData, () => {
  it('gets updated data from firebase', async (done) => {
    const retrievedData = await Firebase.get(`/test/${dataKey}`);
    expect(retrievedData).toBeDefined();
    expect(retrievedData.key).toBeDefined();
    expect(retrievedData.key).toEqual(updatedData.key);
    Log(getUpdatedData, retrievedData);
    done();
  }, 10000);
});

const deleteData = 'Delete data';
describe(deleteData, () => {
  it('deletes data from firebase', async (done) => {
    await Firebase.remove(`/test/${dataKey}`);
    Log(deleteData);
    done();
  }, 10000);
});

const getDeletedData = 'Get deleted data';
describe(getData, () => {
  it('attempts to get deleted data from firebase', async (done) => {
    const retrievedData = await Firebase.get(`/test/${dataKey}`);
    expect(retrievedData).toBe(null);
    Log(getDeletedData);
    done();
  }, 10000);
});

const invalidUrlThrows = 'Request invalid URL';
describe(invalidUrlThrows, () => {
  it('throws an error because the URL is invalid', async (done) => {
    let error;
    try {
      await Firebase.get('.$[]');
    } catch (getDataError) {
      error = getDataError;
    }

    expect(error).toBeDefined();
    expect(error.name).toBe('DroppError');
    Log(invalidUrlThrows, error);
    done();
  });
});
/* eslint-enable no-undef */
