export const RecipeSkeleton = () => (
  <div className="space-y-3">
    {[0, 1, 2].map((i) => (
      <div key={i} className="bg-gradient-card rounded-3xl p-5 border border-border/60 shadow-soft">
        <div className="flex gap-4">
          <div className="h-16 w-16 rounded-2xl skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-3/4 rounded-full skeleton" />
            <div className="h-3 w-full rounded-full skeleton" />
            <div className="h-3 w-2/3 rounded-full skeleton" />
          </div>
        </div>
      </div>
    ))}
  </div>
);
