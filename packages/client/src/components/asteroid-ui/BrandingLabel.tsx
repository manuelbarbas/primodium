const params = new URLSearchParams(window.location.search);

export const BrandingLabel = () => {
  return (
    <div className="fixed bottom-0 right-0 bg-gray-900 text-xs text-white font-mono px-2">
      Primodium {params.get("version") ?? ""}{" "}
      {import.meta.env.PRI_VERCEL_GIT_COMMIT_SHA ? import.meta.env.PRI_VERCEL_GIT_COMMIT_SHA.slice(0, 7) : ""}
    </div>
  );
};
