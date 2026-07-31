export default function DeliveryCompleteCard({ order }) {
  return (
    <section className="rounded-3xl bg-emerald-950 p-6 text-white">
      <p className="text-sm font-semibold text-emerald-300">
        Delivery complete
      </p>
      <h2 className="mt-2 text-2xl font-semibold">
        Order #{String(order.id).slice(0, 8)} delivered
      </h2>
      <p className="mt-3 text-sm text-emerald-100">
        The customer and vendor have been updated. This delivery is now closed.
      </p>
    </section>
  )
}
