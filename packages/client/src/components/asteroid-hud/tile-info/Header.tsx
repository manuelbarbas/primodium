const Header = ({ content }: { content: string }) => {
  return (
    <p className="flex items-center whitespace-nowrap px-1 mb-2 bg-gray-900 border-2 border-cyan-600 crt">
      <b>{content}</b>
    </p>
  );
};

export default Header;
