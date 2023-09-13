export const IconLabel: React.FC<{
  imageUri: string;
  text: string;
  hideText?: boolean;
}> = ({ imageUri, text, hideText = false }) => {
  return (
    <span className="inline-flex items-center gap-2">
      <img
        src={imageUri}
        alt={text}
        className=" pixel-images w-[1em] scale-150"
      />
      {!hideText && <span>{text}</span>}
    </span>
  );
};
