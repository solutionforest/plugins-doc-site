export default function DocsLoading() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-6xl">📖</div>

        <h1 className="text-2xl font-bold">Loading Documentation...</h1>

        <p className="text-muted-foreground">
          Please wait while we load the documentation content.
        </p>

        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div className="pt-4">
          <p className="text-sm text-muted-foreground">
            This may take a moment for large documentation pages.
          </p>
        </div>
      </div>
    </div>
  );
}