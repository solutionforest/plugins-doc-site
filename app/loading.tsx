export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-6xl">⏳</div>

        <h1 className="text-2xl font-bold">Loading...</h1>

        <p className="text-muted-foreground">
          Please wait while we load the content.
        </p>

        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>
  );
}