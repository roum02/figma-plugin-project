import { httpRequest } from "./http";
import type {
  FigmaGetNodesResponse,
  FigmaGetLocalVariablesResponse,
  FigmaGetFileImagesResponse,
  FigmaGetImagesResponse,
} from "../types/figma";

const V1 = "v1";

export async function getNodes(params: {
  token: string;
  fileKey: string;
  ids: string[];
  depth?: number;
  geometry?: "paths";
}): Promise<FigmaGetNodesResponse> {
  return httpRequest<FigmaGetNodesResponse>({
    token: params.token,
    path: `${V1}/files/${params.fileKey}/nodes`,
    query: {
      ids: params.ids.join(","),
      depth: params.depth,
      geometry: params.geometry,
    },
  });
}

export async function getLocalVariables(params: {
  token: string;
  fileKey: string;
}): Promise<FigmaGetLocalVariablesResponse> {
  return httpRequest<FigmaGetLocalVariablesResponse>({
    token: params.token,
    path: `${V1}/files/${params.fileKey}/variables/local`,
  });
}

export async function getFileImages(params: {
  token: string;
  fileKey: string;
}): Promise<FigmaGetFileImagesResponse> {
  return httpRequest<FigmaGetFileImagesResponse>({
    token: params.token,
    path: `${V1}/files/${params.fileKey}/images`,
  });
}

export async function getRenderedImages(params: {
  token: string;
  fileKey: string;
  ids: string[];
  scale?: number;
  format?: "jpg" | "png" | "svg" | "pdf";
  use_absolute_bounds?: boolean;
  version?: string;
}): Promise<FigmaGetImagesResponse> {
  return httpRequest<FigmaGetImagesResponse>({
    token: params.token,
    path: `${V1}/images/${params.fileKey}`,
    query: {
      ids: params.ids.join(","),
      scale: params.scale,
      format: params.format,
      use_absolute_bounds: params.use_absolute_bounds,
      version: params.version,
    },
  });
}
