import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { errorMessage } from "@/lib/query/action";
import { UploadCancelled, uploadImage } from "../components/dashboard/upload-image";

type UploadVariables = { file: File; onProgress?: ((fraction: number) => void) | undefined };

export type UploadResult = { url: string } | { error: string } | { cancelled: true };

/**
 * Uploading photos from the Creator's device to R2, as a mutation. `upload`
 * resolves to each photo's own result (several can go up one after another,
 * so one mutation state can't hold them all). Anything still uploading is
 * cancelled when the caller unmounts, so leaving the page never adds a photo
 * to a form that's gone. Progress is the caller's display state, via `onProgress`.
 */
export function useImageUpload() {
  const controllers = useRef(new Set<AbortController>());
  useEffect(() => {
    const live = controllers.current;
    return () => live.forEach((c) => c.abort());
  }, []);

  const mutation = useMutation({
    mutationFn: async ({ file, onProgress }: UploadVariables) => {
      const controller = new AbortController();
      controllers.current.add(controller);
      try {
        return await uploadImage(file, { onProgress, signal: controller.signal });
      } finally {
        controllers.current.delete(controller);
      }
    },
  });

  return {
    upload: async (file: File, onProgress?: (fraction: number) => void): Promise<UploadResult> => {
      try {
        return { url: await mutation.mutateAsync({ file, onProgress }) };
      } catch (error) {
        return error instanceof UploadCancelled ? { cancelled: true } : { error: errorMessage(error) ?? "The upload didn't go through." };
      }
    },
    isUploading: mutation.isPending,
  };
}
