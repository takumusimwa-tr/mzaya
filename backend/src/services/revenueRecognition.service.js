const crypto=require('crypto');
const { sequelize }=require('../config/db');
const { RevenueSchedule, RecognizedRevenueEvent }=require('../models/associations');
async function recognizeRevenue({ revenueScheduleId, amountMinor, ledgerTransactionId=null }) {
  return sequelize.transaction(async transaction=>{
    const schedule=await RevenueSchedule.findByPk(revenueScheduleId,{transaction,lock:transaction.LOCK.UPDATE});
    if(!schedule){const e=new Error('Revenue schedule not found');e.status=404;throw e;}
    const remaining=Number(schedule.gross_minor)-Number(schedule.recognized_minor)-Number(schedule.reversed_minor);
    if(Number(amountMinor)>remaining){const e=new Error('Recognition exceeds remaining schedule balance');e.status=409;throw e;}
    const event=await RecognizedRevenueEvent.create({revenue_schedule_id:schedule.id,event_type:'recognition',amount_minor:amountMinor,currency:schedule.currency,ledger_transaction_id:ledgerTransactionId,event_reference:`REV-${crypto.randomUUID().toUpperCase()}`},{transaction});
    const recognized=Number(schedule.recognized_minor)+Number(amountMinor);
    await schedule.update({recognized_minor:recognized,deferred_minor:Math.max(0,Number(schedule.gross_minor)-recognized),status:recognized>=Number(schedule.gross_minor)?'recognized':'partially_recognized',recognition_date:new Date().toISOString().slice(0,10)},{transaction});
    return {schedule,event};
  });
}
async function reverseRevenue({ revenueScheduleId, amountMinor, ledgerTransactionId=null }) {
  return sequelize.transaction(async transaction=>{
    const schedule=await RevenueSchedule.findByPk(revenueScheduleId,{transaction,lock:transaction.LOCK.UPDATE});
    if(!schedule){const e=new Error('Revenue schedule not found');e.status=404;throw e;}
    if(Number(amountMinor)>Number(schedule.recognized_minor)){const e=new Error('Reversal exceeds recognized revenue');e.status=409;throw e;}
    const event=await RecognizedRevenueEvent.create({revenue_schedule_id:schedule.id,event_type:'reversal',amount_minor:-Math.abs(Number(amountMinor)),currency:schedule.currency,ledger_transaction_id:ledgerTransactionId,event_reference:`REVERSAL-${crypto.randomUUID().toUpperCase()}`},{transaction});
    await schedule.update({recognized_minor:Number(schedule.recognized_minor)-Number(amountMinor),reversed_minor:Number(schedule.reversed_minor)+Number(amountMinor),status:'reversed'},{transaction});
    return {schedule,event};
  });
}
module.exports={recognizeRevenue,reverseRevenue};
