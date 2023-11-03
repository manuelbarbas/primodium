import { Tooltip } from "./Tooltip";

export const IconLabel: React.FC<{
  imageUri: string;
  text: string;
  hideText?: boolean;
  className?: string;
  tooltipText?: string;
  tooltipDirection?: "top" | "bottom" | "right" | "left";
}> = ({ imageUri, text, className, hideText = false, tooltipDirection = "right", tooltipText }) => {
  return (
    <span className={`${className} inline-flex items-center gap-2`}>
      <Tooltip text={tooltipText} direction={tooltipDirection}>
        <div>
          <img src={imageUri} alt={text} className={`pixel-images w-[1.5em] scale-200`} />
        </div>
      </Tooltip>

      {!hideText && <span>{text}</span>}
    </span>
  );
};
