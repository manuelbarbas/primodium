const params = new URLSearchParams(window.location.search);

export const BrandingLabel = () => {
  return (
    <div className="bg-gray-900 text-xs text-white px-2">
      {params.get("version") ?? ""}{" "}
      {import.meta.env.PRI_VERCEL_GIT_COMMIT_SHA ? import.meta.env.PRI_VERCEL_GIT_COMMIT_SHA.slice(0, 7) : ""}
    </div>
  );
};
