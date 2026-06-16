export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <div className="w-12 h-12 rounded-full border-4 border-green-100 border-t-green-600 animate-spin" />
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
