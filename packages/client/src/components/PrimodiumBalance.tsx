function PrimodiumBalance({ balance }: { balance: number }) {
  return (
    <div className="flex">
      <div className="inline-block">
        <img
          className="w-6 h-6 mr-3"
          src={
            "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/600cc6ca-4f52-40e6-a83c-3bcd6e94e0ee/depbq7u-8d5c23aa-8eeb-435f-89c5-a87238cb052d.png"
          }
        ></img>
      </div>
      <div className="inline-block my-auto">{balance.toLocaleString()}</div>
    </div>
  );
}

export default PrimodiumBalance;
