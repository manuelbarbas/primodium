function BuildingButton({ icon, text }: { icon: any; text: string }) {
  return (
    <button className="w-16 h-16 bg-green-600 text-xs">
      <img src={icon}></img>
      <div className="h-2"></div>
      {text}
    </button>
  );
}
export default BuildingButton;
