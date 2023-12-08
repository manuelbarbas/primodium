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
          <div>
            <img src={imageUri} alt={text} className={`pixel-images w-[1.5em] scale-200`} />
          </div>
        </Tooltip>
      )}

      {!tooltipText && <img src={imageUri} alt={text} className={`pixel-images w-[1.5em] scale-200`} />}

      {text && <span className="pl-2">{text}</span>}
    </span>
  );
};
