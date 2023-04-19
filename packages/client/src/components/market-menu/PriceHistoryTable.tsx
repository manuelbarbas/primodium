import React from "react";

interface TableProps {
  data: {
    date: string;
    price: number;
    quantity: number;
  }[];
}

const PriceHistoryTable: React.FC<TableProps> = ({ data }) => {
  return (
    <div className="h-36 mt-5 overflow-y-scroll">
      <table className="w-full">
        <thead className="sticky top-0 bg-gray-700">
          <tr className="">
            <th className="w-24 text-left pb-2">Date</th>
            <th className="w-24 text-left pb-2">Price</th>
            <th className="w-24 text-left pb-2">Quantity</th>
          </tr>
        </thead>
        <tbody className="">
          {data.map(({ date, price, quantity }) => (
            <tr key={date}>
              <td className="w-24 pb-1">{date}</td>
              <td className="w-24 pb-1">{price}</td>
              <td className="w-24 pb-1">{quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PriceHistoryTable;
