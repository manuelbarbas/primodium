export const IconLabel: React.FC<{
  imageUri: string;
  text?: string;
  hideText?: boolean;
  className?: string;
}> = ({ imageUri, text, className, hideText }) => {
  return (
    <span className={`${className} inline-flex items-center`}>
      <img src={imageUri} alt={text} className={`pixel-images w-[1em] scale-150`} draggable="false" />
      {text && !hideText && <span className="w-fit px-2">{text}</span>}
    </span>
  );
};
