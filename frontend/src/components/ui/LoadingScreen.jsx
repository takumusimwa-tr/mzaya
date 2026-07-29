import MzayaIcon from '../brand/MzayaIcon'

export default function LoadingScreen({ message = 'Getting Mzaya ready...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-8">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-[28px] bg-green-200/60 blur-xl animate-pulse" />
        <div className="relative rounded-[28px] shadow-lg overflow-hidden animate-[mzaya-float_1.8s_ease-in-out_infinite]">
          <MzayaIcon size={88} bg="#00A651" />
        </div>
      </div>
      <p className="text-sm font-semibold text-gray-700">{message}</p>
      <div className="mt-4 flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((dot) => <span key={dot} className="h-2 w-2 rounded-full bg-green-600 animate-bounce" style={{ animationDelay: `${dot * 120}ms` }} />)}
      </div>
    </div>
  )
}
