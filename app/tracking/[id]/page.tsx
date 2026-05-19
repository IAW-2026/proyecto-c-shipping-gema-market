export default function TrackingPage({ params }: { params: { id: string } }) {
  return (
    <main>
      <h1>Seguimiento del envío</h1>
      <p>ID: {params.id}</p>
    </main>
  );
}
