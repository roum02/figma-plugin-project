export type RGBA = { r: number; g: number; b: number; a?: number };

export type FigmaGetNodesResponse = {
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
  role: string;
  editorType: string;
  linkAccess: string;
  nodes: Record<string, unknown>; // PoC: 세부 타입은 추후 확장
};

export type FigmaGetLocalVariablesResponse = {
  status: number;
  error: boolean;
  meta: {
    variables: Record<
      string,
      {
        id: string;
        name: string;
        key: string;
        variableCollectionId: string;
        resolvedType: "BOOLEAN" | "FLOAT" | "STRING" | "COLOR";
        valuesByMode: Record<
          string,
          | boolean
          | number
          | string
          | RGBA
          | { type: "VARIABLE_ALIAS"; id: string }
        >;
        remote: boolean;
        description?: string;
        hiddenFromPublishing?: boolean;
      }
    >;
    variableCollections: Record<
      string,
      {
        id: string;
        name: string;
        key: string;
        modes: { modeId: string; name: string }[];
        defaultModeId: string;
        remote: boolean;
        hiddenFromPublishing?: boolean;
        variableIds: string[];
      }
    >;
  };
};

export type FigmaGetFileImagesResponse = {
  images: Record<string, string>;
};

export type FigmaGetImagesResponse = {
  err?: string;
  images?: Record<string, string | null>;
  status?: number;
};
