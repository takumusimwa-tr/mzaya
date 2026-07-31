/**
 * Patch example for CurrentDelivery.jsx.
 *
 * Add:
 * import DeliveryProofDialog from '../../components/delivery/DeliveryProofDialog'
 * import DeliveryCompleteCard from '../../components/delivery/DeliveryCompleteCard'
 * import useDeliveryProof from '../../hooks/useDeliveryProof'
 *
 * Inside the component:
 *
 * const [proofOpen, setProofOpen] = useState(false)
 * const deliveryProof = useDeliveryProof(order?.id)
 *
 * async function completeDelivery(payload) {
 *   const data = await deliveryProof.submit(payload)
 *   setOrder(data.order)
 *   setProofOpen(false)
 * }
 *
 * Replace the direct `delivered` transition button with:
 *
 * <button
 *   onClick={() => setProofOpen(true)}
 *   className="w-full rounded-xl bg-emerald-800 px-4 py-3 font-semibold text-white"
 * >
 *   Complete delivery
 * </button>
 *
 * Render near the page root:
 *
 * <DeliveryProofDialog
 *   open={proofOpen}
 *   submitting={deliveryProof.submitting}
 *   onSubmit={completeDelivery}
 *   onClose={() => setProofOpen(false)}
 * />
 *
 * When order.status === 'delivered', render:
 *
 * <DeliveryCompleteCard order={order} />
 */
