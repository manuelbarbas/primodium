function TechTreeItem({
  icon,
  name,
  description,
  resourcecost,
}: {
  icon: any;
  name: any;
  description: string;
  resourcecost: any;
}) {
  return (
    <div className="relative group w-24 pt-1 bg-gray-200 rounded shadow text-black mb-3 mr-3">
      <div className="mt-1 w-12 h-12 mx-auto">
        <img src={icon} className="w-12 h-12 mx-auto pixel-images"></img>
      </div>
      <button className="text-white font-bold h-8 w-20 inline-block m-2 bg-teal-600 text-xs py-2 rounded shadow">
        Research
      </button>
      <div className="research-tooltip group-hover:scale-100 mt-2">
        <div className="font-bold text-gray-900 text-sm"> {name}</div>
        <div className="mt-1 text-sm grid grid-cols-2">{resourcecost}</div>
        <div className="mt-1 text-xs">{description}</div>
      </div>
    </div>
  );
}

export default TechTreeItem;
