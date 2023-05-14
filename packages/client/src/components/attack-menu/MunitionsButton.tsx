function MunitionsButton({
  icon,
  quantity,
}: {
  icon: string;
  quantity: number;
}) {
  return (
    <button className="w-16 h-16 ">
      <img className="w-16 h-16 pixel-images" src={icon}></img>
      <div className="h-2"></div>
      {quantity}
    </button>
  );
}

export default MunitionsButton;
