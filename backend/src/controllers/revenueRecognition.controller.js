const { RevenueSchedule }=require('../models/associations');
const { recognizeRevenue, reverseRevenue }=require('../services/revenueRecognition.service');
async function list(req,res,next){try{return res.json({schedules:await RevenueSchedule.findAll({order:[['created_at','DESC']],limit:Math.min(Number(req.query.limit)||100,300)})});}catch(e){return next(e);}}
async function recognize(req,res,next){try{return res.json(await recognizeRevenue({revenueScheduleId:req.params.scheduleId,amountMinor:req.body.amountMinor,ledgerTransactionId:req.body.ledgerTransactionId}));}catch(e){return next(e);}}
async function reverse(req,res,next){try{return res.json(await reverseRevenue({revenueScheduleId:req.params.scheduleId,amountMinor:req.body.amountMinor,ledgerTransactionId:req.body.ledgerTransactionId}));}catch(e){return next(e);}}
module.exports={list,recognize,reverse};
