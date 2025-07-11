export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
      <p className="mt-2 text-lg">Sorry, we couldn\'t find that page.</p>
      <a href="/" className="mt-4 text-blue-600 underline">
        Go back home
      </a>
    </div>
  );
}
