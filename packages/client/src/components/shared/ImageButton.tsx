export const ImageButton = ({
  image,
  activeImage,
  children,
  onClick,
  className,
}: {
  image: string;
  activeImage: string;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <button
      className={`relative overflow-hidden group ${className}`}
      onClick={onClick}
    >
      <img
        src={image}
        alt="button"
        draggable="false"
        className="absolute inset-0 w-full h-full object-fill pixel-images group-active:hidden"
      />
      <img
        src={activeImage}
        alt="button"
        draggable="false"
        className="hidden absolute inset-0 w-full h-full object-fill pixel-images group-active:block"
      />
      <span className="relative w-full h-full">{children}</span>
    </button>
  );
};
