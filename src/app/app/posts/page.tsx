export default function PostsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-bold mb-6">My Posts</h1>
        
        <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground text-lg mb-2">
            Posts Placeholder
          </p>
          <p className="text-sm text-muted-foreground">
            Your posts will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
