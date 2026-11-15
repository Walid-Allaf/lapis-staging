import { create } from "zustand";
const defaultConfirm: ConfirmState = {
  type: "success",
  message: "",
  isOpen: false,
  onConfirm: () => {},
  subTitle: "",
  content: "",
  onCancel: () => {},
};
export const useConfirmStore = create<ConfirmStore>((set) => ({
  confirm: { ...defaultConfirm },
  setConfirm: ({
    type,
    message,
    isOpen,
    onConfirm,
    subTitle,
    content,
    onCancel,
  }) =>
    set({
      confirm: {
        type,
        message,
        isOpen,
        onConfirm,
        subTitle,
        content,
        onCancel,
      },
    }),

  close: () =>
    set((state) => ({
      confirm: { ...state.confirm, isOpen: false },
    })),
}));

export type DialogType = "error" | "success" | "warning" | "info" | "validity" | "edit";

interface ConfirmState {
  type: DialogType;
  message: string;
  isOpen: boolean;
  subTitle?: string;
  content?: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ss {
  type: DialogType;
  message: string;
  isOpen: boolean;
  onConfirm: () => void;
  subTitle?: string;
  content?: React.ReactNode;
  onCancel?: () => void;
}
interface ConfirmStore {
  confirm: ConfirmState;
  setConfirm: (Props: ss) => void;
  close: () => void;
}
