export default function ErrorMessage({ message = 'Something went wrong' }) {
  return (
    <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
      <p className="text-sm text-red-600">{message}</p>
    </div>
  )
}
