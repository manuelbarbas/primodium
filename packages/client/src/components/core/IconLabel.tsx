import { Tooltip } from "./Tooltip";

export const IconLabel: React.FC<{
  imageUri: string;
  text?: string;
  hideText?: boolean;
  className?: string;
  tooltipText?: string;
  tooltipDirection?: "top" | "bottom" | "right" | "left";
}> = ({ imageUri, text, className, tooltipDirection = "right", tooltipText }) => {
  return (
    <span className={`${className} inline-flex items-center`}>
      {tooltipText && (
        <Tooltip text={tooltipText} direction={tooltipDirection}>
          <span>
            <img src={imageUri} alt={text} className={`pixel-images w-[1em] scale-150 `} />
          </span>
        </Tooltip>
      )}

      {!tooltipText && <img src={imageUri} alt={text} className={`pixel-images w-[1em] scale-150`} />}

      {text && <span className="pl-2">{text}</span>}
    </span>
  );
};
