const {
  submitDeliveryProof,
  getDeliveryProof,
} = require('../services/deliveryProof.service');

async function submit(req, res, next) {
  try {
    const result = await submitDeliveryProof({
      orderId: req.params.orderId,
      riderUserId: req.user.id,
      proofType: req.body.proof_type,
      recipientName: req.body.recipient_name,
      recipientPhone: req.body.recipient_phone,
      otpVerified: req.body.otp_verified,
      photoUrl: req.body.photo_url,
      signatureUrl: req.body.signature_url,
      notes: req.body.notes,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
    });

    return res.status(201).json({
      message: 'Delivery completed',
      order: result.order,
      proof: result.proof,
    });
  } catch (error) {
    return next(error);
  }
}

async function read(req, res, next) {
  try {
    const proof = await getDeliveryProof({
      orderId: req.params.orderId,
      requester: req.user,
    });

    return res.status(200).json({ proof });
  } catch (error) {
    return next(error);
  }
}

module.exports = { submit, read };
