import { useMemo } from 'react'

export default function useETA({
  pickupEtaMinutes,
  deliveryEtaMinutes,
  totalEtaMinutes,
}) {
  return useMemo(() => {
    const total = Number(totalEtaMinutes)
    const label = Number.isFinite(total)
      ? total <= 1
        ? 'About 1 min'
        : `About ${Math.ceil(total)} mins`
      : 'Calculating ETA'

    return {
      pickupEtaMinutes:
        pickupEtaMinutes == null ? null : Number(pickupEtaMinutes),
      deliveryEtaMinutes:
        deliveryEtaMinutes == null ? null : Number(deliveryEtaMinutes),
      totalEtaMinutes: Number.isFinite(total) ? total : null,
      label,
    }
  }, [pickupEtaMinutes, deliveryEtaMinutes, totalEtaMinutes])
}
