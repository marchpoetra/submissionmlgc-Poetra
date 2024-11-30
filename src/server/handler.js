const storeData = require('../services/storeData');
const predictClassification = require('../services/inferenceService');
const crypto = require('crypto');
 
async function postPredictHandler(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;
 
  const {label, suggestion } = await predictClassification(model, image);
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
 
  const data = {
    "id": id,
    "result": label,
    "suggestion": suggestion,
    "createdAt": createdAt
  }

  await storeData(id, data);
 
  const response = h.response({
    status: 'success',
    message: 'Model is predicted successfully',
    data
  })
  response.code(201);
  return response;
}

const { Firestore } = require('@google-cloud/firestore');

async function getHistoriesHandler(request, h) {
  try {
    const db = new Firestore({ keyFilename: 'service_account.json' });

    // Ambil semua data dari koleksi 'predictions'
    const predictionsRef = db.collection('predictions');
    const snapshot = await predictionsRef.get();

    if (snapshot.empty) {
      return h.response({
        status: 'success',
        message: 'No data found.',
        data: []
      }).code(200);
    }

    // Konversi data ke dalam array
    const data = [];
    snapshot.forEach(doc => {
      data.push({ id: doc.id, ...doc.data() });
    });

    // Kembalikan response sukses
    const response = h.response({
      status: 'success',
      data
    });
    response.code(200);
    return response;
  } catch (error) {
    console.error('Error retrieving histories:', error);
    return h.response({
      status: 'fail',
      message: 'Failed to retrieve histories.',
      error: error.message
    }).code(500);
  }
}
 
module.exports = {postPredictHandler, getHistoriesHandler};