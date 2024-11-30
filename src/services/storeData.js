const { Firestore } = require('@google-cloud/firestore');
 
async function storeData(id, data) {
  const db = new Firestore({keyFilename: 'service_account.json'});
 
  const predictCollection = db.collection('predictions');
  return predictCollection.doc(id).set(data);
}
 
module.exports = storeData;
