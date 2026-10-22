import { notFound } from "next/navigation";

// There is no public index: clients only reach the /p/<token> link they were sent.
export default function Home() {
  notFound();
}
