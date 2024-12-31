/**
 * MeshGouraudMaterial
 *
 * Lambert illumination model with Gouraud (per-vertex) shading
 */

import { ShaderMaterial, ShaderMaterialParameters } from "three";

export class MeshGouraudMaterial extends ShaderMaterial {
    isMeshGouraudMaterial: true;
    type: "MeshGouraudMaterial";

    constructor(parameters?: ShaderMaterialParameters);

    copy(source: MeshGouraudMaterial): this;
}
