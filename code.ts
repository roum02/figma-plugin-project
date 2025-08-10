import { getNodes, getLocalVariables, getRenderedImages } from "./api/figma";

// Show the plugin UI
figma.showUI(__html__, { width: 360, height: 300 });

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
  if (msg.type === "poc-fetch") {
    const { token, fileKey, ids } = msg as {
      token: string;
      fileKey: string;
      ids: string[];
    };
    try {
      const [nodesRes, varsRes] = await Promise.all([
        getNodes({ token, fileKey, ids }),
        getLocalVariables({ token, fileKey }),
      ]);
      figma.ui.postMessage({
        type: "poc-result",
        ok: true,
        nodes: nodesRes,
        variables: varsRes,
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
