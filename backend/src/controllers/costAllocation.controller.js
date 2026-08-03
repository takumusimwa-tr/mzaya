const { CostAllocationRun, CostAllocationRule }=require('../models/associations');
const { runOrderCostAllocation }=require('../services/costAllocation.service');
async function list(req,res,next){try{const [runs,rules]=await Promise.all([CostAllocationRun.findAll({order:[['created_at','DESC']]}),CostAllocationRule.findAll({where:{status:'active'}})]);return res.json({runs,rules});}catch(e){return next(e);}}
async function run(req,res,next){try{return res.status(201).json({allocationRun:await runOrderCostAllocation({...req.body,startedBy:req.user.id})});}catch(e){return next(e);}}
module.exports={list,run};
