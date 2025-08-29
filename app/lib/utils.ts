import type { ClassValue } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs :ClassValue[]){
  return twMerge(clsx(inputs))
}

export const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

  //Determinate the appropriate unit by calculating the log
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  //Format with 2 decimal places and round
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + "" + sizes[i];
};

export const generateUUID = () => crypto.randomUUID();
