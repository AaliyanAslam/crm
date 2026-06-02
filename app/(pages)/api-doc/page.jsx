import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./ReactSwagger";

export default async function ApiDocPage() {
  const spec = await getApiDocs();
  return (
    <section className="container mx-auto py-10">
      <ReactSwagger spec={spec} />
    </section>
  );
}