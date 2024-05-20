import { toast } from "react-toastify";

//TODO: Use notify here once core package is implemented
export const copyToClipboard = async (text: string, msgContent?: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // Display a message or handle the UI feedback
    toast.success(`Copied ${msgContent ?? text} to clipboard`);
  } catch (err) {
    toast.error(`Failed to copy ${msgContent ?? text} to clipboard`);
  }
};
