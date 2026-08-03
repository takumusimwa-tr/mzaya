const { OrderEconomics, ProfitabilitySnapshot }=require('../models/associations');
async function dashboard(req,res,next){try{const where=req.query.currency?{currency:req.query.currency}:undefined;const [orders,snapshots]=await Promise.all([OrderEconomics.findAll({where,order:[['completed_at','DESC']],limit:100}),ProfitabilitySnapshot.findAll({where,order:[['snapshot_date','DESC']],limit:200})]);return res.json({orders,snapshots});}catch(e){return next(e);}}
module.exports={dashboard};
