import { FaEthereum } from "react-icons/fa";

function ResourcePrice({
  price,
  currency,
}: {
  price: number;
  currency: string;
}) {
  return (
    <div className="flex items-center text-3xl">
      {currency === "Ethereum" ? (
        <FaEthereum />
      ) : currency === "Primodium" ? (
        <img
          className="w-8 h-8"
          src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/600cc6ca-4f52-40e6-a83c-3bcd6e94e0ee/depbq7u-8d5c23aa-8eeb-435f-89c5-a87238cb052d.png"
          alt="Primodium"
        />
      ) : null}
      <span className="ml-2">{price}</span>
    </div>
  );
}

export default ResourcePrice;
