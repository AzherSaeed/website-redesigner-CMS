import JSZip from "jszip";
import type { ProjectFiles } from "@wr/assembler";

export async function zipProject(files: ProjectFiles): Promise<Buffer> {
  const zip = new JSZip();
  for (const [path, contents] of Object.entries(files)) {
    zip.file(path, contents);
  }
  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
