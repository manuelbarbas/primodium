export default function ResourceIconTooltip({
  image,
  resourceId,
  name,
  amount,
}: {
  image: string;
  resourceId: string;
  name: string;
  amount: string;
}) {
  return (
    <div className="outline">
      <div className="building-tooltip group-hover:scale-100">{name}</div>
      <div className="mr-2" key={resourceId}>
        <img src={image} className="w-4 h-4 inline-block mr-1 pixel-images" />
        {amount}
      </div>
    </div>
  );
}
