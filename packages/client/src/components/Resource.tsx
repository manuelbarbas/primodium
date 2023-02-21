function Resource({
  icon,
  name,
  quantity,
}: {
  icon: any;
  name: string;
  quantity: number;
}) {
  return (
    <div className="flex mb-1">
      <p className="w-24">{quantity.toLocaleString()}</p>
      <img className="w-4 h-4 my-auto" src={icon}></img>
      <p className=" ml-2 my-auto">{name}</p>
    </div>
  );
}

export default Resource;
