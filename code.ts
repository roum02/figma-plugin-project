import { getNodes, getRenderedImages } from "./api/figma";

// Build-time injected constant
declare const __FIGMA_TOKEN__: string;

// Show the plugin UI
figma.showUI(__html__, { width: 360, height: 300 });

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === "poc-fetch") {
    const { fileKey, ids } = msg as {
      fileKey: string;
      ids: string[];
    };
    const effectiveToken = __FIGMA_TOKEN__ || "";
    try {
      const [nodesRes, imagesRes] = await Promise.all([
        getNodes({ token: effectiveToken, fileKey, ids }),
        getRenderedImages({
          token: effectiveToken,
          fileKey,
          ids,
          format: "png",
          scale: 2,
        }),
      ]);
      figma.ui.postMessage({
        type: "poc-result",
        ok: true,
        nodes: nodesRes,
        images: imagesRes,
      });
    } catch (err) {
      figma.ui.postMessage({
        type: "poc-result",
        ok: false,
        error: String(err),
      });
    }
  }

  if (msg.type === "close-plugin") {
    figma.closePlugin();
  }
};
