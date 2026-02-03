export default function HomeLoading() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-6xl">🏠</div>

        <h1 className="text-2xl font-bold">Loading Home Page...</h1>

        <p className="text-muted-foreground">
          Please wait while we load the home page content.
        </p>

        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            Welcome to Solution Forest Plugin Documentation!
          </p>
        </div>
      </div>
    </div>
  );
}