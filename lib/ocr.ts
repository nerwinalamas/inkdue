import TextRecognition from "@react-native-ml-kit/text-recognition";
import { parseAmount } from "./parseAmount";
import { parseBillerName } from "./parseBillerName";
import { parseDueDate } from "./parseDueDate";

export type OcrResult = {
  billerName: string | null;
  amount: number | null;
  dueDate: string | null; // ISO "2025-06-10"
  rawText: string;
};

export async function extractBillInfo(imageUri: string): Promise<OcrResult> {
  const result = await TextRecognition.recognize(imageUri);
  const rawText = result.text ?? "";

  return {
    billerName: parseBillerName(rawText),
    amount: parseAmount(rawText),
    dueDate: parseDueDate(rawText),
    rawText,
  };
}
